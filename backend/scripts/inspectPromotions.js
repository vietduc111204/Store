import pool from '../src/libs/db.js';

const run = async () => {
  const promotions = await pool.query(
    `select km."maKhuyenMai", km."tenKhuyenMai", km."phanTramGiam", km."ngayBatDau", km."ngayKetThuc",
      count(sp."maSanPham")::int as "soSanPhamApDung",
      coalesce(string_agg(sp."maSanPham" || ':' || sp."tenSanPham", ', ' order by sp."maSanPham"), '') as "sanPhamApDung"
     from "KhuyenMai" km
     left join "SanPham" sp on sp."maKhuyenMai" = km."maKhuyenMai"
     group by km."maKhuyenMai"
     order by km."maKhuyenMai"`
  );

  const products = await pool.query(
    `select "maSanPham", "tenSanPham", "maDanhMuc", "maKhuyenMai"
     from "SanPham"
     order by "maSanPham"`
  );

  console.log(JSON.stringify({ promotions: promotions.rows, products: products.rows }, null, 2));
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
