// Importamos ÚNICAMENTE la clase Pool mediante destructuring directo
import { Pool } from 'pg';

export const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error de conexión en Postgres:', err.stack);
  } else {
    console.log('🚀 Base de datos conectada con éxito. Hora:', res.rows[0].now);
  }
});