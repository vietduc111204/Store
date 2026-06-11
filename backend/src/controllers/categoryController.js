import { createCrudHandlers } from './crudController.js';

const categoryConfig = {
  table: 'DanhMuc',
  pk: 'maDanhMuc',
  columns: ['tenDanhMuc'],
  required: ['tenDanhMuc'],
  search: ['tenDanhMuc'],
  orderBy: 'maDanhMuc',
};

const categoryHandlers = createCrudHandlers(categoryConfig, 'Category');

export const listCategories = categoryHandlers.list;
export const getCategoryById = categoryHandlers.getById;
export const createCategory = categoryHandlers.create;
export const updateCategory = categoryHandlers.update;
export const deleteCategory = categoryHandlers.remove;
