alter table "TaiKhoan"
  add column if not exists "maQuanLy" integer references "QuanLy"("maQuanLy") on delete cascade;

drop index if exists "TaiKhoan_maQuanLy_unique";

create unique index if not exists "TaiKhoan_maQuanLy_unique"
  on "TaiKhoan"("maQuanLy")
  where "maQuanLy" is not null;

alter table "TaiKhoan"
  drop constraint if exists "TaiKhoan_owner_check";

alter table "TaiKhoan"
  add constraint "TaiKhoan_owner_check"
  check (
    (
      "loaiTaiKhoan" = 'khach_hang'
      and "maKhachHang" is not null
      and "maNhanVien" is null
      and "maQuanLy" is null
    )
    or (
      "loaiTaiKhoan" = 'nhan_vien'
      and "maKhachHang" is null
      and "maNhanVien" is not null
      and "maQuanLy" is null
    )
    or (
      "loaiTaiKhoan" = 'quan_ly'
      and "maKhachHang" is null
      and "maNhanVien" is null
      and "maQuanLy" is not null
    )
  );
