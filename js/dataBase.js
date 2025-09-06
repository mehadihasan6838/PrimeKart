import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

export async function execute(query, params = []) {
  const [rows] = await pool.execute(query, params);
  return rows;
}

export default pool;

