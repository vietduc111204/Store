import dotenv from 'dotenv';
import pool from '../src/libs/db.js';

dotenv.config();

try {
  const result = await pool.query(`
    select
      current_database() as database,
      current_user as username,
      current_schema() as schema,
      inet_server_addr()::text as server_address,
      inet_server_port() as server_port
  `);

  const url = new URL(process.env.DATABASE_URL);
  console.table([
    {
      envHost: url.hostname,
      envDatabase: url.pathname.replace(/^\//, ''),
      envUser: decodeURIComponent(url.username),
      ...result.rows[0],
    },
  ]);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
