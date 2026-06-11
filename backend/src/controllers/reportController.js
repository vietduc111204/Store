import pool from '../libs/db.js';

export const getDashboard = async (_req, res) => {
  try {
    const [products, categories, customers, orders, revenue, recentProducts, recentOrders] =
      await Promise.all([
        pool.query('select count(*)::int as total from "SanPham"'),
        pool.query('select count(*)::int as total from "DanhMuc"'),
        pool.query('select count(*)::int as total from "KhachHang"'),
        pool.query('select count(*)::int as total from "DonHang"'),
        pool.query('select coalesce(sum("tongGia"), 0)::numeric as total from "DonHang"'),
        pool.query(
          'select s.*, d."tenDanhMuc", k."tenKhuyenMai" from "SanPham" s left join "DanhMuc" d on d."maDanhMuc" = s."maDanhMuc" left join "KhuyenMai" k on k."maKhuyenMai" = s."maKhuyenMai" order by s."maSanPham" desc limit 8'
        ),
        pool.query(
          'select dh.*, kh."tenKhachHang" as "tenThanhVien" from "DonHang" dh left join "KhachHang" kh on kh."maKhachHang" = dh."maKhachHang" order by dh."maDonHang" desc limit 8'
        ),
      ]);

    res.json({
      totals: {
        products: products.rows[0].total,
        categories: categories.rows[0].total,
        customers: customers.rows[0].total,
        orders: orders.rows[0].total,
        revenue: revenue.rows[0].total,
      },
      recentProducts: recentProducts.rows,
      recentOrders: recentOrders.rows,
    });
  } catch (error) {
    console.error('Dashboard query failed', error);
    res.status(500).json({ message: error.message });
  }
};

export const getRevenueStatistics = async (_req, res) => {
  try {
    const [totalRevenue, revenueByStatus, revenueByDay] = await Promise.all([
      pool.query('select coalesce(sum("tongGia"), 0)::numeric as total from "DonHang"'),
      pool.query(
        'select coalesce("trangThai", $1) as "trangThai", count(*)::int as "soDonHang", coalesce(sum("tongGia"), 0)::numeric as "doanhThu" from "DonHang" group by coalesce("trangThai", $1) order by "doanhThu" desc',
        ['Chưa cập nhật']
      ),
      pool.query(
        'select current_date as "ngay", count(*)::int as "soDonHang", coalesce(sum("tongGia"), 0)::numeric as "doanhThu" from "DonHang"'
      ),
    ]);

    res.json({
      totalRevenue: totalRevenue.rows[0].total,
      revenueByStatus: revenueByStatus.rows,
      revenueByDay: revenueByDay.rows,
    });
  } catch (error) {
    console.error('Revenue statistics query failed', error);
    res.status(500).json({ message: error.message });
  }
};

export const getProductStatistics = async (_req, res) => {
  try {
    const [summary, byCategory, bestSelling] = await Promise.all([
      pool.query(
        'select count(*)::int as "tongSanPham", coalesce(sum("soLuong"), 0)::int as "tongTonKho", coalesce(avg("gia"), 0)::numeric as "giaTrungBinh" from "SanPham"'
      ),
      pool.query(
        'select d."maDanhMuc", d."tenDanhMuc", count(s."maSanPham")::int as "soSanPham", coalesce(sum(s."soLuong"), 0)::int as "tongTonKho" from "DanhMuc" d left join "SanPham" s on s."maDanhMuc" = d."maDanhMuc" group by d."maDanhMuc", d."tenDanhMuc" order by "soSanPham" desc'
      ),
      pool.query(
        'select sp."maSanPham", sp."tenSanPham", coalesce(sum(ct."soLuong"), 0)::int as "soLuongDaBan", coalesce(sum(ct."thanhTien"), 0)::numeric as "doanhThu" from "SanPham" sp left join "ChiTietDonHang" ct on ct."maSanPham" = sp."maSanPham" group by sp."maSanPham", sp."tenSanPham" order by "soLuongDaBan" desc, "doanhThu" desc limit 20'
      ),
    ]);

    res.json({
      summary: summary.rows[0],
      byCategory: byCategory.rows,
      bestSelling: bestSelling.rows,
    });
  } catch (error) {
    console.error('Product statistics query failed', error);
    res.status(500).json({ message: error.message });
  }
};
