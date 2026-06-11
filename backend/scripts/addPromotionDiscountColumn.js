import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

try {
  await pool.query(`
    alter table "KhuyenMai"
    add column if not exists "phanTramGiam" numeric not null default 0
  `);

  await pool.query(`
    do $$
    begin
      if not exists (
        select 1
        from pg_constraint
        where conname = 'chk_khuyenmai_phantramgiam'
      ) then
        alter table "KhuyenMai"
        add constraint chk_khuyenmai_phantramgiam
        check ("phanTramGiam" >= 0 and "phanTramGiam" <= 100);
      end if;
    end $$;
  `);

  await pool.query(`
    update "KhuyenMai"
    set "phanTramGiam" = replace(substring("tenKhuyenMai" from '([0-9]+(?:[.,][0-9]+)?)\\s*%'), ',', '.')::numeric
    where "phanTramGiam" = 0
      and substring("tenKhuyenMai" from '([0-9]+(?:[.,][0-9]+)?)\\s*%') is not null
  `);

  console.log('Added KhuyenMai.phanTramGiam column');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
