import PayOS from '@payos/node';
import pool from '../libs/db.js';

const payos = new PayOS(
  process.env.CLIENT_ID,
  process.env.API_KEY,
  process.env.CHECKSUM_KEY
);

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
    const paymentLink = await payos.createPaymentLink({
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

export const receiveWebhook = (req, res) => {
  try {
    const webhookData = payos.verifyPaymentWebhookData(req.body);
    if (webhookData.code === '00') {
      const maDonHang = webhookData.orderCode;
      pool
        .query(
          `update "DonHang" set "trangThai" = $1
           where "maDonHang" = $2 and "trangThai" not in ($3, $4)`,
          ['Đã thanh toán', maDonHang, 'Đã hủy', 'Đã thanh toán']
        )
        .catch((err) => console.error('Update order status from webhook failed', err));
    }
  } catch (error) {
    console.error('Webhook verification failed', error);
  }
  res.json({ code: '00', desc: 'success' });
};
