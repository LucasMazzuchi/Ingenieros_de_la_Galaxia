import { db } from "bd/pool.js";

export async function getAllCuerposCelestes({ texto, procesados }) {
    const res = await db.query(texto, procesados);
    return res.rows;
}

export async function getCuerpoCeleste(id) {
    const solicitud = "SELECT id, nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, x, y, imagenURL FROM cuerposCelestes WHERE id=$1 AND borrado = FALSE";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

export async function createCuerpoCeleste(cuerpo) {
    const solicitud = "INSERT INTO CuerposCelestes (nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, x, y, imagenURL, borrado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)";
    const valores = [cuerpo.nombre, cuerpo.descripcion, cuerpo.tipo, cuerpo.diametro, cuerpo.gravedad, cuerpo.temperatura, cuerpo.habitable, cuerpo.terreno, cuerpo.x, cuerpo.y, cuerpo.imagenURL, "FALSE"];
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}

export async function removeCuerpoCeleste(id){
    const solicitud = " Update CuerposCelestes SET borrado = TRUE WHERE id=$1";
    const res = await db.query(solicitud, [id]);
    return res.rowCount == 1;
}

export async function updateCuerpoCeleste(cuerpo){
    const { consulta, valores } = armar_consulta(cuerpo)
    const solicitud = `UPDATE CuerposCelestes SET ${consulta} WHERE id=$1`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}