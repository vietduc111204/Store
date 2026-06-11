import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

const password = process.env.TEST_ACCOUNT_PASSWORD || '';

if (!password) {
  console.error('Set TEST_ACCOUNT_PASSWORD before running this script.');
  process.exit(1);
}

const accounts = [
  {
    ownerTable: 'KhachHang',
    ownerPk: 'maThanhVien',
    ownerColumns: ['tenThanhVien', 'soDienThoai', 'email'],
    ownerValues: ['Customer 1', '0123456789', 'khachhang1@test.com'],
    account: { email: 'khachhang1@test.com', loaiTaiKhoan: 'khach_hang', linkColumn: 'maKhachHang' },
  },
  {
    ownerTable: 'KhachHang',
    ownerPk: 'maThanhVien',
    ownerColumns: ['tenThanhVien', 'soDienThoai', 'email'],
    ownerValues: ['Customer 2', '0987654321', 'khachhang2@test.com'],
    account: { email: 'khachhang2@test.com', loaiTaiKhoan: 'khach_hang', linkColumn: 'maKhachHang' },
  },
  {
    ownerTable: 'NhanVien',
    ownerPk: 'maNhanVien',
    ownerColumns: ['tenNhanVien', 'soDienThoai', 'diaChi'],
    ownerValues: ['Employee 1', '0912345678', 'Test address 1'],
    account: { email: 'nhanvien1@test.com', loaiTaiKhoan: 'nhan_vien', linkColumn: 'maNhanVien' },
  },
  {
    ownerTable: 'NhanVien',
    ownerPk: 'maNhanVien',
    ownerColumns: ['tenNhanVien', 'soDienThoai', 'diaChi'],
    ownerValues: ['Employee 2', '0908765432', 'Test address 2'],
    account: { email: 'nhanvien2@test.com', loaiTaiKhoan: 'nhan_vien', linkColumn: 'maNhanVien' },
  },
];

const managerSeeds = [
  {
    ownerValues: ['Manager 1', '0911111111', 'Test address 3'],
    account: { email: 'quanly1@test.com', loaiTaiKhoan: 'quan_ly', linkColumn: 'maQuanLy' },
  },
  {
    ownerValues: ['Manager 2', '0922222222', 'Test address 4'],
    account: { email: 'quanly2@test.com', loaiTaiKhoan: 'quan_ly', linkColumn: 'maQuanLy' },
  },
];

const qid = (value) => `"${value}"`;

const createOwner = async (client, seed) => {
  const placeholders = seed.ownerValues.map((_, index) => `$${index + 1}`).join(', ');
  const result = await client.query(
    `insert into ${qid(seed.ownerTable)} (${seed.ownerColumns.map(qid).join(', ')})
     values (${placeholders})
     returning ${qid(seed.ownerPk)}`,
    seed.ownerValues
  );

  return result.rows[0][seed.ownerPk];
};

const createAccount = async (client, seed, ownerId, passwordHash) => {
  await client.query(
    `insert into "TaiKhoan" ("email", "matKhauHash", "loaiTaiKhoan", ${qid(seed.account.linkColumn)})
     values ($1, $2, $3, $4)`,
    [seed.account.email, passwordHash, seed.account.loaiTaiKhoan, ownerId]
  );
};

const createManager = async (client, seed, employeeId) => {
  const result = await client.query(
    `insert into "QuanLy" ("tenQuanLy", "soDienThoai", "diaChi", "maNhanVien")
     values ($1, $2, $3, $4)
     returning "maQuanLy"`,
    [...seed.ownerValues, employeeId]
  );

  return result.rows[0].maQuanLy;
};

const createMultipleAccounts = async () => {
  const client = await pool.connect();

  try {
    await client.query('begin');
    const passwordHash = await bcrypt.hash(password, 10);

    const employeeIds = [];

    for (const seed of accounts) {
      const ownerId = await createOwner(client, seed);
      await createAccount(client, seed, ownerId, passwordHash);
      if (seed.ownerTable === 'NhanVien') {
        employeeIds.push(ownerId);
      }
      console.log(`Created ${seed.account.email}`);
    }

    for (const [index, seed] of managerSeeds.entries()) {
      const managerId = await createManager(client, seed, employeeIds[index]);
      await createAccount(client, seed, managerId, passwordHash);
      console.log(`Created ${seed.account.email}`);
    }

    await client.query('commit');
    console.log('Done. Password came from TEST_ACCOUNT_PASSWORD.');
  } catch (error) {
    await client.query('rollback');
    console.error('Error:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

createMultipleAccounts();
