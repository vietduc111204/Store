import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

const checkTables = async () => {
  const client = await pool.connect();

  try {
    console.log('Checking tables in Neon database...\n');

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (result.rows.length === 0) {
      console.log('Không có bảng nào trong database!');
      console.log('Cần chạy migrations trước.');
    } else {
      console.log('Bảng hiện có:');
      result.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`);
      });
    }
  } catch (error) {
    console.error('Lỗi kết nối:', error.message);
  } finally {
    client.release();
  }
};

checkTables();
