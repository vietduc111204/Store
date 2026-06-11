import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

try {
  await pool.query(`
    alter table "KhuyenMai"
    add column if not exists "ngayBatDau" date,
    add column if not exists "ngayKetThuc" date
  `);

  await pool.query(`
    do $$
    begin
      if not exists (
        select 1
        from pg_constraint
        where conname = 'chk_khuyenmai_thoihan'
      ) then
        alter table "KhuyenMai"
        add constraint chk_khuyenmai_thoihan
        check ("ngayBatDau" is null or "ngayKetThuc" is null or "ngayBatDau" <= "ngayKetThuc");
      end if;
    end $$;
  `);

  console.log('Added KhuyenMai.ngayBatDau and KhuyenMai.ngayKetThuc columns');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
