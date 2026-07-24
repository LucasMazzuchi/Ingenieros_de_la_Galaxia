// Conexión con la base de datos.
import { Pool } from "pg";
import {existsSync, readFileSync} from "fs";
import {resolve} from "path";

export const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

export const inicializarBD = async () => {
  try {
    const rutaSql = resolve("./bd/init.sql");
    
    if (existsSync(rutaSql)) {
      const sql = readFileSync(rutaSql);
      await db.query(sql);
    }
  } catch (error) {
    console.error("Error al levantar la base de datos: ", error);
  }
};

db.on('connect', () => {
  console.log("Conexión establecida con la base de datos PostgreSQL.");
});