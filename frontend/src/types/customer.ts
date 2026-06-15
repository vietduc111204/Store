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
  soLuongDaBan?: number | null;
};

export type Category = {
  maDanhMuc: number;
  tenDanhMuc: string;
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
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CustomerOrder = {
  maDonHang: number;
  tongGia: string | number;
  trangThai?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  cancelledAt?: string | null;
  thoiGian?: string | null;
};

export type CustomerOrderDetail = {
  maDonHang: number;
  maSanPham: number;
  tenSanPham: string;
  soLuong: number;
  thanhTien: string | number;
  gia?: string | number | null;
  anh?: string | null;
  tenKhuyenMai?: string | null;
  phanTramGiam?: string | number | null;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
};
