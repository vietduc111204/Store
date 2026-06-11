import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

const roles = [
  [1, 'Quản lý'],
  [2, 'Nhân viên'],
  [3, 'Khách hàng'],
];

try {
  for (const [maQuyen, tenQuyen] of roles) {
    await pool.query(
      'update "PhanQuyen" set "tenQuyen" = $1, "updatedAt" = current_timestamp where "maQuyen" = $2',
      [tenQuyen, maQuyen]
    );
  }

  const result = await pool.query('select * from "PhanQuyen" order by "maQuyen"');
  console.table(result.rows);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
