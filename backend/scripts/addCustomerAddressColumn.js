import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

try {
  await pool.query('alter table "KhachHang" add column if not exists "diaChi" varchar(255)');
  console.log('Added KhachHang.diaChi column if it did not exist');
} finally {
  await pool.end();
}
