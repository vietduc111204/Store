import pool from '../src/libs/db.js';

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('begin');

    await client.query(`alter table "SanPham" alter column "anh" type text`);
    console.log('✓ SanPham.anh → TEXT');

    await client.query(`alter table "SanPham" alter column "anhPhu" type text`);
    console.log('✓ SanPham.anhPhu → TEXT');

    await client.query('commit');
    console.log('Migration hoàn thành.');
  } catch (error) {
    await client.query('rollback');
    console.error('Migration thất bại:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

run();
