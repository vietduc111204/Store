import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

const categories = [
  [1, 'Camera an ninh'],
  [2, 'Cảm biến thông minh'],
  [3, 'Chiếu sáng thông minh'],
  [4, 'Điều khiển trung tâm'],
  [5, 'Khóa cửa thông minh'],
  [6, 'Thiết bị gia dụng thông minh'],
  [7, 'Âm thanh và giải trí'],
  [8, 'Mạng và kết nối'],
];

const productSpecs = {
  1: [
    { label: 'Độ phân giải', value: '2K QHD' },
    { label: 'Kết nối', value: 'Wi-Fi 2.4GHz / LAN' },
    { label: 'Chống nước', value: 'IP66' },
    { label: 'Tầm nhìn đêm', value: 'Hồng ngoại 20m' },
  ],
  2: [
    { label: 'Góc quay', value: 'Xoay 360 độ' },
    { label: 'Độ phân giải', value: 'Full HD 1080p' },
    { label: 'Tính năng AI', value: 'Phát hiện chuyển động' },
    { label: 'Lưu trữ', value: 'Thẻ nhớ / Cloud' },
  ],
  3: [
    { label: 'Chuẩn kết nối', value: 'Zigbee 3.0' },
    { label: 'Pin', value: 'CR2032' },
    { label: 'Khoảng cách nhận tín hiệu', value: 'Tối đa 30m' },
    { label: 'Cảnh báo', value: 'Mở cửa / đóng cửa' },
  ],
  4: [
    { label: 'Cảm biến', value: 'Hồng ngoại PIR' },
    { label: 'Góc quét', value: '120 độ' },
    { label: 'Khoảng cách phát hiện', value: 'Tối đa 7m' },
    { label: 'Kết nối', value: 'Zigbee' },
  ],
  5: [
    { label: 'Công suất', value: '9W' },
    { label: 'Màu sắc', value: 'RGB + trắng ấm/lạnh' },
    { label: 'Kết nối', value: 'Wi-Fi 2.4GHz' },
    { label: 'Điều khiển', value: 'App / giọng nói' },
  ],
  6: [
    { label: 'Số nút', value: '3 nút cảm ứng' },
    { label: 'Nguồn điện', value: '220V AC' },
    { label: 'Kết nối', value: 'Wi-Fi' },
    { label: 'Mặt kính', value: 'Cường lực chống xước' },
  ],
  7: [
    { label: 'Giao thức', value: 'Zigbee / Matter' },
    { label: 'Nguồn điện', value: 'USB Type-C' },
    { label: 'Số thiết bị hỗ trợ', value: 'Tối đa 128 thiết bị' },
    { label: 'Điều khiển', value: 'App SmartHome' },
  ],
  8: [
    { label: 'Công suất tải', value: 'Tối đa 2500W' },
    { label: 'Đo điện năng', value: 'Có' },
    { label: 'Kết nối', value: 'Wi-Fi 2.4GHz' },
    { label: 'Hẹn giờ', value: 'Theo lịch / đếm ngược' },
  ],
  9: [
    { label: 'Mở khóa', value: 'Vân tay / mã PIN / app' },
    { label: 'Nguồn điện', value: 'Pin lithium sạc lại' },
    { label: 'Cảnh báo', value: 'Cạy phá / pin yếu' },
    { label: 'Kết nối', value: 'Wi-Fi' },
  ],
  10: [
    { label: 'Màn hình', value: 'IPS 4.3 inch' },
    { label: 'Camera', value: '1080p góc rộng' },
    { label: 'Đàm thoại', value: '2 chiều' },
    { label: 'Kết nối', value: 'Wi-Fi' },
  ],
  11: [
    { label: 'Lực hút', value: '4000Pa' },
    { label: 'Dung lượng pin', value: '5200mAh' },
    { label: 'Chức năng', value: 'Hút bụi + lau nhà' },
    { label: 'Điều hướng', value: 'Laser LDS' },
  ],
  12: [
    { label: 'Màng lọc', value: 'HEPA H13' },
    { label: 'Diện tích phù hợp', value: '35-45m2' },
    { label: 'Cảm biến', value: 'PM2.5' },
    { label: 'Kết nối', value: 'Wi-Fi' },
  ],
  13: [
    { label: 'Công suất loa', value: '15W' },
    { label: 'Điều khiển', value: 'Giọng nói / app' },
    { label: 'Kết nối', value: 'Wi-Fi / Bluetooth' },
    { label: 'Micro', value: 'Khử ồn trường xa' },
  ],
  14: [
    { label: 'Màn hình', value: '8 inch cảm ứng' },
    { label: 'Độ phân giải', value: '1280 x 800' },
    { label: 'Kết nối', value: 'Wi-Fi / Bluetooth' },
    { label: 'Lắp đặt', value: 'Tường / để bàn' },
  ],
  15: [
    { label: 'Chuẩn Wi-Fi', value: 'Wi-Fi 6' },
    { label: 'Tốc độ', value: 'AX3000' },
    { label: 'Phủ sóng', value: 'Tối đa 180m2' },
    { label: 'Mesh', value: 'Có' },
  ],
  16: [
    { label: 'Giao thức', value: 'Zigbee 3.0' },
    { label: 'Nguồn điện', value: 'USB 5V' },
    { label: 'Chức năng', value: 'Mở rộng vùng phủ sóng' },
    { label: 'Khoảng cách', value: 'Tối đa 20m' },
  ],
  17: [
    { label: 'Tải trọng rèm', value: 'Tối đa 50kg' },
    { label: 'Điều khiển', value: 'App / remote / giọng nói' },
    { label: 'Kết nối', value: 'Wi-Fi' },
    { label: 'Hẹn giờ', value: 'Theo lịch' },
  ],
  18: [
    { label: 'Cảm biến', value: 'Khói + khí gas' },
    { label: 'Âm báo', value: '85dB' },
    { label: 'Kết nối', value: 'Wi-Fi / Zigbee' },
    { label: 'Nguồn điện', value: 'Pin AA' },
  ],
};

const promotions = [
  [1, 'Giảm 20%', 20, '2026-05-01', '2026-08-31'],
  [2, 'Giảm 10%', 10, '2026-05-15', '2026-07-31'],
  [3, 'Giảm 15%', 15, '2026-06-01', '2026-09-15'],
];

const products = [
  [1, 'Camera IP ngoài trời 2K chống nước', 1290000, 35, '/smart%20home.avif', 1, null, productSpecs[1]],
  [2, 'Camera trong nhà xoay 360 độ AI', 890000, 50, '/smart%20home.avif', 1, 1, productSpecs[2]],
  [3, 'Cảm biến cửa Zigbee siêu nhạy', 290000, 120, '/smart%20sensor.avif', 2, 3, productSpecs[3]],
  [4, 'Cảm biến chuyển động hồng ngoại', 350000, 90, '/smart%20sensor.avif', 2, 2, productSpecs[4]],
  [5, 'Bóng đèn LED WiFi đổi màu RGB', 249000, 160, '/lamp.avif', 3, 3, productSpecs[5]],
  [6, 'Công tắc cảm ứng thông minh 3 nút', 520000, 75, '/lamp.avif', 3, null, productSpecs[6]],
  [7, 'Trung tâm điều khiển Zigbee Matter Hub', 1490000, 40, '/circuit.avif', 4, 1, productSpecs[7]],
  [8, 'Ổ cắm thông minh đo điện năng', 390000, 110, '/circuit.avif', 4, null, productSpecs[8]],
  [9, 'Khóa cửa vân tay WiFi cao cấp', 3290000, 24, '/smart%20lock.avif', 5, 2, productSpecs[9]],
  [10, 'Chuông cửa màn hình thông minh', 2190000, 32, '/smart%20lock.avif', 5, null, productSpecs[10]],
  [11, 'Robot hút bụi lau nhà tự động', 6990000, 18, '/vacuum%20cleaner.avif', 6, 1, productSpecs[11]],
  [12, 'Máy lọc không khí WiFi HEPA H13', 4590000, 28, '/thermosmart.avif', 6, 3, productSpecs[12]],
  [13, 'Loa thông minh điều khiển giọng nói', 1590000, 55, '/speaker.avif', 7, null, productSpecs[13]],
  [14, 'Màn hình điều khiển nhà thông minh 8 inch', 3990000, 21, '/speaker.avif', 7, 2, productSpecs[14]],
  [15, 'Router WiFi 6 Mesh cho căn hộ', 2490000, 45, '/wifi.avif', 8, null, productSpecs[15]],
  [16, 'Bộ mở rộng sóng Zigbee USB', 450000, 85, '/wifi.avif', 8, 3, productSpecs[16]],
  [17, 'Rèm cửa tự động điều khiển qua app', 1890000, 30, '/workshop.avif', 4, null, productSpecs[17]],
  [18, 'Bộ cảm biến khói và khí gas thông minh', 690000, 65, '/smart%20sensor.avif', 2, 1, productSpecs[18]],
];

const productExtraImages = {
  1: ['/smart%20sensor.avif', '/home.avif', '/circuit.avif'],
  2: ['/smart%20sensor.avif', '/home.avif', '/workshop.avif'],
  3: ['/home.avif', '/smart%20home.avif', '/circuit.avif'],
  4: ['/home.avif', '/smart%20home.avif', '/lamp.avif'],
  5: ['/home.avif', '/smart%20home.avif', '/circuit.avif'],
  6: ['/home.avif', '/smart%20sensor.avif', '/circuit.avif'],
  7: ['/home.avif', '/wifi.avif', '/smart%20home.avif'],
  8: ['/home.avif', '/smart%20sensor.avif', '/lamp.avif'],
  9: ['/home.avif', '/smart%20sensor.avif', '/circuit.avif'],
  10: ['/home.avif', '/smart%20home.avif', '/smart%20sensor.avif'],
  11: ['/home.avif', '/thermosmart.avif', '/smart%20home.avif'],
  12: ['/home.avif', '/vacuum%20cleaner.avif', '/smart%20home.avif'],
  13: ['/home.avif', '/smart%20home.avif', '/circuit.avif'],
  14: ['/home.avif', '/speaker.avif', '/circuit.avif'],
  15: ['/home.avif', '/circuit.avif', '/smart%20home.avif'],
  16: ['/home.avif', '/circuit.avif', '/smart%20sensor.avif'],
  17: ['/home.avif', '/smart%20home.avif', '/lamp.avif'],
  18: ['/home.avif', '/smart%20home.avif', '/circuit.avif'],
};

const qid = (name) => `"${name}"`;
const specsToText = (specs) => specs.map((spec) => `${spec.label}: ${spec.value}`).join('\n');

try {
  await pool.query('begin');
  await pool.query('alter table "SanPham" add column if not exists "thongSoKyThuat" varchar');
  await pool.query('alter table "SanPham" add column if not exists "anhPhu" varchar');
  await pool.query('alter table "SanPham" alter column "thongSoKyThuat" type varchar using "thongSoKyThuat"::text');
  await pool.query('alter table "SanPham" alter column "anhPhu" type varchar using "anhPhu"::text');
  await pool.query('alter table "KhuyenMai" add column if not exists "phanTramGiam" numeric default 0');
  await pool.query('alter table "KhuyenMai" add column if not exists "ngayBatDau" date');
  await pool.query('alter table "KhuyenMai" add column if not exists "ngayKetThuc" date');

  for (const category of categories) {
    await pool.query(
      `insert into "DanhMuc" ("maDanhMuc", "tenDanhMuc")
       values ($1, $2)
       on conflict ("maDanhMuc") do update
       set "tenDanhMuc" = excluded."tenDanhMuc"`,
      category
    );
  }

  for (const promotion of promotions) {
    await pool.query(
      `insert into "KhuyenMai" ("maKhuyenMai", "tenKhuyenMai", "phanTramGiam", "ngayBatDau", "ngayKetThuc")
       values ($1, $2, $3, $4, $5)
       on conflict ("maKhuyenMai") do update
       set
         "tenKhuyenMai" = excluded."tenKhuyenMai",
         "phanTramGiam" = excluded."phanTramGiam",
         "ngayBatDau" = excluded."ngayBatDau",
         "ngayKetThuc" = excluded."ngayKetThuc"`,
      promotion
    );
  }

  for (const product of products) {
    await pool.query(
      `insert into "SanPham" ("maSanPham", "tenSanPham", "gia", "soLuong", "anh", "maDanhMuc", "maKhuyenMai", "thongSoKyThuat", "anhPhu")
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       on conflict ("maSanPham") do update
       set
         "tenSanPham" = excluded."tenSanPham",
         "gia" = excluded."gia",
         "soLuong" = excluded."soLuong",
         "anh" = excluded."anh",
         "maDanhMuc" = excluded."maDanhMuc",
         "maKhuyenMai" = excluded."maKhuyenMai",
         "thongSoKyThuat" = excluded."thongSoKyThuat",
         "anhPhu" = excluded."anhPhu"`,
      [...product.map((value, index) => (index === 7 ? specsToText(value) : value)), (productExtraImages[product[0]] || []).join('\n')]
    );
  }

  await pool.query(`select setval(pg_get_serial_sequence('` + qid('DanhMuc') + `', 'maDanhMuc'), (select max("maDanhMuc") from "DanhMuc"))`);
  await pool.query(`select setval(pg_get_serial_sequence('` + qid('KhuyenMai') + `', 'maKhuyenMai'), (select max("maKhuyenMai") from "KhuyenMai"))`);
  await pool.query(`select setval(pg_get_serial_sequence('` + qid('SanPham') + `', 'maSanPham'), (select max("maSanPham") from "SanPham"))`);

  await pool.query('commit');
  console.log(`Seeded ${categories.length} smart-home categories, ${promotions.length} promotions and ${products.length} smart-home products.`);
} catch (error) {
  await pool.query('rollback');
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
