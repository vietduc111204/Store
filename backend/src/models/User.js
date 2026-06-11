import pool from '../libs/db.js';
import { resetSerialSequence } from '../libs/sequence.js';

const accountSelect = `
  tk."maTaiKhoan",
  tk."email",
  tk."matKhauHash",
  tk."loaiTaiKhoan",
  tk."maKhachHang",
  tk."maNhanVien",
  tk."maQuanLy",
  tk."createdAt",
  tk."updatedAt",
  kh."tenKhachHang" as "tenThanhVien",
  kh."soDienThoai" as "soDienThoaiKhachHang",
  kh."diaChi" as "diaChiKhachHang",
  nv."tenNhanVien",
  nv."soDienThoai" as "soDienThoaiNhanVien",
  nv."diaChi" as "diaChiNhanVien",
  ql."tenQuanLy",
  ql."soDienThoai" as "soDienThoaiQuanLy",
  ql."diaChi" as "diaChiQuanLy"
`;

const accountJoin = `
  from "TaiKhoan" tk
  left join "KhachHang" kh on kh."maKhachHang" = tk."maKhachHang"
  left join "NhanVien" nv on nv."maNhanVien" = tk."maNhanVien"
  left join "QuanLy" ql on ql."maQuanLy" = tk."maQuanLy"
`;

export const findAccountByEmail = async (email) => {
  try {
    const result = await pool.query(
      `select ${accountSelect} ${accountJoin} where lower(tk."email") = lower($1)`,
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('findAccountByEmail error:', error.message);
    throw error;
  }
};

export const findAccountById = async (maTaiKhoan) => {
  const result = await pool.query(
    `select ${accountSelect} ${accountJoin} where tk."maTaiKhoan" = $1`,
    [maTaiKhoan]
  );
  return result.rows[0] || null;
};

export const createAccount = async (client, account) => {
  await resetSerialSequence(client, 'TaiKhoan', 'maTaiKhoan');

  // Insert account
  const insertResult = await client.query(
    `insert into "TaiKhoan"
      ("email", "matKhauHash", "loaiTaiKhoan", "maKhachHang", "maNhanVien", "maQuanLy")
     values ($1, $2, $3, $4, $5, $6)
     returning "maTaiKhoan"`,
    [
      account.email,
      account.matKhauHash,
      account.loaiTaiKhoan,
      account.maKhachHang || null,
      account.maNhanVien || null,
      account.maQuanLy || null,
    ]
  );

  // Get full account info with joins
  const maTaiKhoan = insertResult.rows[0].maTaiKhoan;
  const fullAccount = await client.query(
    `select ${accountSelect} ${accountJoin} where tk."maTaiKhoan" = $1`,
    [maTaiKhoan]
  );

  return fullAccount.rows[0];
};
