import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../libs/db.js';
import { resetSerialSequence } from '../libs/sequence.js';
import { createAccount, findAccountByEmail, findAccountById } from '../models/User.js';

const ACCESS_TOKEN_TTL = '1h';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_COOKIE_NAME = 'refreshToken';
const CUSTOMER_ACCOUNT_TYPE = 'khach_hang';
const CUSTOMER_ROLE_ID = 3;
const isProduction = process.env.NODE_ENV === 'production';

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

const signAccessToken = (account) =>
  jwt.sign(
    {
      maTaiKhoan: account.maTaiKhoan,
      email: account.email,
      loaiTaiKhoan: account.loaiTaiKhoan,
      maKhachHang: account.maKhachHang,
      maNhanVien: account.maNhanVien,
      maQuanLy: account.maQuanLy,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

const signRefreshToken = (account) =>
  jwt.sign(
    {
      maTaiKhoan: account.maTaiKhoan,
    },
    process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );

const sendAuthResponse = (res, account, status = 200) => {
  const accessToken = signAccessToken(account);
  const refreshToken = signRefreshToken(account);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  return res.status(status).json({ account: normalizeAccount(account), accessToken });
};

const normalizeAccount = (account) => {
  const { matKhauHash, ...safeAccount } = account;
  return safeAccount;
};

export const signUp = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      email,
      password,
      loaiTaiKhoan = CUSTOMER_ACCOUNT_TYPE,
      ten,
      tenThanhVien,
      soDienThoai,
      diaChi,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Thieu email hoac password' });
    }

    if (loaiTaiKhoan !== CUSTOMER_ACCOUNT_TYPE) {
      return res.status(403).json({ message: 'Chi cho phep dang ky tai khoan khach hang' });
    }

    const existing = await findAccountByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email da ton tai' });
    }

    await client.query('begin');
    await resetSerialSequence(client, 'KhachHang', 'maKhachHang');

    const displayName = ten || tenThanhVien || email;
    const result = await client.query(
      'insert into "KhachHang" ("tenKhachHang", "soDienThoai", "email", "diaChi", "maQuyen") values ($1, $2, $3, $4, $5) returning "maKhachHang"',
      [displayName, soDienThoai || null, email, diaChi || null, CUSTOMER_ROLE_ID]
    );
    const owner = { maKhachHang: result.rows[0].maKhachHang };

    const matKhauHash = await bcrypt.hash(password, 10);
    const account = await createAccount(client, {
      email,
      matKhauHash,
      loaiTaiKhoan: CUSTOMER_ACCOUNT_TYPE,
      ...owner,
    });

    await client.query('commit');

    return sendAuthResponse(res, account, 201);
  } catch (error) {
    await client.query('rollback');
    console.error('Sign up failed', error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Thieu email hoac password' });
    }

    const account = await findAccountByEmail(email);
    if (!account) {
      return res.status(401).json({ message: 'Email hoac password khong chinh xac' });
    }

    const passwordCorrect = await bcrypt.compare(password, account.matKhauHash);
    if (!passwordCorrect) {
      return res.status(401).json({ message: 'Email hoac password khong chinh xac' });
    }

    return sendAuthResponse(res, account);
  } catch (error) {
    console.error('Sign in failed', error);
    return res.status(500).json({ message: error.message });
  }
};

export const authMe = async (req, res) => {
  return res.json({ account: normalizeAccount(req.account) });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Thieu mat khau hien tai hoac mat khau moi' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Mat khau moi phai co it nhat 6 ky tu' });
    }

    const account = await findAccountById(req.account.maTaiKhoan);
    if (!account) {
      return res.status(404).json({ message: 'Khong tim thay tai khoan' });
    }

    const passwordCorrect = await bcrypt.compare(currentPassword, account.matKhauHash);
    if (!passwordCorrect) {
      return res.status(401).json({ message: 'Mat khau hien tai khong chinh xac' });
    }

    const samePassword = await bcrypt.compare(newPassword, account.matKhauHash);
    if (samePassword) {
      return res.status(400).json({ message: 'Mat khau moi phai khac mat khau hien tai' });
    }

    const matKhauHash = await bcrypt.hash(newPassword, 10);
    await pool.query('update "TaiKhoan" set "matKhauHash" = $1 where "maTaiKhoan" = $2', [
      matKhauHash,
      account.maTaiKhoan,
    ]);

    return res.json({ message: 'Doi mat khau thanh cong' });
  } catch (error) {
    console.error('Change password failed', error);
    return res.status(500).json({ message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: 'Thieu refresh token' });
    }

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET
    );

    const account = decoded.maTaiKhoan ? await findAccountById(decoded.maTaiKhoan) : null;
    if (!account) {
      return res.status(401).json({ message: 'Refresh token khong hop le' });
    }

    return sendAuthResponse(res, account);
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token het han hoac khong hop le' });
  }
};

export const logout = (_req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...refreshCookieOptions,
    maxAge: undefined,
  });
  return res.json({ message: 'Logged out successfully' });
};
