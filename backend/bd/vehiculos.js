import { db } from "bd/pool.js";

export async function getAllVehiculos() {
    const res = await db.query(
        "SELECT v.nombre, v.tipo, c.nombre as ubicacion, v.motor, v.estructura, v.color, v.combustible FROM Vehiculos as v, CuerposCelestes as c WHERE c.id=v.ubicacionId"
    );
    return res.rows;
}

export async function getVehiculo(id) {
    const solicitud = "SELECT v.nombre, c.nombre as ubicacion, v.tipo, v.motor, v.estructura, v.color, v.combustible FROM Vehiculos as v, CuerposCelestes as c WHERE v.id=$1 and c.id=v.ubicacionId";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

export async function createVehiculo(vehiculo) {
    const solicitud = "INSERT INTO Vehiculos (nombre, tipo, motor, estructura, color, combustible, ubicacionId) VALUES ($1, $2, $3, $4, $5, $6, $7)";
    const valores = [vehiculo.nombre, vehiculo.tipo, vehiculo.motor, vehiculo.estructura, vehiculo.color, vehiculo.combustible, vehiculo.ubicacionId];
    const res = await db.query(solicitud, valores);
      return res.rowCount == 1;
}

export async function removeVehiculo(id){
    const solicitud = "DELETE FROM Vehiculos WHERE id=$1";
    const res = await db.query(solicitud, [id]);
  return res.rowCount == 1;
}
export async function updateVehiculo(vehiculo){
    const solicitud = "Update Vehiculos SET nombre=$2, tipo=$3, motor=$4, estructura=$5, color=$6, combustible=$7, ubicacionId=$8 WHERE id=$1";
    const valores = [vehiculo.id, vehiculo.nombre, vehiculo.tipo, vehiculo.motor, vehiculo.estructura, vehiculo.color, vehiculo.combustible, vehiculo.ubicacionId];
    const res = await db.query(solicitud, valores);
      return res.rowCount == 1;
}