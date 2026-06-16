import pool from '../libs/db.js';
import { createCrudHandlers } from './crudController.js';

const productConfig = {
  table: 'SanPham',
  pk: 'maSanPham',
  columns: ['tenSanPham', 'gia', 'soLuong', 'anh', 'anhPhu', 'maDanhMuc', 'thongSoKyThuat', 'giamGia', 'ngayBatDauGiam', 'ngayKetThucGiam'],
  required: ['tenSanPham', 'gia', 'soLuong'],
  search: ['tenSanPham'],
  orderBy: 'maSanPham',
  listSelect:
    's.*, d."tenDanhMuc", k."tenKhuyenMai",' +
    ' s."ngayBatDauGiam" as "ngayBatDau", s."ngayKetThucGiam" as "ngayKetThuc",' +
    ' case when coalesce(s."giamGia", 0) > 0' +
    '   and (s."ngayBatDauGiam" is null or s."ngayBatDauGiam" <= current_date)' +
    '   and (s."ngayKetThucGiam" is null or s."ngayKetThucGiam" >= current_date)' +
    ' then s."giamGia" else 0 end as "phanTramGiam"',
  listFrom:
    '"SanPham" s left join "DanhMuc" d on d."maDanhMuc" = s."maDanhMuc" left join "KhuyenMai" k on k."maKhuyenMai" = s."maKhuyenMai"',
  alias: 's',
};

const productHandlers = createCrudHandlers(productConfig, 'Product');

const validateProductRelations = async (body) => {
  if (body.maDanhMuc) {
    const category = await pool.query('select 1 from "DanhMuc" where "maDanhMuc" = $1', [body.maDanhMuc]);
    if (!category.rowCount) return 'Ma danh muc khong ton tai';
  }

  return null;
};

const validateProductNumbers = (body) => {
  if (Object.prototype.hasOwnProperty.call(body, 'soLuong')) {
    const quantity = Number(body.soLuong);
    if (!Number.isInteger(quantity) || quantity < 0) return 'So luong san pham phai la so nguyen khong am';
  }

  if (Object.prototype.hasOwnProperty.call(body, 'gia')) {
    const price = Number(body.gia);
    if (!Number.isFinite(price) || price < 0) return 'Gia san pham phai la so khong am';
  }

  if (Object.prototype.hasOwnProperty.call(body, 'giamGia') && body.giamGia !== null && body.giamGia !== '') {
    const discount = Number(body.giamGia);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) return 'Phan tram giam phai tu 0 den 100';
  }

  if (body.ngayBatDauGiam && body.ngayKetThucGiam && body.ngayKetThucGiam < body.ngayBatDauGiam) {
    return 'Ngay ket thuc giam gia khong duoc truoc ngay bat dau';
  }

  return null;
};

const normalizeProductSpecs = (body) => {
  if (!Object.prototype.hasOwnProperty.call(body, 'thongSoKyThuat')) return null;

  const rawSpecs = body.thongSoKyThuat;
  if (!rawSpecs) {
    body.thongSoKyThuat = null;
    return null;
  }

  body.thongSoKyThuat = String(rawSpecs)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n') || null;
  return null;
};

const normalizeProductImages = (body) => {
  if (!Object.prototype.hasOwnProperty.call(body, 'anhPhu')) return null;

  const rawImages = body.anhPhu;
  if (!rawImages) {
    body.anhPhu = null;
    return null;
  }

  body.anhPhu = String(rawImages)
    .split('\n')
    .map((image) => image.trim())
    .filter(Boolean)
    .join('\n') || null;
  return null;
};

export const listProducts = productHandlers.list;
export const getProductById = productHandlers.getById;
export const createProduct = async (req, res) => {
  const numberError = validateProductNumbers(req.body);
  if (numberError) return res.status(400).json({ message: numberError });
  const imagesError = normalizeProductImages(req.body);
  if (imagesError) return res.status(400).json({ message: imagesError });
  const specsError = normalizeProductSpecs(req.body);
  if (specsError) return res.status(400).json({ message: specsError });
  const errorMessage = await validateProductRelations(req.body);
  if (errorMessage) return res.status(400).json({ message: errorMessage });
  return productHandlers.create(req, res);
};

export const updateProduct = async (req, res) => {
  const numberError = validateProductNumbers(req.body);
  if (numberError) return res.status(400).json({ message: numberError });
  const imagesError = normalizeProductImages(req.body);
  if (imagesError) return res.status(400).json({ message: imagesError });
  const specsError = normalizeProductSpecs(req.body);
  if (specsError) return res.status(400).json({ message: specsError });
  const errorMessage = await validateProductRelations(req.body);
  if (errorMessage) return res.status(400).json({ message: errorMessage });
  return productHandlers.update(req, res);
};
export const deleteProduct = productHandlers.remove;
