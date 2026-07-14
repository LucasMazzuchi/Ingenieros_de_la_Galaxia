import { db } from "bd/pool.js";

export async function getAllVehiculos() {
    const res = await db.query(
        "SELECT v.nombre, v.tipo, c.nombre as ubicacion, v.motor, v.estructura, v.color, v.combustible, v.imagenURL FROM Vehiculos as v, CuerposCelestes as c WHERE c.id=v.ubicacionId"
    );
    return res.rows;
}

export async function getVehiculo(id) {
    const solicitud = "SELECT v.nombre, c.nombre as ubicacion, v.tipo, v.motor, v.estructura, v.color, v.combustible, v.imagenURL FROM Vehiculos as v, CuerposCelestes as c WHERE v.id=$1 and c.id=v.ubicacionId";
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
    const solicitud = "Update Vehiculos SET nombre=$2, tipo=$3, motor=$4, estructura=$5, color=$6, combustible=$7, ubicacionId=$8, imagenURL=$9 WHERE id=$1";
    const valores = [id, vehiculo.nombre, vehiculo.tipo, vehiculo.motor, vehiculo.estructura, vehiculo.color, vehiculo.combustible, vehiculo.ubicacionId, vehiculo.imagenURL];
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}