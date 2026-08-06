// Conexión con la base de datos.
import { Pool } from "pg";
import {existsSync, readFileSync} from "fs";

export const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});
const _inicializarBd = async () => {
  try {
    if (existsSync("./bd/init.sql")) {
      const sql = readFileSync("./bd/init.sql", "utf-8");
      await db.query(sql);
    }
  } catch (error) {
    console.error("Error al levantar la base de datos: ", error);
  }
};

export const inicializarBd = async () => {
  try {
    const res = await db.query("SELECT COUNT(*) FROM cuerpos_celestes");
    if (res.rows[0].count == 0) {
      await _inicializarBd();
    }
  } catch (error) {
    await _inicializarBd();
  }
};
db.on('connect', () => {
  console.log("Conexión establecida con la base de datos PostgreSQL.");
});