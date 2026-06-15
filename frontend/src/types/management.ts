import type { AccountType } from "@/types/user";

export type ManagementRole = Extract<AccountType, "nhan_vien" | "quan_ly">;

export type ViewKey =
  | "dashboard"
  | "categories"
  | "products"
  | "customers"
  | "employees"
  | "orders"
  | "promotions"
  | "reports";

export type FormMode = "create" | "edit";
export type FormValues = Record<string, string>;

export type FormField = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "multi-select" | "file" | "image-list" | "password" | "date" | "textarea";
  options?: Array<{ label: string; value: string }>;
  disabled?: boolean;
  disabledWhen?: (values: FormValues) => boolean;
  onValueChange?: (value: string, values: FormValues) => FormValues;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
};

export type ModalState = {
  title: string;
  mode: FormMode;
  submitLabel: string;
  fields: FormField[];
  values: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
} | null;

export type Category = {
  maDanhMuc: number;
  tenDanhMuc: string;
};

export type Product = {
  maSanPham: number;
  tenSanPham: string;
  gia: string | number;
  soLuong: number;
  anh?: string | null;
  anhPhu?: string | null;
  maDanhMuc?: number | null;
  maKhuyenMai?: number | null;
  tenDanhMuc?: string | null;
  tenKhuyenMai?: string | null;
  phanTramGiam?: string | number | null;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
  thongSoKyThuat?: string | null;
};

export type Customer = {
  maThanhVien: number;
  tenThanhVien: string;
  soDienThoai?: string | null;
  email?: string | null;
  diaChi?: string | null;
  maQuyen?: number | null;
};

export type Employee = {
  maNhanVien: number;
  tenNhanVien: string;
  soDienThoai?: string | null;
  diaChi?: string | null;
  maQuyen?: number | null;
  email?: string | null;
};

export type Order = {
  maDonHang: number;
  tongGia: string | number;
  trangThai?: string | null;
  maKhachHang: number;
  maKhuyenMai?: number | null;
  tenKhuyenMai?: string | null;
  phanTramGiam?: string | number | null;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
  tenThanhVien?: string | null;
  email?: string | null;
  soDienThoai?: string | null;
  hasProductDiscount?: boolean;
};

export type OrderDetail = {
  maDonHang: number;
  maSanPham: number;
  tenSanPham: string;
  soLuong: number;
  thanhTien: string | number;
  gia?: string | number | null;
  anh?: string | null;
  tenKhuyenMai?: string | null;
  phanTramGiam?: string | number | null;
};

export type Promotion = {
  maKhuyenMai: number;
  tenKhuyenMai: string;
  phanTramGiam?: string | number | null;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
  isActive?: boolean | null;
  soSanPhamApDung?: number | null;
  sanPhamApDung?: string | null;
  maSanPhamApDung?: string | null;
};

export type RevenueStats = {
  totalRevenue?: string | number;
  revenueByStatus?: Array<{ trangThai: string; soDonHang: number; doanhThu: string | number }>;
  revenueByDay?: Array<{ ngay: string; soDonHang: number; doanhThu: string | number }>;
};

export type ProductStats = {
  summary?: { tongSanPham: number; tongTonKho: number; giaTrungBinh: string | number };
  byCategory?: Array<{
    maDanhMuc: number;
    tenDanhMuc: string;
    soSanPham: number;
    tongTonKho: number;
  }>;
  bestSelling?: Array<{
    maSanPham: number;
    tenSanPham: string;
    soLuongDaBan: number;
    doanhThu: string | number;
  }>;
};
