import { PayOS } from '@payos/node';
import pool from '../libs/db.js';

const payos = new PayOS({
  clientId: process.env.CLIENT_ID,
  apiKey: process.env.API_KEY,
  checksumKey: process.env.CHECKSUM_KEY,
});

export const createPaymentLink = async (req, res) => {
  const maDonHang = Number(req.body.maDonHang);
  if (!maDonHang || !Number.isInteger(maDonHang) || maDonHang <= 0) {
    return res.status(400).json({ message: 'Thiếu mã đơn hàng' });
  }

  try {
    const orderResult = await pool.query(
      'select "maDonHang", "tongGia" from "DonHang" where "maDonHang" = $1',
      [maDonHang]
    );
    if (!orderResult.rowCount) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const tongGia = Math.round(Number(orderResult.rows[0].tongGia));
    if (!Number.isFinite(tongGia) || tongGia < 1000) {
      return res.status(400).json({ message: 'Giá trị đơn hàng không hợp lệ' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const paymentLink = await payos.paymentRequests.create({
      orderCode: maDonHang,
      amount: tongGia,
      description: `DH${maDonHang}`,
      returnUrl: `${clientUrl}/thanh-cong`,
      cancelUrl: `${clientUrl}/gio-hang`,
    });

    res.json({ checkoutUrl: paymentLink.checkoutUrl });
  } catch (error) {
    console.error('Create payment link failed', error);
    res.status(500).json({ message: error.message });
  }
};

export const receiveWebhook = async (req, res) => {
  try {
    const webhookData = await payos.webhooks.verify(req.body);
    if (req.body.code === '00' && webhookData?.orderCode) {
      const client = await pool.connect();
      try {
        await client.query('begin');
        const updateResult = await client.query(
          `update "DonHang" set "trangThai" = $1
           where "maDonHang" = $2 and "trangThai" not in ($3, $4)
           returning "trangThai"`,
          ['Đã thanh toán', webhookData.orderCode, 'Đã hủy', 'Đã thanh toán']
        );

        // If the order was pending payment, deduct stock now
        if (updateResult.rowCount) {
          const details = await client.query(
            'select "maSanPham", "soLuong" from "ChiTietDonHang" where "maDonHang" = $1',
            [webhookData.orderCode]
          );
          for (const row of details.rows) {
            await client.query(
              'update "SanPham" set "soLuong" = "soLuong" - $1 where "maSanPham" = $2 and "soLuong" >= $1',
              [row.soLuong, row.maSanPham]
            );
          }
        }

        await client.query('commit');
      } catch (err) {
        await client.query('rollback');
        console.error('Webhook order update failed', err);
      } finally {
        client.release();
      }
    }
  } catch (error) {
    console.error('Webhook verification failed', error);
  }
  res.json({ code: '00', desc: 'success' });
};
