import { db } from "./pool.js";
import { armar_consulta } from "./consultas.js";
export async function getAllVehiculos({ texto, procesados }) {
    const res = await db.query(texto, procesados);
    return res.rows;
}

export async function getVehiculo(id) {
    const solicitud = "SELECT v.id, v.nombre, v.tipo, v.motor, v.estructura, v.resistencia, v.combustible, v.punto_interes FROM vehiculos as v WHERE v.id=$1 AND v.borrado = FALSE";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

export async function createVehiculo(vehiculo) {
    const solicitud = "INSERT INTO vehiculos (nombre, tipo, motor, estructura, combustible, resistencia, punto_interes, borrado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id";
    const valores = [vehiculo.nombre, vehiculo.tipo, vehiculo.motor, vehiculo.estructura, vehiculo.combustible, vehiculo.punto_interes, vehiculo.resistencia, false];
    const res = await db.query(solicitud, valores);
    return {vehiculo : res.rowCount == 1, id : res.rows[0].id};
}

export async function removeVehiculo(id){
    const solicitud = "UPDATE vehiculos SET borrado = TRUE WHERE id=$1 AND borrado = FALSE RETURNING *";
    const res = await db.query(solicitud, [id]);
    return {ok : res.rowCount == 1, vehiculo : res.rows[0]};
}
export async function updateVehiculo(id, vehiculo){
    const { consulta, valores, numeroId } = armar_consulta(id, vehiculo);
    const solicitud = `UPDATE vehiculos SET ${consulta} WHERE id=$${numeroId} AND borrado = FALSE`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}

export async function cantidadVehiculos(){
    const res = await db.query("SELECT COUNT(*) FROM vehiculos WHERE borrado=FALSE");
    return Number(res.rows[0].count);
}