// Conexión con la base de datos.
import { Pool } from 'pg';

export const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

db.on('connect', () => {
  console.log('Conexión establecida con la base de datos PostgreSQL.');
});