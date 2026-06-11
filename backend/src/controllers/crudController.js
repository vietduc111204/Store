import pool from '../libs/db.js';
import { resetSerialSequence } from '../libs/sequence.js';

const qid = (name) => `"${name}"`;
const table = (config) => qid(config.table);
const aliasColumn = (config, column) => (config.alias ? `${config.alias}.${qid(column)}` : qid(column));

const normalizeBody = (body, columns) => {
  const data = {};
  for (const column of columns) {
    if (Object.prototype.hasOwnProperty.call(body, column)) {
      data[column] = body[column] === '' ? null : body[column];
    }
  }
  return data;
};

const validateRequired = (data, required) => {
  const missing = required.filter((column) => data[column] === undefined || data[column] === null);
  return missing.length ? `Thieu truong bat buoc: ${missing.join(', ')}` : null;
};

const parseId = (config, req) => {
  if (!Array.isArray(config.pk)) {
    return {
      where: `${qid(config.pk)} = $1`,
      values: [req.params.id],
    };
  }

  const [firstPk, secondPk] = config.pk;
  const [firstValue, secondValue] = String(req.params.id).split(':');
  return {
    where: `${qid(firstPk)} = $1 and ${qid(secondPk)} = $2`,
    values: [firstValue, secondValue],
  };
};

const resetCrudSerialSequence = async (client, config) => {
  if (Array.isArray(config.pk)) return;

  await resetSerialSequence(client, config.table, config.pk);
};

export const createCrudHandlers = (config, label = 'Record') => ({
  list: async (req, res) => {
    try {
      const values = [];
      let where = '';
      const q = req.query.q?.toString().trim();

      if (q && config.search.length) {
        values.push(`%${q}%`);
        where = ` where ${config.search.map((column) => `${aliasColumn(config, column)} ilike $1`).join(' or ')}`;
      }

      const limit = Math.min(Number(req.query.limit) || 100, 500);
      values.push(limit);

      const select = config.listSelect || '*';
      const from = config.listFrom || table(config);
      const orderColumn = aliasColumn(config, config.orderBy);
      const result = await pool.query(
        `select ${select} from ${from}${where} order by ${orderColumn} desc limit $${values.length}`,
        values
      );

      res.json(result.rows);
    } catch (error) {
      console.error(`${label} list query failed`, error);
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const id = parseId(config, req);
      const result = await pool.query(`select * from ${table(config)} where ${id.where}`, id.values);

      if (!result.rowCount) return res.status(404).json({ message: 'Khong tim thay du lieu' });
      res.json(result.rows[0]);
    } catch (error) {
      console.error(`${label} get query failed`, error);
      res.status(500).json({ message: error.message });
    }
  },

  create: async (req, res) => {
    const data = normalizeBody(req.body, config.columns);
    const errorMessage = validateRequired(data, config.required);
    if (errorMessage) return res.status(400).json({ message: errorMessage });

    try {
      await resetCrudSerialSequence(pool, config);
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
      const result = await pool.query(
        `insert into ${table(config)} (${columns.map(qid).join(', ')}) values (${placeholders}) returning *`,
        values
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(`${label} insert query failed`, error);
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    const data = normalizeBody(req.body, config.columns);
    const columns = Object.keys(data);
    if (!columns.length) return res.status(400).json({ message: 'Khong co du lieu cap nhat' });

    try {
      const values = Object.values(data);
      const setSql = columns.map((column, index) => `${qid(column)} = $${index + 1}`).join(', ');
      const id = parseId(config, req);
      const where = id.where.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + values.length}`);
      const result = await pool.query(
        `update ${table(config)} set ${setSql} where ${where} returning *`,
        [...values, ...id.values]
      );

      if (!result.rowCount) return res.status(404).json({ message: 'Khong tim thay du lieu' });
      res.json(result.rows[0]);
    } catch (error) {
      console.error(`${label} update query failed`, error);
      res.status(500).json({ message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const id = parseId(config, req);
      const result = await pool.query(`delete from ${table(config)} where ${id.where}`, id.values);

      if (!result.rowCount) return res.status(404).json({ message: 'Khong tim thay du lieu' });
      await resetCrudSerialSequence(pool, config);
      res.json({ message: 'Xoa thanh cong' });
    } catch (error) {
      console.error(`${label} delete query failed`, error);
      res.status(500).json({ message: error.message });
    }
  },
});
