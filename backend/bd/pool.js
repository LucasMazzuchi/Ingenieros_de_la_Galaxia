// Conexión con la base de datos.
import { Pool } from "pg";
import {existsSync, readFileSync} from "fs";

// Arma la conexión a la base de datos con las variables declaradas en el .env.
export const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

// La función lee el archivo que se encuentra en ruta y lo convierte en una cadena, para después mandarla como petición a la base de datos.
// En caso de que no exista la base de datos lo imprime por la consola del backend.
const _inicializarBd = async (ruta, encoding) => {
  try {
    const sql = readFileSync(ruta, encoding);
    await db.query(sql);
  } catch (error) {
    console.error("Error al levantar la base de datos: ", error);
  }
};

// La función inicializa la base de datos a través de _inicializarBd pasando la ruta al init y el encoding, si no existe la base de datos, la crea.
// Si existe y está vacía, la llena con los datos que están dentro del init. Si existe y no está vacía, no hace nada.
export const inicializarBd = async () => {
  try {
    const res = await db.query("SELECT COUNT(*) FROM cuerpos_celestes");
    if (res.rows[0].count == 0) {
      await _inicializarBd("./bd/init.sql", "utf-8");
    }
  } catch (error) {
    await _inicializarBd("./bd/init.sql", "utf-8"); // Si no existe, la crea.
  }
};
db.on('connect', () => {
  console.log("Conexión establecida con la base de datos PostgreSQL.");
});