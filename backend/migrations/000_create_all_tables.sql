-- 000_create_all_tables.sql
-- Tạo tất cả bảng theo thứ tự đúng (giải quyết dependencies)

-- 1. Tạo bảng PhanQuyen (không dependency)
CREATE TABLE IF NOT EXISTS "PhanQuyen" (
  "maQuyen" SERIAL PRIMARY KEY,
  "tenQuyen" VARCHAR(255) NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tạo bảng KhachHang (phụ thuộc vào PhanQuyen)
CREATE TABLE IF NOT EXISTS "KhachHang" (
  "maThanhVien" SERIAL PRIMARY KEY,
  "tenThanhVien" VARCHAR(255) NOT NULL,
  "soDienThoai" VARCHAR(20),
  "email" VARCHAR(255),
  "diaChi" VARCHAR(255),
  "maQuyen" INTEGER REFERENCES "PhanQuyen"("maQuyen") ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tạo bảng NhanVien (phụ thuộc vào PhanQuyen)
CREATE TABLE IF NOT EXISTS "NhanVien" (
  "maNhanVien" SERIAL PRIMARY KEY,
  "tenNhanVien" VARCHAR(255) NOT NULL,
  "soDienThoai" VARCHAR(20),
  "diaChi" VARCHAR(255),
  "maQuyen" INTEGER REFERENCES "PhanQuyen"("maQuyen") ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tạo bảng QuanLy (phụ thuộc vào NhanVien)
CREATE TABLE IF NOT EXISTS "QuanLy" (
  "maQuanLy" SERIAL PRIMARY KEY,
  "tenQuanLy" VARCHAR(255) NOT NULL,
  "soDienThoai" VARCHAR(20),
  "diaChi" VARCHAR(255),
  "maNhanVien" INTEGER REFERENCES "NhanVien"("maNhanVien") ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tạo bảng TaiKhoan (phụ thuộc vào KhachHang, NhanVien, QuanLy)
CREATE TABLE IF NOT EXISTS "TaiKhoan" (
  "maTaiKhoan" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "matKhauHash" VARCHAR(255) NOT NULL,
  "loaiTaiKhoan" VARCHAR(20) NOT NULL,
  "maKhachHang" INTEGER REFERENCES "KhachHang"("maThanhVien") ON DELETE CASCADE,
  "maNhanVien" INTEGER REFERENCES "NhanVien"("maNhanVien") ON DELETE CASCADE,
  "maQuanLy" INTEGER REFERENCES "QuanLy"("maQuanLy") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaiKhoan_loaiTaiKhoan_check" CHECK ("loaiTaiKhoan" IN ('khach_hang', 'nhan_vien', 'quan_ly')),
  CONSTRAINT "TaiKhoan_owner_check" CHECK (
    (
      "loaiTaiKhoan" = 'khach_hang'
      AND "maKhachHang" IS NOT NULL
      AND "maNhanVien" IS NULL
      AND "maQuanLy" IS NULL
    )
    OR (
      "loaiTaiKhoan" = 'nhan_vien'
      AND "maKhachHang" IS NULL
      AND "maNhanVien" IS NOT NULL
      AND "maQuanLy" IS NULL
    )
    OR (
      "loaiTaiKhoan" = 'quan_ly'
      AND "maKhachHang" IS NULL
      AND "maNhanVien" IS NULL
      AND "maQuanLy" IS NOT NULL
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS "TaiKhoan_maKhachHang_unique"
  ON "TaiKhoan"("maKhachHang")
  WHERE "maKhachHang" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "TaiKhoan_maNhanVien_unique"
  ON "TaiKhoan"("maNhanVien")
  WHERE "maNhanVien" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "TaiKhoan_maQuanLy_unique"
  ON "TaiKhoan"("maQuanLy")
  WHERE "maQuanLy" IS NOT NULL;

-- 6. Tạo bảng DanhMuc (không dependency)
CREATE TABLE IF NOT EXISTS "DanhMuc" (
  "maDanhMuc" SERIAL PRIMARY KEY,
  "tenDanhMuc" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tạo bảng KhuyenMai (không dependency)
CREATE TABLE IF NOT EXISTS "KhuyenMai" (
  "maKhuyenMai" SERIAL PRIMARY KEY,
  "tenKhuyenMai" VARCHAR(255) NOT NULL,
  "phanTramGiam" NUMERIC NOT NULL DEFAULT 0,
  "ngayBatDau" DATE,
  "ngayKetThuc" DATE,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_khuyenmai_phantramgiam CHECK ("phanTramGiam" >= 0 and "phanTramGiam" <= 100),
  CONSTRAINT chk_khuyenmai_thoihan CHECK ("ngayBatDau" is null or "ngayKetThuc" is null or "ngayBatDau" <= "ngayKetThuc")
);

-- 8. Tạo bảng SanPham (phụ thuộc vào DanhMuc, KhuyenMai)
CREATE TABLE IF NOT EXISTS "SanPham" (
  "maSanPham" SERIAL PRIMARY KEY,
  "tenSanPham" VARCHAR(255) NOT NULL,
  "gia" DECIMAL(10, 2) NOT NULL,
  "soLuong" INTEGER NOT NULL,
  "anh" VARCHAR(255),
  "maDanhMuc" INTEGER REFERENCES "DanhMuc"("maDanhMuc") ON DELETE SET NULL,
  "maKhuyenMai" INTEGER REFERENCES "KhuyenMai"("maKhuyenMai") ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tạo bảng DonHang (phụ thuộc vào KhachHang)
CREATE TABLE IF NOT EXISTS "DonHang" (
  "maDonHang" SERIAL PRIMARY KEY,
  "tongGia" DECIMAL(10, 2) NOT NULL,
  "trangThai" VARCHAR(50),
  "maKhachHang" INTEGER NOT NULL REFERENCES "KhachHang"("maThanhVien") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tạo bảng ChiTietDonHang (phụ thuộc vào DonHang, SanPham)
CREATE TABLE IF NOT EXISTS "ChiTietDonHang" (
  "maDonHang" INTEGER NOT NULL REFERENCES "DonHang"("maDonHang") ON DELETE CASCADE,
  "maSanPham" INTEGER NOT NULL REFERENCES "SanPham"("maSanPham") ON DELETE CASCADE,
  "soLuong" INTEGER NOT NULL,
  "thanhTien" DECIMAL(10, 2) NOT NULL,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("maDonHang", "maSanPham")
);

-- Tạo một số quyền mặc định
INSERT INTO "PhanQuyen" ("tenQuyen") VALUES ('Quản trị viên') ON CONFLICT DO NOTHING;
INSERT INTO "PhanQuyen" ("tenQuyen") VALUES ('Người dùng') ON CONFLICT DO NOTHING;
INSERT INTO "PhanQuyen" ("tenQuyen") VALUES ('Nhân viên bán hàng') ON CONFLICT DO NOTHING;
