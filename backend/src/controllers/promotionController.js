import pool from '../libs/db.js';
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
export const createPromotion = promotionHandlers.create;
export const updatePromotion = promotionHandlers.update;
export const deletePromotion = promotionHandlers.remove;

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
        coalesce(string_agg(sp."tenSanPham", ', ' order by sp."tenSanPham") filter (where sp."maSanPham" is not null), '') as "sanPhamApDung"
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
