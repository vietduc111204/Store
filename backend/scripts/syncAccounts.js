import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

const PASSWORD = process.env.SEED_ACCOUNT_PASSWORD || 'change-me-before-use';

const accounts = [
  {
    email: 'customer1@example.com',
    type: 'khach_hang',
    ownerTable: 'KhachHang',
    ownerPk: 'maThanhVien',
    ownerNameColumn: 'tenThanhVien',
    owner: { tenThanhVien: 'Customer 1', soDienThoai: '0900000001', email: 'customer1@example.com' },
  },
  {
    email: 'customer2@example.com',
    type: 'khach_hang',
    ownerTable: 'KhachHang',
    ownerPk: 'maThanhVien',
    ownerNameColumn: 'tenThanhVien',
    owner: { tenThanhVien: 'Customer 2', soDienThoai: '0900000002', email: 'customer2@example.com' },
  },
  {
    email: 'customer3@example.com',
    type: 'khach_hang',
    ownerTable: 'KhachHang',
    ownerPk: 'maThanhVien',
    ownerNameColumn: 'tenThanhVien',
    owner: { tenThanhVien: 'Customer 3', soDienThoai: '0900000003', email: 'customer3@example.com' },
  },
  {
    email: 'nhanvien1@smarthome.vn',
    type: 'nhan_vien',
    ownerTable: 'NhanVien',
    ownerPk: 'maNhanVien',
    ownerNameColumn: 'tenNhanVien',
    owner: { tenNhanVien: 'Nhân viên 1', soDienThoai: '0910000001', diaChi: 'SmartHome' },
  },
  {
    email: 'nhanvien2@smarthome.vn',
    type: 'nhan_vien',
    ownerTable: 'NhanVien',
    ownerPk: 'maNhanVien',
    ownerNameColumn: 'tenNhanVien',
    owner: { tenNhanVien: 'Nhân viên 2', soDienThoai: '0910000002', diaChi: 'SmartHome' },
  },
  {
    email: 'nhanvien3@smarthome.vn',
    type: 'nhan_vien',
    ownerTable: 'NhanVien',
    ownerPk: 'maNhanVien',
    ownerNameColumn: 'tenNhanVien',
    owner: { tenNhanVien: 'Nhân viên 3', soDienThoai: '0910000003', diaChi: 'SmartHome' },
  },
  {
    email: 'quanly1@smarthome.vn',
    type: 'quan_ly',
    ownerTable: 'QuanLy',
    ownerPk: 'maQuanLy',
    ownerNameColumn: 'tenQuanLy',
    owner: { tenQuanLy: 'Quản lý 1', soDienThoai: '0920000001', diaChi: 'SmartHome' },
  },
  {
    email: 'quanly2@smarthome.vn',
    type: 'quan_ly',
    ownerTable: 'QuanLy',
    ownerPk: 'maQuanLy',
    ownerNameColumn: 'tenQuanLy',
    owner: { tenQuanLy: 'Quản lý 2', soDienThoai: '0920000002', diaChi: 'SmartHome' },
  },
];

const qid = (value) => `"${value}"`;

const createOwner = async (client, account) => {
  const columns = Object.keys(account.owner);
  const values = Object.values(account.owner);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

  const result = await client.query(
    `insert into ${qid(account.ownerTable)} (${columns.map(qid).join(', ')})
     values (${placeholders})
     returning ${qid(account.ownerPk)}`,
    values
  );

  return result.rows[0][account.ownerPk];
};

const findExistingAccount = async (client, email) => {
  const result = await client.query(
    'select * from "TaiKhoan" where lower("email") = lower($1)',
    [email]
  );
  return result.rows[0] || null;
};

const sync = async () => {
  const client = await pool.connect();

  try {
    await client.query('begin');
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    for (const account of accounts) {
      const existing = await findExistingAccount(client, account.email);

      if (existing) {
        await client.query(
          'update "TaiKhoan" set "matKhauHash" = $1, "updatedAt" = current_timestamp where "maTaiKhoan" = $2',
          [passwordHash, existing.maTaiKhoan]
        );
        console.log(`Updated password for: ${account.email}`);
        continue;
      }

      const ownerId = await createOwner(client, account);
      const owner = {
        maKhachHang: account.type === 'khach_hang' ? ownerId : null,
        maNhanVien: account.type === 'nhan_vien' ? ownerId : null,
        maQuanLy: account.type === 'quan_ly' ? ownerId : null,
      };

      await client.query(
        `insert into "TaiKhoan"
          ("email", "matKhauHash", "loaiTaiKhoan", "maKhachHang", "maNhanVien", "maQuanLy")
         values ($1, $2, $3, $4, $5, $6)`,
        [account.email, passwordHash, account.type, owner.maKhachHang, owner.maNhanVien, owner.maQuanLy]
      );
      console.log(`Created: ${account.email}`);
    }

    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

sync();
