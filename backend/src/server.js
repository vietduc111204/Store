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

app.use(express.json());
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

app.listen(PORT, async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('DB connection failed', error);
  }
  console.log(`Server is running on port ${PORT}`);
});
