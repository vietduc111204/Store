import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const result = await pool.query(`
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
      and (
        column_name ilike '%TaiKhoans%'
        or column_name ilike '%Quanlis%'
        or column_name ilike '%TaiKhoan%'
        or column_name ilike '%Quanli%'
        or column_name ilike '%QuanLy%'
      )
    order by table_name, column_name
  `);

  const tables = await pool.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and (
        table_name ilike '%TaiKhoans%'
        or table_name ilike '%Quanlis%'
        or table_name ilike '%TaiKhoan%'
        or table_name ilike '%Quanli%'
        or table_name ilike '%QuanLy%'
      )
    order by table_name
  `);

  console.log('Columns:');
  console.table(result.rows);
  console.log('Tables:');
  console.table(tables.rows);
} finally {
  await pool.end();
}
