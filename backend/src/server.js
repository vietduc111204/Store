import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import pool, { connectDB } from './libs/db.js';
import authRoute from './routes/authRoute.js';
import databaseRoute from './routes/databaseRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: '20mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/api/auth', authRoute);
app.use('/api', databaseRoute);

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('select now()');
    res.json({ status: 'ok', now: result.rows[0].now, features: { promotionProductAssignments: true } });
  } catch (error) {
    console.error('DB health check failed:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

const applyMigrations = async () => {
  try {
    await pool.query(`
      alter table "SanPham"
        add column if not exists "giamGia" numeric default 0 check ("giamGia" >= 0 and "giamGia" <= 100),
        add column if not exists "ngayBatDauGiam" date,
        add column if not exists "ngayKetThucGiam" date
    `);
    await pool.query(`
      alter table "DonHang"
        add column if not exists "diaChiGiaoHang" text,
        add column if not exists "tenTinhThanh" text,
        add column if not exists "tenQuanHuyen" text,
        add column if not exists "tenPhuongXa" text,
        add column if not exists "maQuanHuyen" integer,
        add column if not exists "maPhuongXa" text,
        add column if not exists "phiVanChuyen" numeric default 0,
        add column if not exists "phuongThucThanhToan" text,
        add column if not exists "huyBoi" text
    `);
    await pool.query(`
      alter table "KhachHang"
        add column if not exists "tenTinhThanh" text,
        add column if not exists "tenQuanHuyen" text,
        add column if not exists "tenPhuongXa" text,
        add column if not exists "maTinhThanh" integer,
        add column if not exists "maQuanHuyen" integer,
        add column if not exists "maPhuongXa" text
    `);
    console.log('Migrations applied');
  } catch (error) {
    console.error('Migration failed', error);
  }
};

app.listen(PORT, async () => {
  try {
    await connectDB();
    await applyMigrations();
  } catch (error) {
    console.error('DB connection failed', error);
  }
  console.log(`Server is running on port ${PORT}`);
});
