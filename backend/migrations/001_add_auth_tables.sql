create table if not exists "TaiKhoan" (
  "maTaiKhoan" serial primary key,
  "email" varchar(255) not null unique,
  "matKhauHash" varchar(255) not null,
  "loaiTaiKhoan" varchar(20) not null,
  "maKhachHang" integer references "KhachHang"("maThanhVien") on delete cascade,
  "maNhanVien" integer references "NhanVien"("maNhanVien") on delete cascade,
  "createdAt" timestamp without time zone default current_timestamp,
  "updatedAt" timestamp without time zone default current_timestamp,
  constraint "TaiKhoan_loaiTaiKhoan_check"
    check ("loaiTaiKhoan" in ('khach_hang', 'nhan_vien', 'quan_ly')),
  constraint "TaiKhoan_owner_check"
    check (
      ("maKhachHang" is not null and "maNhanVien" is null)
      or ("maKhachHang" is null and "maNhanVien" is not null)
    )
);

create unique index if not exists "TaiKhoan_maKhachHang_unique"
  on "TaiKhoan"("maKhachHang")
  where "maKhachHang" is not null;

create unique index if not exists "TaiKhoan_maNhanVien_unique"
  on "TaiKhoan"("maNhanVien")
  where "maNhanVien" is not null;
