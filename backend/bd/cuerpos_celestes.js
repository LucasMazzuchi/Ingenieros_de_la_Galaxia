import { db } from "./pool.js";
import { armar_consulta } from "./consultas.js";

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
    const solicitud = "INSERT INTO CuerposCelestes (nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, x, y, imagenURL, borrado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)";
    const valores = [cuerpo.nombre, cuerpo.descripcion, cuerpo.tipo, cuerpo.diametro, cuerpo.gravedad, cuerpo.temperatura, cuerpo.habitable, cuerpo.terreno, cuerpo.x, cuerpo.y, cuerpo.imagenURL, "FALSE"];
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}

export async function removeCuerpoCeleste(id) {
    const consultaVehiculos = "SELECT 1 FROM Vehiculos WHERE ubicacionId = $1 AND borrado = FALSE LIMIT 1";
    const resVehiculos = await db.query(consultaVehiculos, [id]);
    const consultaMisiones = "SELECT 1 FROM Misiones WHERE cuerpoCelesteId = $1 AND borrado = FALSE LIMIT 1";
    const resMisiones = await db.query(consultaMisiones, [id]);
    if (resVehiculos.rowCount > 0 || resMisiones.rowCount > 0) {
        return {ok: false, cuerpoCeleste: null, tieneDependientes: true};
    }
    const consultaUpdate = "UPDATE CuerposCelestes SET borrado = TRUE WHERE id = $1 AND borrado = FALSE RETURNING *";
    const resBorrado = await db.query(consultaUpdate, [id]);
    return { ok: resBorrado.rowCount === 1, cuerpoCeleste: resBorrado.rows[0], tieneDependientes: false };
}

export async function updateCuerpoCeleste(id, cuerpo){
    const { consulta, valores } = armar_consulta(id, cuerpo)
    const solicitud = `UPDATE CuerposCelestes SET ${consulta} WHERE id=$1 AND borrado = FALSE`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}
