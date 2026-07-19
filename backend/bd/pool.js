import pg from 'pg';

const { Pool } = pg;

// Configuración utilizando las variables de entorno del docker-compose
export const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

// Mensaje de diagnóstico para asegurar que conectó bien en el contenedor
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error de conexión en la galaxia de Postgres:', err.stack);
  } else {
    console.log('🚀 Base de datos espacial conectada con éxito. Hora del servidor:', res.rows[0].now);
  }
});