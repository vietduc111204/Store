import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

try {
  await pool.query(`
    alter table "DonHang"
    add column if not exists "maKhuyenMai" integer
  `);

  await pool.query(`
    do $$
    begin
      if not exists (
        select 1
        from pg_constraint
        where conname = 'fk_donhang_khuyenmai'
      ) then
        alter table "DonHang"
        add constraint fk_donhang_khuyenmai
        foreign key ("maKhuyenMai") references "KhuyenMai"("maKhuyenMai")
        on delete set null;
      end if;
    end $$;
  `);

  console.log('Added DonHang.maKhuyenMai column');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
