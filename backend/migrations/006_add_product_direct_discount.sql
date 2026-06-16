-- Add direct discount columns to SanPham
-- giamGia: direct discount percentage set from the product form (0-100)
-- ngayBatDauGiam, ngayKetThucGiam: validity dates for the direct discount
alter table "SanPham"
  add column if not exists "giamGia" numeric default 0 check ("giamGia" >= 0 and "giamGia" <= 100),
  add column if not exists "ngayBatDauGiam" date,
  add column if not exists "ngayKetThucGiam" date;
