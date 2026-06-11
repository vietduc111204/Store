import bcrypt from 'bcrypt';
import pool from '../src/libs/db.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestAccount = async () => {
  const password = process.env.TEST_ACCOUNT_PASSWORD || '';

  if (!password) {
    console.error('Set TEST_ACCOUNT_PASSWORD before running this script.');
    process.exitCode = 1;
    return;
  }

  const client = await pool.connect();

  try {
    console.log('🚀 Tạo tài khoản test...\n');

    // Tạo KhachHang
    const khachHangResult = await client.query(
      `INSERT INTO "KhachHang" ("tenThanhVien", "soDienThoai", "email")
       VALUES ($1, $2, $3)
       RETURNING "maThanhVien"`,
      ['Nguyễn Văn A', '0123456789', 'test@example.com']
    );

    const maKhachHang = khachHangResult.rows[0].maThanhVien;
    console.log(`✅ Tạo KhachHang: ma=${maKhachHang}`);

    // Hash password
    const matKhauHash = await bcrypt.hash(password, 10);

    // Tạo TaiKhoan
    const taiKhoanResult = await client.query(
      `INSERT INTO "TaiKhoan" ("email", "matKhauHash", "loaiTaiKhoan", "maKhachHang")
       VALUES ($1, $2, $3, $4)
       RETURNING "maTaiKhoan", "email", "loaiTaiKhoan"`,
      ['test@example.com', matKhauHash, 'khach_hang', maKhachHang]
    );

    const account = taiKhoanResult.rows[0];
    console.log(`✅ Tạo TaiKhoan: ma=${account.maTaiKhoan}`);
    console.log(`   Email: ${account.email}`);
    console.log(`   Loại: ${account.loaiTaiKhoan}`);

    console.log(`✨ Bạn có thể signin với:`);
    console.log(`   Email: test@example.com`);
    console.log('   Password: value from TEST_ACCOUNT_PASSWORD');
  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️  Email đã tồn tại!');
    } else {
      console.error('❌ Lỗi:', error.message);
    }
  } finally {
    client.release();
  }
};

createTestAccount();
