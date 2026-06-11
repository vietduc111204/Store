import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5001}`;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const tests = [];
let cleanupIds = { customers: [], employees: [], managers: [] };

const log = (title, data) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 ${title}`);
  console.log('='.repeat(60));
  console.log(JSON.stringify(data, null, 2));
};

const logError = (title, error) => {
  console.log(`\n${'❌'.repeat(30)}`);
  console.log(`❌ TEST FAILED: ${title}`);
  console.log('❌'.repeat(30));
  console.log(error);
};

try {
  // Test 1: Signup as customer
  log('Test 1: Signup as Customer', { email: 'customer', loaiTaiKhoan: 'khach_hang' });
  const customerEmail = `customer_${Date.now()}@example.com`;
  const signupCustomer = await fetch(`${apiUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: customerEmail,
      password: 'Test123456',
      loaiTaiKhoan: 'khach_hang',
      ten: 'Khách Hàng Test',
      soDienThoai: '0900000000',
    }),
  });
  const customerSignup = await signupCustomer.json();
  if (!signupCustomer.ok) throw new Error(`Signup customer failed: ${JSON.stringify(customerSignup)}`);
  tests.push({ name: 'Signup Customer', status: 'PASS', code: signupCustomer.status });
  const customerToken = customerSignup.accessToken;
  cleanupIds.customers.push(customerSignup.account.maKhachHang);
  log('✓ Customer Signup Result', {
    status: signupCustomer.status,
    email: customerSignup.account.email,
    loaiTaiKhoan: customerSignup.account.loaiTaiKhoan,
    maKhachHang: customerSignup.account.maKhachHang,
  });

  // Test 2: Signup as employee
  log('Test 2: Signup as Employee', { email: 'employee', loaiTaiKhoan: 'nhan_vien' });
  const employeeEmail = `employee_${Date.now()}@example.com`;
  const signupEmployee = await fetch(`${apiUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: employeeEmail,
      password: 'Test123456',
      loaiTaiKhoan: 'nhan_vien',
      tenNhanVien: 'Nhân Viên Test',
      soDienThoai: '0901111111',
      diaChi: 'Hà Nội, Việt Nam',
    }),
  });
  const employeeSignupResult = await signupEmployee.json();
  if (!signupEmployee.ok) throw new Error(`Signup employee failed: ${JSON.stringify(employeeSignupResult)}`);
  tests.push({ name: 'Signup Employee', status: 'PASS', code: signupEmployee.status });
  const employeeToken = employeeSignupResult.accessToken;
  cleanupIds.employees.push(employeeSignupResult.account.maNhanVien);
  log('✓ Employee Signup Result', {
    status: signupEmployee.status,
    email: employeeSignupResult.account.email,
    loaiTaiKhoan: employeeSignupResult.account.loaiTaiKhoan,
    maNhanVien: employeeSignupResult.account.maNhanVien,
  });

  // Test 3: Signup as manager
  log('Test 3: Signup as Manager', { email: 'manager', loaiTaiKhoan: 'quan_ly' });
  const managerEmail = `manager_${Date.now()}@example.com`;
  const signupManager = await fetch(`${apiUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: managerEmail,
      password: 'Test123456',
      loaiTaiKhoan: 'quan_ly',
      tenQuanLy: 'Quản Lý Test',
      soDienThoai: '0902222222',
      diaChi: 'TP. Hồ Chí Minh, Việt Nam',
    }),
  });
  const managerSignupResult = await signupManager.json();
  if (!signupManager.ok) throw new Error(`Signup manager failed: ${JSON.stringify(managerSignupResult)}`);
  tests.push({ name: 'Signup Manager', status: 'PASS', code: signupManager.status });
  const managerToken = managerSignupResult.accessToken;
  cleanupIds.managers.push(managerSignupResult.account.maQuanLy);
  log('✓ Manager Signup Result', {
    status: signupManager.status,
    email: managerSignupResult.account.email,
    loaiTaiKhoan: managerSignupResult.account.loaiTaiKhoan,
    maQuanLy: managerSignupResult.account.maQuanLy,
  });

  // Test 4: Login with correct credentials
  log('Test 4: Login with Correct Credentials', { email: customerEmail, password: '***' });
  const signin = await fetch(`${apiUrl}/api/auth/signin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: customerEmail, password: 'Test123456' }),
  });
  const signinBody = await signin.json();
  if (!signin.ok) throw new Error(`Signin failed: ${JSON.stringify(signinBody)}`);
  tests.push({ name: 'Login with Correct Credentials', status: 'PASS', code: signin.status });
  log('✓ Login Result', {
    status: signin.status,
    email: signinBody.account.email,
    loaiTaiKhoan: signinBody.account.loaiTaiKhoan,
  });

  // Test 5: Login with wrong password
  log('Test 5: Login with Wrong Password', { email: customerEmail, password: 'WrongPassword' });
  const signinWrongPassword = await fetch(`${apiUrl}/api/auth/signin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: customerEmail, password: 'WrongPassword123' }),
  });
  const wrongPasswordBody = await signinWrongPassword.json();
  tests.push({
    name: 'Login with Wrong Password',
    status: signinWrongPassword.status === 401 ? 'PASS' : 'FAIL',
    code: signinWrongPassword.status,
  });
  log('✓ Wrong Password Result', {
    status: signinWrongPassword.status,
    message: wrongPasswordBody.message,
  });

  // Test 6: Login with non-existent email
  log('Test 6: Login with Non-existent Email', { email: 'nonexistent@example.com' });
  const signinNonexistent = await fetch(`${apiUrl}/api/auth/signin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent@example.com', password: 'Test123456' }),
  });
  const nonexistentBody = await signinNonexistent.json();
  tests.push({
    name: 'Login with Non-existent Email',
    status: signinNonexistent.status === 401 ? 'PASS' : 'FAIL',
    code: signinNonexistent.status,
  });
  log('✓ Non-existent Email Result', {
    status: signinNonexistent.status,
    message: nonexistentBody.message,
  });

  // Test 7: Get current user info with valid token
  log('Test 7: Get Current User Info (with Valid Token)');
  const me = await fetch(`${apiUrl}/api/auth/me`, {
    headers: { authorization: `Bearer ${customerToken}` },
  });
  const meBody = await me.json();
  if (!me.ok) throw new Error(`Get me failed: ${JSON.stringify(meBody)}`);
  tests.push({ name: 'Get Current User Info (Valid Token)', status: 'PASS', code: me.status });
  log('✓ Current User Info', {
    status: me.status,
    email: meBody.account.email,
    loaiTaiKhoan: meBody.account.loaiTaiKhoan,
    maKhachHang: meBody.account.maKhachHang,
  });

  // Test 8: Get current user info with invalid token
  log('Test 8: Get Current User Info (with Invalid Token)');
  const meInvalid = await fetch(`${apiUrl}/api/auth/me`, {
    headers: { authorization: `Bearer invalid_token_12345` },
  });
  tests.push({
    name: 'Get Current User Info (Invalid Token)',
    status: meInvalid.status === 401 ? 'PASS' : 'FAIL',
    code: meInvalid.status,
  });
  log('✓ Invalid Token Result', { status: meInvalid.status });

  // Test 9: Get current user info without token
  log('Test 9: Get Current User Info (No Token)');
  const meNoToken = await fetch(`${apiUrl}/api/auth/me`);
  tests.push({
    name: 'Get Current User Info (No Token)',
    status: meNoToken.status === 401 ? 'PASS' : 'FAIL',
    code: meNoToken.status,
  });
  log('✓ No Token Result', { status: meNoToken.status });

  // Test 10: Duplicate email signup
  log('Test 10: Duplicate Email Signup');
  const signupDuplicate = await fetch(`${apiUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: customerEmail,
      password: 'Test123456',
      loaiTaiKhoan: 'khach_hang',
      ten: 'Duplicate Test',
    }),
  });
  const duplicateBody = await signupDuplicate.json();
  tests.push({
    name: 'Duplicate Email Signup',
    status: signupDuplicate.status === 409 ? 'PASS' : 'FAIL',
    code: signupDuplicate.status,
  });
  log('✓ Duplicate Email Result', {
    status: signupDuplicate.status,
    message: duplicateBody.message,
  });

  // Test 11: Missing email in signup
  log('Test 11: Missing Email in Signup');
  const signupMissingEmail = await fetch(`${apiUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      password: 'Test123456',
      loaiTaiKhoan: 'khach_hang',
      ten: 'Missing Email Test',
    }),
  });
  const missingEmailBody = await signupMissingEmail.json();
  tests.push({
    name: 'Missing Email in Signup',
    status: signupMissingEmail.status === 400 ? 'PASS' : 'FAIL',
    code: signupMissingEmail.status,
  });
  log('✓ Missing Email Result', {
    status: signupMissingEmail.status,
    message: missingEmailBody.message,
  });

  // Test 12: Missing password in signin
  log('Test 12: Missing Password in Signin');
  const signinMissingPassword = await fetch(`${apiUrl}/api/auth/signin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: customerEmail }),
  });
  const missingPasswordBody = await signinMissingPassword.json();
  tests.push({
    name: 'Missing Password in Signin',
    status: signinMissingPassword.status === 400 ? 'PASS' : 'FAIL',
    code: signinMissingPassword.status,
  });
  log('✓ Missing Password Result', {
    status: signinMissingPassword.status,
    message: missingPasswordBody.message,
  });

  // Test 13: Logout
  log('Test 13: Logout', { method: 'POST', headers: { authorization: `Bearer ${customerToken}` } });
  const logout = await fetch(`${apiUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { authorization: `Bearer ${customerToken}` },
  });
  if (logout.status === 404) {
    tests.push({
      name: 'Logout',
      status: 'WARN',
      code: logout.status,
      message: 'Logout endpoint not implemented',
    });
    log('⚠ Logout Endpoint', {
      status: logout.status,
      note: 'Logout endpoint not yet implemented. In JWT systems, logout is typically handled on the frontend by removing the token.',
    });
  } else {
    const logoutBody = await logout.json();
    tests.push({
      name: 'Logout',
      status: logout.status === 200 ? 'PASS' : 'FAIL',
      code: logout.status,
    });
    log('✓ Logout Result', {
      status: logout.status,
      message: logoutBody.message || 'Logged out successfully',
    });
  }

  // Summary
  const passCount = tests.filter((t) => t.status === 'PASS').length;
  const failCount = tests.filter((t) => t.status === 'FAIL').length;
  const warnCount = tests.filter((t) => t.status === 'WARN').length;

  log('FINAL TEST SUMMARY', {
    totalTests: tests.length,
    passed: passCount,
    failed: failCount,
    warnings: warnCount,
    tests: tests.map((t) => ({
      name: t.name,
      status: t.status,
      code: t.code,
    })),
  });
} catch (error) {
  logError('Test Suite', error);
} finally {
  // Cleanup
  try {
    for (const id of cleanupIds.customers) {
      await pool.query('delete from "KhachHang" where "maThanhVien" = $1', [id]);
    }
    for (const id of cleanupIds.employees) {
      await pool.query('delete from "NhanVien" where "maNhanVien" = $1', [id]);
    }
    for (const id of cleanupIds.managers) {
      await pool.query('delete from "QuanLy" where "maQuanLy" = $1', [id]);
    }
  } catch (error) {
    console.log('Warning: Cleanup failed', error.message);
  }
  await pool.end();
}
