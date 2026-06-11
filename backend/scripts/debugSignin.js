import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

const debugSignin = async () => {
  const email = process.env.DEBUG_EMAIL || 'test@example.com';
  const password = process.env.DEBUG_PASSWORD || '';

  if (!password) {
    console.error('Set DEBUG_PASSWORD before running this script.');
    process.exitCode = 1;
    return;
  }

  const client = await pool.connect();

  try {
    console.log('Debug signin...');
    console.log(`Checking account: ${email}`);

    const accountResult = await client.query(
      'SELECT * FROM "TaiKhoan" WHERE lower("email") = lower($1)',
      [email]
    );

    if (accountResult.rows.length === 0) {
      console.log('Account not found.');
      return;
    }

    const account = accountResult.rows[0];
    console.log('Found account:');
    console.log(`   maTaiKhoan: ${account.maTaiKhoan}`);
    console.log(`   email: ${account.email}`);
    console.log(`   loaiTaiKhoan: ${account.loaiTaiKhoan}`);

    const passwordCorrect = await bcrypt.compare(password, account.matKhauHash);
    console.log(`Password matches: ${passwordCorrect ? 'yes' : 'no'}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
};

debugSignin();
