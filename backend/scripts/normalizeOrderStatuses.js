import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

try {
  await pool.query(`
    update "DonHang"
    set "trangThai" = case "trangThai"
      when 'Moi tao' then 'Mới tạo'
      when 'Dang xu ly' then 'Đang xử lý'
      when 'Dang giao' then 'Đang giao'
      when 'Hoan thanh' then 'Hoàn thành'
      when 'Da huy' then 'Đã hủy'
      when 'Chua cap nhat' then 'Chưa cập nhật'
      else "trangThai"
    end
    where "trangThai" in ('Moi tao', 'Dang xu ly', 'Dang giao', 'Hoan thanh', 'Da huy', 'Chua cap nhat')
  `);
  console.log('Normalized order statuses');
} finally {
  await pool.end();
}
