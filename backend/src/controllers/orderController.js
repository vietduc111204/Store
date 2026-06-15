import pool from '../libs/db.js';
import { resetSerialSequence } from '../libs/sequence.js';
import { createCrudHandlers } from './crudController.js';

const orderConfig = {
  table: 'DonHang',
  pk: 'maDonHang',
  columns: ['tongGia', 'trangThai', 'maKhachHang', 'maKhuyenMai'],
  required: ['tongGia', 'maKhachHang'],
  search: ['trangThai'],
  orderBy: 'maDonHang',
  listSelect:
    'dh.*, kh."tenKhachHang" as "tenThanhVien", kh."email", kh."soDienThoai", km."tenKhuyenMai", km."phanTramGiam", km."ngayBatDau", km."ngayKetThuc"',
  listFrom:
    '"DonHang" dh left join "KhachHang" kh on kh."maKhachHang" = dh."maKhachHang" left join "KhuyenMai" km on km."maKhuyenMai" = dh."maKhuyenMai"',
  alias: 'dh',
};

const orderDetailConfig = {
  table: 'ChiTietDonHang',
  pk: ['maDonHang', 'maSanPham'],
  columns: ['maDonHang', 'maSanPham', 'soLuong', 'thanhTien'],
  required: ['maDonHang', 'maSanPham', 'soLuong', 'thanhTien'],
  search: [],
  orderBy: 'maDonHang',
  listSelect: 'ct.*, sp."tenSanPham", dh."trangThai"',
  listFrom:
    '"ChiTietDonHang" ct join "SanPham" sp on sp."maSanPham" = ct."maSanPham" join "DonHang" dh on dh."maDonHang" = ct."maDonHang"',
  alias: 'ct',
};

const orderHandlers = createCrudHandlers(orderConfig, 'Order');
const orderDetailHandlers = createCrudHandlers(orderDetailConfig, 'Order detail');
const CANCELLED_STATUS = 'Đã hủy';

export const listOrders = orderHandlers.list;
export const getOrderById = orderHandlers.getById;
export const deleteOrder = orderHandlers.remove;

const normalizeOrderItems = (body) => {
  if (Array.isArray(body.items) && body.items.length) return body.items;
  if (body.maSanPham && body.soLuong) {
    return [{ maSanPham: body.maSanPham, soLuong: body.soLuong }];
  }
  return [];
};

const aggregateOrderItems = (items) => {
  const itemMap = new Map();

  for (const item of items) {
    const maSanPham = Number(item.maSanPham);
    const soLuong = Number(item.soLuong);

    if (!Number.isInteger(maSanPham) || maSanPham <= 0) {
      throw new Error('Mã sản phẩm không hợp lệ');
    }
    if (!Number.isInteger(soLuong) || soLuong <= 0) {
      throw new Error('Số lượng không hợp lệ');
    }

    itemMap.set(maSanPham, (itemMap.get(maSanPham) || 0) + soLuong);
  }

  return Array.from(itemMap, ([maSanPham, soLuong]) => ({ maSanPham, soLuong }));
};

const calculateOrderItems = async (client, items) => {
  const details = [];

  for (const { maSanPham, soLuong } of aggregateOrderItems(items)) {
    const productResult = await client.query(
      `select sp."maSanPham", sp."tenSanPham", sp."gia", sp."soLuong",
        case when k."maKhuyenMai" is not null
          and (k."ngayBatDau" is null or k."ngayBatDau" <= current_date)
          and (k."ngayKetThuc" is null or k."ngayKetThuc" >= current_date)
        then coalesce(k."phanTramGiam", 0)::numeric else 0 end as "phanTramGiam"
       from "SanPham" sp
       left join "KhuyenMai" k on k."maKhuyenMai" = sp."maKhuyenMai"
       where sp."maSanPham" = $1
       for update of sp`,
      [maSanPham]
    );

    if (!productResult.rowCount) throw new Error(`Không tìm thấy sản phẩm ${maSanPham}`);

    const product = productResult.rows[0];
    const stock = Number(product.soLuong);
    if (!Number.isInteger(stock) || stock < soLuong) {
      throw new Error(`Sản phẩm ${product.tenSanPham || maSanPham} chỉ còn ${Math.max(stock || 0, 0)} trong kho`);
    }

    const gia = Number(product.gia);
    const phanTramGiam = Math.min(Math.max(Number(product.phanTramGiam) || 0, 0), 100);
    const thanhTien = Math.round(gia * soLuong * (100 - phanTramGiam)) / 100;

    details.push({ maSanPham, soLuong, thanhTien, phanTramGiam });
  }

  return details;
};

const orderHasProductDiscount = async (client, maDonHang) => {
  const result = await client.query(
    `select exists (
       select 1
       from "ChiTietDonHang" ct
       join "SanPham" sp on sp."maSanPham" = ct."maSanPham"
         join "KhuyenMai" km on km."maKhuyenMai" = sp."maKhuyenMai"
       where ct."maDonHang" = $1
         and coalesce(km."phanTramGiam", 0)::numeric > 0
         and (km."ngayBatDau" is null or km."ngayBatDau" <= current_date)
         and (km."ngayKetThuc" is null or km."ngayKetThuc" >= current_date)
     ) as "hasProductDiscount"`,
    [maDonHang]
  );

  return Boolean(result.rows[0]?.hasProductDiscount);
};

const getOrderDiscountPercent = async (client, maKhuyenMai) => {
  if (!maKhuyenMai) return 0;

  const result = await client.query(
    `select coalesce("phanTramGiam", 0)::numeric as "phanTramGiam"
     from "KhuyenMai"
     where "maKhuyenMai" = $1
       and ("ngayBatDau" is null or "ngayBatDau" <= current_date)
       and ("ngayKetThuc" is null or "ngayKetThuc" >= current_date)`,
    [maKhuyenMai]
  );

  if (!result.rowCount) throw new Error('Không tìm thấy khuyến mãi');
  return Math.min(Math.max(Number(result.rows[0].phanTramGiam) || 0, 0), 100);
};

const applyOrderDiscount = (details, phanTramGiam) => {
  if (!phanTramGiam) return details;
  return details.map((detail) => ({
    ...detail,
    thanhTien: Math.round(detail.thanhTien * (100 - phanTramGiam)) / 100,
  }));
};

const restoreOrderStock = async (client, maDonHang) => {
  const details = await client.query(
    'select "maSanPham", "soLuong" from "ChiTietDonHang" where "maDonHang" = $1',
    [maDonHang]
  );

  for (const detail of details.rows) {
    await client.query(
      'update "SanPham" set "soLuong" = "soLuong" + $1 where "maSanPham" = $2',
      [detail.soLuong, detail.maSanPham]
    );
  }
};

export const createOrder = async (req, res) => {
  const maKhachHang = req.body.maKhachHang;
  if (!maKhachHang) return res.status(400).json({ message: 'Thiếu mã khách hàng' });

  const items = normalizeOrderItems(req.body);
  if (!items.length && !req.body.tongGia) {
    return res.status(400).json({ message: 'Thiếu sản phẩm hoặc tổng giá' });
  }

  const client = await pool.connect();

  try {
    await client.query('begin');
    await resetSerialSequence(client, 'DonHang', 'maDonHang');

    const rawDetails = items.length ? await calculateOrderItems(client, items) : [];
    const maKhuyenMai = req.body.maKhuyenMai || null;

    const phanTramGiamDonHang = await getOrderDiscountPercent(client, maKhuyenMai);
    const details = applyOrderDiscount(rawDetails, phanTramGiamDonHang);
    const tongGia = details.length
      ? details.reduce((total, item) => total + item.thanhTien, 0)
      : Math.round(Number(req.body.tongGia) * (100 - phanTramGiamDonHang)) / 100;

    if (!Number.isFinite(tongGia) || tongGia < 0) {
      throw new Error('Tổng giá không hợp lệ');
    }

    const orderResult = await client.query(
      'insert into "DonHang" ("tongGia", "trangThai", "maKhachHang", "maKhuyenMai") values ($1, $2, $3, $4) returning *',
      [tongGia, req.body.trangThai || 'Mới tạo', maKhachHang, maKhuyenMai]
    );

    const order = orderResult.rows[0];

    for (const detail of details) {
      await client.query(
        'insert into "ChiTietDonHang" ("maDonHang", "maSanPham", "soLuong", "thanhTien") values ($1, $2, $3, $4)',
        [order.maDonHang, detail.maSanPham, detail.soLuong, detail.thanhTien]
      );
      const stockResult = await client.query(
        'update "SanPham" set "soLuong" = "soLuong" - $1 where "maSanPham" = $2 and "soLuong" >= $1',
        [detail.soLuong, detail.maSanPham]
      );
      if (!stockResult.rowCount) {
        throw new Error(`Sản phẩm ${detail.maSanPham} không đủ số lượng trong kho`);
      }
    }

    await client.query('commit');
    res.status(201).json({ ...order, chiTiet: details });
  } catch (error) {
    await client.query('rollback');
    console.error('Create order failed', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const updateOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const maKhuyenMai = req.body.maKhuyenMai || null;

    const columns = ['tongGia', 'trangThai', 'maKhachHang', 'maKhuyenMai'].filter((column) =>
      Object.prototype.hasOwnProperty.call(req.body, column)
    );

    if (!columns.length) return res.status(400).json({ message: 'Không có dữ liệu cập nhật' });

    const values = columns.map((column) => (req.body[column] === '' ? null : req.body[column]));
    const setSql = columns.map((column, index) => `"${column}" = $${index + 1}`).join(', ');
    const result = await client.query(
      `update "DonHang" set ${setSql} where "maDonHang" = $${values.length + 1} returning *`,
      [...values, req.params.id]
    );

    if (!result.rowCount) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order failed', error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const searchOrders = async (req, res) => {
  try {
    const q = req.query.q?.toString().trim();
    const values = [];
    const conditions = [];

    if (q) {
      values.push(`%${q}%`);
      conditions.push(`dh."maDonHang"::text ilike $${values.length}`);
    }

    if (req.query.maKhachHang) {
      values.push(req.query.maKhachHang);
      conditions.push(`dh."maKhachHang" = $${values.length}`);
    }

    values.push(Math.min(Number(req.query.limit) || 100, 500));
    const where = conditions.length ? `where ${conditions.join(' and ')}` : '';

    const result = await pool.query(
      `select dh.*, kh."tenKhachHang" as "tenThanhVien", kh."email", kh."soDienThoai", km."tenKhuyenMai", km."phanTramGiam", km."ngayBatDau", km."ngayKetThuc",
        exists (
          select 1
          from "ChiTietDonHang" ct
          join "SanPham" sp on sp."maSanPham" = ct."maSanPham"
          join "KhuyenMai" pkm on pkm."maKhuyenMai" = sp."maKhuyenMai"
          where ct."maDonHang" = dh."maDonHang"
            and coalesce(pkm."phanTramGiam", 0)::numeric > 0
            and (pkm."ngayBatDau" is null or pkm."ngayBatDau" <= current_date)
            and (pkm."ngayKetThuc" is null or pkm."ngayKetThuc" >= current_date)
        ) as "hasProductDiscount"
       from "DonHang" dh
       left join "KhachHang" kh on kh."maKhachHang" = dh."maKhachHang"
       left join "KhuyenMai" km on km."maKhuyenMai" = dh."maKhuyenMai"
       ${where}
       order by dh."maDonHang" desc
       limit $${values.length}`,
      values
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Search orders failed', error);
    res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('begin');
    const current = await client.query(
      'select "trangThai" from "DonHang" where "maDonHang" = $1 for update',
      [req.params.id]
    );

    if (!current.rowCount) {
      await client.query('rollback');
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if ((current.rows[0].trangThai || '').trim() !== CANCELLED_STATUS) {
      await restoreOrderStock(client, req.params.id);
    }

    const result = await client.query(
      'update "DonHang" set "trangThai" = $1 where "maDonHang" = $2 returning *',
      [CANCELLED_STATUS, req.params.id]
    );

    await client.query('commit');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('rollback');
    console.error('Cancel order failed', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const updateOrderStatus = async (req, res) => {
  const { trangThai } = req.body;
  if (!trangThai) return res.status(400).json({ message: 'Thiếu trạng thái' });

  const client = await pool.connect();

  try {
    await client.query('begin');
    const current = await client.query(
      'select "trangThai" from "DonHang" where "maDonHang" = $1 for update',
      [req.params.id]
    );

    if (!current.rowCount) {
      await client.query('rollback');
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (trangThai.trim() === CANCELLED_STATUS && (current.rows[0].trangThai || '').trim() !== CANCELLED_STATUS) {
      await restoreOrderStock(client, req.params.id);
    }

    const result = await client.query(
      'update "DonHang" set "trangThai" = $1 where "maDonHang" = $2 returning *',
      [trangThai, req.params.id]
    );

    await client.query('commit');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('rollback');
    console.error('Update order status failed', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const listOrderDetailsByOrder = async (req, res) => {
  try {
    const result = await pool.query(
      `select
        ct."maDonHang",
        ct."maSanPham",
        ct."soLuong",
        ct."thanhTien",
        sp."tenSanPham",
        sp."gia",
        sp."anh",
        km."tenKhuyenMai",
        case when km."maKhuyenMai" is not null
          and (km."ngayBatDau" is null or km."ngayBatDau" <= current_date)
          and (km."ngayKetThuc" is null or km."ngayKetThuc" >= current_date)
        then km."phanTramGiam" else 0 end as "phanTramGiam",
        km."ngayBatDau",
        km."ngayKetThuc"
       from "ChiTietDonHang" ct
       join "SanPham" sp on sp."maSanPham" = ct."maSanPham"
       left join "KhuyenMai" km on km."maKhuyenMai" = sp."maKhuyenMai"
       where ct."maDonHang" = $1
       order by ct."maSanPham"`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('List order details failed', error);
    res.status(500).json({ message: error.message });
  }
};

export const listOrderDetails = orderDetailHandlers.list;
export const getOrderDetailById = orderDetailHandlers.getById;
export const createOrderDetail = orderDetailHandlers.create;
export const updateOrderDetail = orderDetailHandlers.update;
export const deleteOrderDetail = orderDetailHandlers.remove;
