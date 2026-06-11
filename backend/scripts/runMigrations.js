import fs from 'fs';
import path from 'path';
import pool from '../src/libs/db.js';
import dotenv from 'dotenv';

dotenv.config();

const runMigrations = async () => {
  const client = await pool.connect();

  try {
    console.log('🚀 Bắt đầu chạy migrations...\n');

    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        console.log(`⏳ Chạy: ${file}`);
        try {
          await client.query(sql);
          console.log(`   ✅ Thành công\n`);
        } catch (error) {
          console.log(`   ⚠️  Lỗi: ${error.message}\n`);
        }
      }
    }

    console.log('✨ Hoàn thành tất cả migrations!');

    // Kiểm tra các bảng được tạo
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📊 Các bảng trong database:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    client.release();
  }
};

runMigrations();
