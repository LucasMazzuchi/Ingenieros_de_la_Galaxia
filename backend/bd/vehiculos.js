import { db } from "./pool.js";
import { armar_consulta } from "./consultas.js";
import {consulta, VEHICULOS_MAX} from "../constantes.js"

// Busca todos los vehículos, se puede filtrar por sus campos. El parámetro texto es la consulta y procesados son los datos.
// Devuelve todos los vehículos que cumplan con los requisitos de filtrado. 
export async function getAllVehiculos(vehiculo, entidad ) {
    const sinFiltro = "SELECT v.id, v.nombre, v.motor, v.estructura, v.resistencia, v.combustible, v.punto_interes, v.puntos, v.ubicacion_id FROM vehiculos as v WHERE v.borrado = FALSE";
    const {texto, procesados} = consulta(vehiculo, entidad, sinFiltro)
    const res = await db.query(texto, procesados);
    return res.rows;
}
// Busca el vehiculo por el id pasado por parámetro y lo devuelve. Si no existe, devuelve undefined.
export async function getVehiculo(id) {
    const solicitud = "SELECT v.id, v.nombre, v.motor, v.estructura, v.resistencia, v.combustible, v.punto_interes, v.puntos, v.ubicacion_id FROM vehiculos as v WHERE v.id=$1 AND v.borrado = FALSE";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

// Crea un vehículo con los datos pasados por parámetro mediante el diccionario vehiculo. 
export async function createVehiculo(vehiculo) {
    const solicitud = "INSERT INTO vehiculos (nombre, motor, estructura, combustible, resistencia, punto_interes, puntos, ubicacion_id, borrado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id";
    const valores = [vehiculo.nombre, vehiculo.motor, vehiculo.estructura, vehiculo.combustible, vehiculo.resistencia, vehiculo.punto_interes, vehiculo.puntos, vehiculo.ubicacion_id, false];
    const res = await db.query(solicitud, valores);
    return {vehiculo : res.rowCount == 1, id : res.rows[0].id};
}

// Borra un vehículo por el id pasado por parámetro marcando la casilla borrado como true. En caso de que no exista el cuerpo celeste devuelve false en ok,
// sino devuelve true en ok junto con el vehiculo borrado.
export async function removeVehiculo(id){
    const solicitud = "UPDATE vehiculos SET borrado = TRUE WHERE id=$1 AND borrado = FALSE RETURNING *";
    const res = await db.query(solicitud, [id]);
    return {ok : res.rowCount == 1, vehiculo : res.rows[0]};
}

// Actualiza el vehículo con los datos pasados por el objeto vehiculo, para buscarlo usa el id pasado por parámetro. Devuelve true si se actualizo el vehículo,
// en caso contrario devuelve false.
export async function updateVehiculo(id, vehiculo){
    const { consulta, valores, numeroId } = armar_consulta(id, vehiculo);
    const solicitud = `UPDATE vehiculos SET ${consulta} WHERE id=$${numeroId} AND borrado = FALSE`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}
