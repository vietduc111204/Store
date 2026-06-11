import bcrypt from 'bcrypt';
import { createCrudHandlers } from './crudController.js';
import pool from '../libs/db.js';
import { resetSerialSequence } from '../libs/sequence.js';
import { createAccount, findAccountByEmail } from '../models/User.js';

const CUSTOMER_ACCOUNT_TYPE = 'khach_hang';
const CUSTOMER_ROLE_ID = 3;

const customerConfig = {
  table: 'KhachHang',
  pk: 'maKhachHang',
  columns: ['tenKhachHang', 'soDienThoai', 'email', 'diaChi', 'maQuyen'],
  required: ['tenKhachHang'],
  search: ['tenKhachHang', 'soDienThoai', 'email', 'diaChi'],
  orderBy: 'maKhachHang',
  listSelect:
    '"maKhachHang" as "maThanhVien", "tenKhachHang" as "tenThanhVien", "soDienThoai", "email", "diaChi", "maQuyen"',
};

const customerHandlers = createCrudHandlers(customerConfig, 'Customer');

export const listCustomers = customerHandlers.list;
export const getCustomerById = customerHandlers.getById;
export const updateCustomer = customerHandlers.update;
export const deleteCustomer = customerHandlers.remove;

export const createCustomer = async (req, res) => {
  const client = await pool.connect();

  try {
    const { tenKhachHang, tenThanhVien, soDienThoai, email, diaChi, password } = req.body;
    const displayName = tenKhachHang || tenThanhVien;

    if (!displayName || !email || !password) {
      return res.status(400).json({ message: 'Thieu ten khach hang, email hoac password' });
    }

    const existing = await findAccountByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email da ton tai' });
    }

    await client.query('begin');
    await resetSerialSequence(client, 'KhachHang', 'maKhachHang');

    const customerResult = await client.query(
      `insert into "KhachHang" ("tenKhachHang", "soDienThoai", "email", "diaChi", "maQuyen")
       values ($1, $2, $3, $4, $5)
       returning "maKhachHang"`,
      [displayName, soDienThoai || null, email, diaChi || null, CUSTOMER_ROLE_ID]
    );

    const matKhauHash = await bcrypt.hash(password, 10);
    const account = await createAccount(client, {
      email,
      matKhauHash,
      loaiTaiKhoan: CUSTOMER_ACCOUNT_TYPE,
      maKhachHang: customerResult.rows[0].maKhachHang,
    });

    await client.query('commit');
    return res.status(201).json({
      maThanhVien: account.maKhachHang,
      tenThanhVien: account.tenThanhVien,
      soDienThoai: account.soDienThoaiKhachHang,
      email: account.email,
      diaChi: account.diaChiKhachHang,
      maQuyen: CUSTOMER_ROLE_ID,
    });
  } catch (error) {
    await client.query('rollback');
    console.error('Customer account insert query failed', error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};
