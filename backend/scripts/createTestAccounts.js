import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';
const TEST_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD || '';

if (!TEST_PASSWORD) {
  console.error('Set TEST_ACCOUNT_PASSWORD before running this script.');
  process.exit(1);
}

const createAccount = async (accountData) => {
  try {
    console.log(`\n📝 Tạo tài khoản: ${accountData.email} (${accountData.loaiTaiKhoan})...`);
    const response = await axios.post(`${API_URL}/signup`, accountData);
    
    console.log(`✅ Thành công!`);
    console.log(`   Email: ${response.data.account.email}`);
    console.log(`   Loại: ${response.data.account.loaiTaiKhoan}`);
    console.log(`   Has token: ${Boolean(response.data.accessToken)}`);
    console.log(`   ---`);
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`⚠️  Email đã tồn tại, bỏ qua`);
      return null;
    }
    console.error(`❌ Lỗi:`, error.response?.data?.message || error.message);
    return null;
  }
};

const main = async () => {
  console.log('🚀 Bắt đầu tạo tài khoản test...\n');

  // Tài khoản Khách hàng
  await createAccount({
    email: 'khachhang@test.com',
    password: TEST_PASSWORD,
    loaiTaiKhoan: 'khach_hang',
    tenThanhVien: 'Nguyễn Văn Khách',
    soDienThoai: '0123456789',
  });

  // Tài khoản Nhân viên
  await createAccount({
    email: 'nhanvien@test.com',
    password: TEST_PASSWORD,
    loaiTaiKhoan: 'nhan_vien',
    tenNhanVien: 'Trần Thị Nhân Viên',
    soDienThoai: '0987654321',
    diaChi: '123 Đường ABC, TP HCM',
  });

  // Tài khoản Quản lý
  await createAccount({
    email: 'quanly@test.com',
    password: TEST_PASSWORD,
    loaiTaiKhoan: 'quan_ly',
    tenQuanLy: 'Lê Văn Quản Lý',
    soDienThoai: '0912345678',
    diaChi: '456 Đường XYZ, Hà Nội',
  });

  console.log('\n✨ Xong! Bạn có thể dùng các email trên để test signin/logout.');
};

main();
