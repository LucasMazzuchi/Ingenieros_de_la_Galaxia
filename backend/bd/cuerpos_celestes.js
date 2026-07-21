import { db } from "./pool.js";
import { armar_consulta, verificarDependencia } from "./consultas.js";

export async function getAllCuerposCelestes({ texto, procesados }) {
    const res = await db.query(texto, procesados);
    return res.rows;
}

export async function getCuerpoCeleste(id) {
    const solicitud = "SELECT id, nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, posicion FROM cuerpos_celestes WHERE id=$1 AND borrado = FALSE";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

export async function createCuerpoCeleste(cuerpo) {
    const solicitud = "INSERT INTO cuerpos_celestes (nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, posicion, borrado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id";
    const valores = [cuerpo.nombre, cuerpo.descripcion, cuerpo.tipo, cuerpo.diametro, cuerpo.gravedad, cuerpo.temperatura, cuerpo.habitable, cuerpo.terreno, cuerpo.posicion, false];
    const res = await db.query(solicitud, valores);
    return {cuerpo : res.rowCount == 1, id : res.rows[0].id};
}

export async function removeCuerpoCeleste(id) {
   if (await verificarDependencia(id)) {
    return {ok: false, cuerpoCeleste: null, tieneDependientes: true};
   }
    const consultaUpdate = "UPDATE cuerpos_celestes SET borrado = TRUE WHERE id = $1 AND borrado = FALSE RETURNING *";
    const resBorrado = await db.query(consultaUpdate, [id]);
    return { ok: resBorrado.rowCount === 1, cuerpoCeleste: resBorrado.rows[0], tieneDependientes: false };
}

export async function updateCuerpoCeleste(id, cuerpo){
    const { consulta, valores, numeroId } = armar_consulta(id, cuerpo)
    const solicitud = `UPDATE cuerpos_celestes SET ${consulta} WHERE id=$${numeroId} AND borrado = FALSE`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}

export async function cantidadCuerposCelestes(){
    const res = await db.query(" SELECT COUNT(*) FROM cuerpos_celestes WHERE borrado=FALSE");
    return Number(res.rows[0].count);
}
