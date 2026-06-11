import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5001}`;
const email = `codex_auth_test_${Date.now()}@example.com`;
let maKhachHang = null;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const signup = await fetch(`${apiUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Test123456',
      loaiTaiKhoan: 'khach_hang',
      ten: 'Codex Auth Test',
      soDienThoai: '0900000000',
    }),
  });
  const signupBody = await signup.json();
  if (!signup.ok) throw new Error(`signup failed: ${JSON.stringify(signupBody)}`);

  const signin = await fetch(`${apiUrl}/api/auth/signin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test123456' }),
  });
  const signinBody = await signin.json();
  if (!signin.ok) throw new Error(`signin failed: ${JSON.stringify(signinBody)}`);

  const me = await fetch(`${apiUrl}/api/auth/me`, {
    headers: { authorization: `Bearer ${signinBody.accessToken}` },
  });
  const meBody = await me.json();
  if (!me.ok) throw new Error(`me failed: ${JSON.stringify(meBody)}`);

  maKhachHang = meBody.account.maKhachHang;
  console.log(
    JSON.stringify(
      {
        signup: signup.status,
        signin: signin.status,
        me: me.status,
        loaiTaiKhoan: meBody.account.loaiTaiKhoan,
        maKhachHang,
      },
      null,
      2
    )
  );
} finally {
  if (maKhachHang) {
    await pool.query('delete from "KhachHang" where "maThanhVien" = $1', [maKhachHang]);
  }
  await pool.end();
}
