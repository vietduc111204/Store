import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const columns = await pool.query(`
    select column_name, data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'NhanVien'
    order by ordinal_position
  `);

  const constraints = await pool.query(`
    select
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name as foreign_table_name,
      ccu.column_name as foreign_column_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
      and tc.table_schema = kcu.table_schema
    join information_schema.constraint_column_usage ccu
      on ccu.constraint_name = tc.constraint_name
      and ccu.table_schema = tc.table_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
      and (
        tc.table_name = 'NhanVien'
        or ccu.table_name = 'NhanVien'
      )
    order by tc.table_name, tc.constraint_name
  `);

  console.log('NhanVien columns:');
  console.table(columns.rows);
  console.log('Foreign keys involving NhanVien:');
  console.table(constraints.rows);
} finally {
  await pool.end();
}
