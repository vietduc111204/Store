export type AccountType = "khach_hang" | "nhan_vien" | "quan_ly";

export interface AuthAccount {
  maTaiKhoan: number;
  email: string;
  loaiTaiKhoan: AccountType;
  maKhachHang: number | null;
  maNhanVien: number | null;
  maQuanLy: number | null;
  createdAt?: string;
  updatedAt?: string;
  tenThanhVien?: string | null;
  soDienThoaiKhachHang?: string | null;
  diaChiKhachHang?: string | null;
  tenTinhThanhKhachHang?: string | null;
  tenQuanHuyenKhachHang?: string | null;
  tenPhuongXaKhachHang?: string | null;
  maTinhThanhKhachHang?: number | null;
  maQuanHuyenKhachHang?: number | null;
  maPhuongXaKhachHang?: string | null;
  tenNhanVien?: string | null;
  soDienThoaiNhanVien?: string | null;
  diaChiNhanVien?: string | null;
  tenQuanLy?: string | null;
  soDienThoaiQuanLy?: string | null;
  diaChiQuanLy?: string | null;
}

export interface SignUpPayload {
  email: string;
  password: string;
  loaiTaiKhoan: AccountType;
  ten?: string;
  tenThanhVien?: string;
  tenNhanVien?: string;
  tenQuanLy?: string;
  soDienThoai?: string;
  diaChi?: string;
  maQuyen?: number;
}

export interface AuthResponse {
  account: AuthAccount;
  accessToken: string;
}
