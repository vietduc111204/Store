import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const connectDB = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to database');
  } catch (error) {
    console.error('DB connection failed', error);
    throw error;
  }
};

export default pool;
