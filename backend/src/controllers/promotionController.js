import pool from '../libs/db.js';
import { resetSerialSequence } from '../libs/sequence.js';
import { createCrudHandlers } from './crudController.js';

const promotionConfig = {
  table: 'KhuyenMai',
  pk: 'maKhuyenMai',
  columns: ['tenKhuyenMai', 'phanTramGiam', 'ngayBatDau', 'ngayKetThuc'],
  required: ['tenKhuyenMai'],
  search: ['tenKhuyenMai'],
  orderBy: 'maKhuyenMai',
};

const promotionHandlers = createCrudHandlers(promotionConfig, 'Promotion');

export const listPromotions = promotionHandlers.list;
export const getPromotionById = promotionHandlers.getById;
export const deletePromotion = promotionHandlers.remove;

const normalizePromotionProductIds = (body) => {
  const rawIds = Array.isArray(body.maSanPhamApDung)
    ? body.maSanPhamApDung
    : String(body.maSanPhamApDung || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const ids = Array.from(new Set(rawIds.map((id) => Number(id))));
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new Error('Danh sách sản phẩm áp dụng không hợp lệ');
  }

  return ids;
};

const syncPromotionProducts = async (client, maKhuyenMai, productIds) => {
  await client.query(
    'update "SanPham" set "maKhuyenMai" = null where "maKhuyenMai" = $1',
    [maKhuyenMai]
  );

  if (!productIds.length) return;

  const result = await client.query(
    'update "SanPham" set "maKhuyenMai" = $1 where "maSanPham" = any($2::int[]) returning "maSanPham"',
    [maKhuyenMai, productIds]
  );

  if (result.rowCount !== productIds.length) {
    throw new Error('Có sản phẩm áp dụng không tồn tại');
  }
};

export const createPromotion = async (req, res) => {
  const client = await pool.connect();

  try {
    const productIds = normalizePromotionProductIds(req.body);
    await client.query('begin');
    await resetSerialSequence(client, 'KhuyenMai', 'maKhuyenMai');

    const result = await client.query(
      `insert into "KhuyenMai" ("tenKhuyenMai", "phanTramGiam", "ngayBatDau", "ngayKetThuc")
       values ($1, $2, $3, $4)
       returning *`,
      [
        req.body.tenKhuyenMai,
        req.body.phanTramGiam || 0,
        req.body.ngayBatDau || null,
        req.body.ngayKetThuc || null,
      ]
    );

    const promotion = result.rows[0];
    await syncPromotionProducts(client, promotion.maKhuyenMai, productIds);
    await client.query('commit');

    res.status(201).json(promotion);
  } catch (error) {
    await client.query('rollback');
    console.error('Create promotion failed', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const updatePromotion = async (req, res) => {
  const client = await pool.connect();

  try {
    const productIds = normalizePromotionProductIds(req.body);
    await client.query('begin');

    const result = await client.query(
      `update "KhuyenMai"
       set "tenKhuyenMai" = $1,
           "phanTramGiam" = $2,
           "ngayBatDau" = $3,
           "ngayKetThuc" = $4
       where "maKhuyenMai" = $5
       returning *`,
      [
        req.body.tenKhuyenMai,
        req.body.phanTramGiam || 0,
        req.body.ngayBatDau || null,
        req.body.ngayKetThuc || null,
        req.params.id,
      ]
    );

    if (!result.rowCount) {
      await client.query('rollback');
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }

    await syncPromotionProducts(client, req.params.id, productIds);
    await client.query('commit');

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('rollback');
    console.error('Update promotion failed', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const searchPromotions = async (req, res) => {
  try {
    const q = req.query.q?.toString().trim();
    const activeOnly = req.query.activeOnly === 'true';
    const values = [];
    const conditions = [];

    if (q) {
      values.push(`%${q}%`);
      conditions.push(`(km."maKhuyenMai"::text ilike $${values.length} or km."tenKhuyenMai" ilike $${values.length})`);
    }

    if (activeOnly) {
      conditions.push('(km."ngayBatDau" is null or km."ngayBatDau" <= current_date)');
      conditions.push('(km."ngayKetThuc" is null or km."ngayKetThuc" >= current_date)');
    }

    values.push(Math.min(Number(req.query.limit) || 100, 500));
    const where = conditions.length ? ` where ${conditions.join(' and ')}` : '';

    const result = await pool.query(
      `select km.*,
        (km."ngayBatDau" is null or km."ngayBatDau" <= current_date)
        and (km."ngayKetThuc" is null or km."ngayKetThuc" >= current_date) as "isActive",
        count(sp."maSanPham")::int as "soSanPhamApDung",
        coalesce(string_agg(sp."tenSanPham", ', ' order by sp."tenSanPham") filter (where sp."maSanPham" is not null), '') as "sanPhamApDung",
        coalesce(string_agg(sp."maSanPham"::text, ',' order by sp."maSanPham") filter (where sp."maSanPham" is not null), '') as "maSanPhamApDung"
       from "KhuyenMai" km
       left join "SanPham" sp on sp."maKhuyenMai" = km."maKhuyenMai"${where}
       group by km."maKhuyenMai"
       order by km."maKhuyenMai" desc limit $${values.length}`,
      values
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Search promotions failed', error);
    res.status(500).json({ message: error.message });
  }
};
