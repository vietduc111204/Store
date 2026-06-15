import bcrypt from 'bcrypt';
import { createCrudHandlers } from './crudController.js';
import pool from '../libs/db.js';
import { resetSerialSequence } from '../libs/sequence.js';
import { createAccount, findAccountByEmail } from '../models/User.js';

const EMPLOYEE_ACCOUNT_TYPE = 'nhan_vien';
const EMPLOYEE_ROLE_ID = 2;

const employeeConfig = {
  table: 'NhanVien',
  pk: 'maNhanVien',
  columns: ['tenNhanVien', 'soDienThoai', 'diaChi', 'maQuyen'],
  required: ['tenNhanVien'],
  search: ['tenNhanVien', 'soDienThoai', 'diaChi'],
  orderBy: 'maNhanVien',
  alias: 'nv',
  listSelect: 'nv."maNhanVien", nv."tenNhanVien", nv."soDienThoai", nv."diaChi", nv."maQuyen", tk."email"',
  listFrom: '"NhanVien" nv left join "TaiKhoan" tk on tk."maNhanVien" = nv."maNhanVien"',
};

const employeeHandlers = createCrudHandlers(employeeConfig, 'Employee');

export const listEmployees = employeeHandlers.list;
export const getEmployeeById = employeeHandlers.getById;
export const updateEmployee = async (req, res) => {
  const { email, ...rest } = req.body;
  const client = await pool.connect();
  try {
    await client.query('begin');
    const fields = ['tenNhanVien', 'soDienThoai', 'diaChi', 'maQuyen'];
    const updates = fields.filter((f) => Object.prototype.hasOwnProperty.call(rest, f));
    if (updates.length) {
      const values = updates.map((f) => (rest[f] === '' ? null : rest[f]));
      const setSql = updates.map((f, i) => `"${f}" = $${i + 1}`).join(', ');
      await client.query(
        `update "NhanVien" set ${setSql} where "maNhanVien" = $${updates.length + 1}`,
        [...values, req.params.id]
      );
    }
    if (email !== undefined && email !== '') {
      await client.query(
        'update "TaiKhoan" set "email" = $1 where "maNhanVien" = $2',
        [email, req.params.id]
      );
    }
    await client.query('commit');
    res.json({ message: 'Cap nhat thanh cong' });
  } catch (error) {
    await client.query('rollback');
    console.error('Update employee failed', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};
export const deleteEmployee = async (req, res) => {
  try {
    const accountResult = await pool.query(
      'select 1 from "TaiKhoan" where "maNhanVien" = $1 limit 1',
      [req.params.id]
    );
    if (accountResult.rowCount) {
      return res.status(409).json({ message: 'Không thể xóa nhân viên đang có tài khoản' });
    }
    return employeeHandlers.remove(req, res);
  } catch (error) {
    console.error('Delete employee failed', error);
    return res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  const client = await pool.connect();

  try {
    const { tenNhanVien, soDienThoai, diaChi, email, password } = req.body;

    if (!tenNhanVien || !email || !password) {
      return res.status(400).json({ message: 'Thieu ten nhan vien, email hoac password' });
    }

    const existing = await findAccountByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email da ton tai' });
    }

    await client.query('begin');
    await resetSerialSequence(client, 'NhanVien', 'maNhanVien');

    const employeeResult = await client.query(
      `insert into "NhanVien" ("tenNhanVien", "soDienThoai", "diaChi", "maQuyen")
       values ($1, $2, $3, $4)
       returning "maNhanVien"`,
      [tenNhanVien, soDienThoai || null, diaChi || null, EMPLOYEE_ROLE_ID]
    );

    const matKhauHash = await bcrypt.hash(password, 10);
    const account = await createAccount(client, {
      email,
      matKhauHash,
      loaiTaiKhoan: EMPLOYEE_ACCOUNT_TYPE,
      maNhanVien: employeeResult.rows[0].maNhanVien,
    });

    await client.query('commit');
    return res.status(201).json({
      maNhanVien: account.maNhanVien,
      tenNhanVien: account.tenNhanVien,
      soDienThoai: account.soDienThoaiNhanVien,
      diaChi: account.diaChiNhanVien,
      maQuyen: EMPLOYEE_ROLE_ID,
    });
  } catch (error) {
    await client.query('rollback');
    console.error('Employee account insert query failed', error);
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};
