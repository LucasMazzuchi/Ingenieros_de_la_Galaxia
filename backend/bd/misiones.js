import { db } from "./pool.js";
import { armar_consulta } from "./consultas.js";

export async function getAllMisiones({ texto, procesados }) {
    const res = await db.query(texto, procesados);
    return res.rows;
}

export async function getMision(id) {
    const solicitud = "SELECT m.id, m.nombre, c.nombre AS cuerpo_celeste, m.descripcion, m.relevancia, m.porcentaje, m.disponible, m.imagenURL FROM Misiones as m, CuerposCelestes as c WHERE m.id = $1 AND c.id = m.cuerpoCelesteId AND m.borrado = FALSE AND c.borrado = FALSE";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

export async function createMision(mision) {
    const solicitud = "INSERT INTO Misiones (nombre, descripcion, relevancia, porcentaje, disponible, cuerpoCelesteId, imagenURL, borrado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
    const valores = [mision.nombre, mision.descripcion, mision.relevancia, mision.porcentaje, mision.disponible, mision.cuerpoCelesteId, mision.imagenURL, "FALSE"];
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}

export async function removeMision(id){
    const solicitud = "UPDATE Misiones SET borrado = TRUE WHERE id=$1 AND borrado = FALSE RETURNING *";
    const res = await db.query(solicitud, [id]);
    return {ok : res.rowCount == 1, mision : res.rows[0]};
}

export async function updateMision(id, mision){
    const { consulta, valores } = armar_consulta(id, mision)
    const solicitud = `UPDATE Misiones SET ${consulta} WHERE id=$1 AND borrado = FALSE`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}
