import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

const specsToText = (value) => {
  if (!value) return null;
  const text = String(value).trim();
  try {
    const specs = JSON.parse(text);
    if (!Array.isArray(specs)) return text;
    return specs
      .map((spec) => `${String(spec?.label || '').trim()}: ${String(spec?.value || '').trim()}`)
      .filter((line) => !line.startsWith(':') && !line.endsWith(': '))
      .join('\n') || null;
  } catch {
    return text || null;
  }
};

const imagesToText = (value) => {
  if (!value) return null;
  const text = String(value).trim();
  try {
    const images = JSON.parse(text);
    if (!Array.isArray(images)) return text;
    return images.map((image) => String(image || '').trim()).filter(Boolean).join('\n') || null;
  } catch {
    return text || null;
  }
};

try {
  await pool.query('alter table "SanPham" add column if not exists "thongSoKyThuat" varchar');
  await pool.query('alter table "SanPham" add column if not exists "anhPhu" varchar');
  await pool.query('alter table "SanPham" alter column "thongSoKyThuat" type varchar using "thongSoKyThuat"::text');
  await pool.query('alter table "SanPham" alter column "anhPhu" type varchar using "anhPhu"::text');
  const products = await pool.query('select "maSanPham", "thongSoKyThuat", "anhPhu" from "SanPham"');

  for (const product of products.rows) {
    await pool.query(
      'update "SanPham" set "thongSoKyThuat" = $1, "anhPhu" = $2 where "maSanPham" = $3',
      [specsToText(product.thongSoKyThuat), imagesToText(product.anhPhu), product.maSanPham]
    );
  }

  console.log('Ensured SanPham.thongSoKyThuat and SanPham.anhPhu are varchar columns.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
