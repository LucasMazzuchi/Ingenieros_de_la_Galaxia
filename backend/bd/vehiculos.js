import { db } from "bd/pool.js";
import { armar_consulta } from "bd/consultas";
export async function getAllVehiculos({ texto, procesados }) {
    const res = await db.query(texto, procesados);
    return res.rows;
}

export async function getVehiculo(id) {
    const solicitud = "SELECT v.id, v.nombre, c.nombre as ubicacion, v.tipo, v.motor, v.estructura, v.color, v.combustible, v.imagenURL FROM Vehiculos as v, CuerposCelestes as c WHERE v.id=$1 and c.id=v.ubicacionId";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

export async function createVehiculo(vehiculo) {
    const solicitud = "INSERT INTO Vehiculos (nombre, tipo, motor, estructura, color, combustible, ubicacionId, imagenURL) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
    const valores = [vehiculo.nombre, vehiculo.tipo, vehiculo.motor, vehiculo.estructura, vehiculo.color, vehiculo.combustible, vehiculo.ubicacionId, vehiculo.imagenURL];
    const res = await db.query(solicitud, valores);
      return res.rowCount == 1;
}

export async function removeVehiculo(id){
    const solicitud = "DELETE FROM Vehiculos WHERE id=$1  RETURNING *";
    const res = await db.query(solicitud, [id]);
    return {ok : res.rowCount == 1, vehiculo : res.rows[0]};
}
export async function updateVehiculo(id, vehiculo){
    const { consulta, valores } = armar_consulta(vehiculo);
    const solicitud = `UPDATE Vehiculos SET ${consulta} WHERE id=$1`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}
