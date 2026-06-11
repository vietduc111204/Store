import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

try {
  const result = await pool.query('select * from "PhanQuyen" order by "maQuyen"');
  console.table(result.rows);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
