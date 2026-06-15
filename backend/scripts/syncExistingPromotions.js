import pool from '../src/libs/db.js';

const promotions = [
  {
    maKhuyenMai: 1,
    tenKhuyenMai: 'SMART20',
    phanTramGiam: 20,
    ngayBatDau: '2026-05-01',
    ngayKetThuc: '2026-08-31',
    productIds: [2, 7, 11, 18],
  },
  {
    maKhuyenMai: 2,
    tenKhuyenMai: 'SAFE10',
    phanTramGiam: 10,
    ngayBatDau: '2026-05-15',
    ngayKetThuc: '2026-07-31',
    productIds: [4, 9, 14],
  },
  {
    maKhuyenMai: 3,
    tenKhuyenMai: 'HOME15',
    phanTramGiam: 15,
    ngayBatDau: '2026-06-01',
    ngayKetThuc: '2026-09-15',
    productIds: [3, 5, 12, 16],
  },
  {
    maKhuyenMai: 4,
    tenKhuyenMai: 'SUMMER5',
    phanTramGiam: 5,
    ngayBatDau: '2026-06-13',
    ngayKetThuc: '2026-12-31',
    productIds: [1, 6, 8, 10, 13, 15, 17],
  },
];

const run = async () => {
  const client = await pool.connect();

  try {
    await client.query('begin');

    await client.query('update "SanPham" set "maKhuyenMai" = null');

    for (const promotion of promotions) {
      const result = await client.query(
        `update "KhuyenMai"
         set "tenKhuyenMai" = $1,
             "phanTramGiam" = $2,
             "ngayBatDau" = $3,
             "ngayKetThuc" = $4
         where "maKhuyenMai" = $5
         returning "maKhuyenMai"`,
        [
          promotion.tenKhuyenMai,
          promotion.phanTramGiam,
          promotion.ngayBatDau,
          promotion.ngayKetThuc,
          promotion.maKhuyenMai,
        ]
      );

      if (!result.rowCount) {
        throw new Error(`Khong tim thay ma khuyen mai ${promotion.maKhuyenMai}`);
      }

      await client.query(
        'update "SanPham" set "maKhuyenMai" = $1 where "maSanPham" = any($2::int[])',
        [promotion.maKhuyenMai, promotion.productIds]
      );
    }

    await client.query('commit');
    console.log('Da cap nhat khuyen mai hien co va gan san pham ap dung.');
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
