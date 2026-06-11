import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/findAccount.js <email>');
  process.exit(1);
}

try {
  const result = await pool.query(
    `
      select
        tk."maTaiKhoan",
        tk."email",
        tk."loaiTaiKhoan",
        tk."maKhachHang",
        kh."tenKhachHang",
        kh."soDienThoai",
        kh."maQuyen",
        pq."tenQuyen"
      from "TaiKhoan" tk
      left join "KhachHang" kh on kh."maKhachHang" = tk."maKhachHang"
      left join "PhanQuyen" pq on pq."maQuyen" = kh."maQuyen"
      where lower(tk."email") = lower($1)
    `,
    [email]
  );

  console.table(result.rows);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
