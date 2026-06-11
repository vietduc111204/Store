import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

const passwordToCheck = process.argv[2] || process.env.TEST_ACCOUNT_PASSWORD || '';

if (!passwordToCheck) {
  console.error('Pass a password argument or set TEST_ACCOUNT_PASSWORD before running this script.');
  process.exit(1);
}

try {
  const result = await pool.query(`
    select
      "maTaiKhoan",
      "email",
      "matKhauHash",
      "loaiTaiKhoan",
      "maKhachHang",
      "maNhanVien",
      "maQuanLy",
      "createdAt"
    from "TaiKhoan"
    order by "maTaiKhoan"
  `);

  for (const account of result.rows) {
    const passwordMatches = await bcrypt.compare(passwordToCheck, account.matKhauHash);
    console.log(
      [
        account.maTaiKhoan,
        account.email,
        account.loaiTaiKhoan,
        `password=${passwordMatches}`,
        `kh=${account.maKhachHang ?? ''}`,
        `nv=${account.maNhanVien ?? ''}`,
        `ql=${account.maQuanLy ?? ''}`,
        account.createdAt?.toISOString?.() || account.createdAt,
      ].join('\t')
    );
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
