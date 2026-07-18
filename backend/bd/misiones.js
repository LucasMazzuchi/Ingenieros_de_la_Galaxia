import { db } from "./pool.js";
import { armar_consulta } from "./consultas.js";

export async function getAllMisiones({ texto, procesados }) {
    const res = await db.query(texto, procesados);
    return res.rows;
}

export async function getMision(id) {
    const solicitud = "SELECT m.id, m.nombre, c.nombre AS cuerpo_celeste, m.descripcion, m.relevancia, m.porcentaje, m.disponible FROM misiones as m, cuerpos_celestes as c WHERE m.id = $1 AND c.id = m.cuerpo_celeste_id AND m.borrado = FALSE AND c.borrado = FALSE";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

export async function createMision(mision) {
    const solicitud = "INSERT INTO misiones (nombre, descripcion, relevancia, porcentaje, disponible, cuerpo_celeste_id, borrado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id";
    const valores = [mision.nombre, mision.descripcion, mision.relevancia, mision.porcentaje, mision.disponible, mision.cuerpo_celeste_id, false];
    const res = await db.query(solicitud, valores);
    return {mision : res.rowCount == 1, id : res.rows[0].id};
}

export async function removeMision(id){
    const solicitud = "UPDATE misiones SET borrado = TRUE WHERE id=$1 AND borrado = FALSE RETURNING *";
    const res = await db.query(solicitud, [id]);
    return {ok : res.rowCount == 1, mision : res.rows[0]};
}

export async function updateMision(id, mision){
    const { consulta, valores } = armar_consulta(id, mision)
    const solicitud = `UPDATE misiones SET ${consulta} WHERE id=$1 AND borrado = FALSE`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}

export async function cantidadMisiones(id){
    const res = await db.query("SELECT COUNT(*) FROM misiones WHERE borrado=FALSE AND cuerpo_celeste_id=$1", [id]);
    return Number(res.rows[0].count);
}