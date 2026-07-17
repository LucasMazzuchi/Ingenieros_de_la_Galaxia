import { db } from "./pool.js";
import { armar_consulta } from "./consultas.js";
export async function getAllVehiculos({ texto, procesados }) {
    const res = await db.query(texto, procesados);
    return res.rows;
}

export async function getVehiculo(id) {
    const solicitud = "SELECT v.id, v.nombre, c.nombre as ubicacion, v.tipo, v.motor, v.estructura, v.color, v.combustible, v.imagenURL FROM Vehiculos as v, CuerposCelestes as c WHERE v.id=$1 AND c.id=v.ubicacionId AND v.borrado = FALSE AND c.borrado = FALSE";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

export async function createVehiculo(vehiculo) {
    const solicitud = "INSERT INTO Vehiculos (nombre, tipo, motor, estructura, color, combustible, ubicacionId, imagenURL, borrado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
    const valores = [vehiculo.nombre, vehiculo.tipo, vehiculo.motor, vehiculo.estructura, vehiculo.color, vehiculo.combustible, vehiculo.ubicacionId, vehiculo.imagenURL, false];
    const res = await db.query(solicitud, valores);
      return res.rowCount == 1;
}

export async function removeVehiculo(id){
    const solicitud = "UPDATE Vehiculos SET borrado = TRUE WHERE id=$1 AND borrado = FALSE RETURNING *";
    const res = await db.query(solicitud, [id]);
    return {ok : res.rowCount == 1, vehiculo : res.rows[0]};
}
export async function updateVehiculo(id, vehiculo){
    const { consulta, valores } = armar_consulta(id, vehiculo);
    const solicitud = `UPDATE Vehiculos SET ${consulta} WHERE id=$1 AND borrado = FALSE`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}
