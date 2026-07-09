import { Pool } from "pg";

export const db = new Pool({
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "galacticos",
  host: process.env.DB_HOST ?? "bd",
  port: process.env.DB_PORT ?? 5432,
  database: process.env.DB_NAME ?? "esapcio_bd",
});