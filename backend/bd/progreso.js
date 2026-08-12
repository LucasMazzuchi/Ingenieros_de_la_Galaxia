import { db } from "./pool.js";
import { updateVehiculo } from "./vehiculos.js";

// Trae el estado y los ids relacionados de todos los puntos de interés asociados con cuerpoCelesteId dentro de la tabla puntos_interes_vehiculo y con vehiculoId
// dentro de la tabla intermedia entre puntos de interés y vehículos. 
export const getAllpuntos_interes = async (vehiculoId, cuerpoCelesteId) => {
    const texto = `SELECT pv.punto_interes_id, pv.vehiculo_id, pv.cuerpo_celeste_id, pv.completado, p.nombre FROM puntos_interes_vehiculos pv, puntos_interes p WHERE pv.punto_interes_id = p.id AND pv.vehiculo_id = $1 AND p.cuerpo_celeste_id = $2 AND p.borrado = FALSE`;
    const res = await db.query(texto, [vehiculoId, cuerpoCelesteId]);
    return res.rows;
};

// Devuelve el planeta asociado a los ids pasados por parámetro dentro de la tabla cuerpos_celestes_vehiculos.
export const getPlaneta = async (vehiculoId, cuerpoCelesteId) => {
    const texto = `SELECT * FROM cuerpos_celestes_vehiculos WHERE vehiculo_id = $1 AND cuerpo_celeste_id = $2`;
    const res = await db.query(texto, [vehiculoId, cuerpoCelesteId]);
    return res.rows[0];
};

// Retorna el punto de interés asociado en tabla puntos_interes_vehiculo con los ids pasados por parámetro.
export const getPunto = async (vehiculoId, puntoInteresId) => {
    const texto = `SELECT * FROM puntos_interes_vehiculos WHERE vehiculo_id = $1 AND punto_interes_id = $2`;
    const res = await db.query(texto, [vehiculoId, puntoInteresId]);
    return res.rows[0];
};

// Busca el punto de interés anterior en el mismo planeta basándose en el ID
export const getPuntoAnteriorEnPlaneta = async (cuerpoCelesteId, posicion) => {
    const texto = `SELECT * FROM puntos_interes WHERE cuerpo_celeste_id = $1 AND posicion < $2 AND borrado = FALSE ORDER BY posicion DESC LIMIT 1`;
    const res = await db.query(texto, [cuerpoCelesteId, posicion]);
    return res.rows[0];
};

// Marca el punto de interés asociado a puntoInteresId como completado para el vehiculo asociado a vehiculoId.
export const completarPunto = async (vehiculoId, puntoInteresId) => {
    const texto = `UPDATE puntos_interes_vehiculos SET completado = TRUE WHERE vehiculo_id = $1 AND punto_interes_id = $2`;
    const res = await db.query(texto, [vehiculoId, puntoInteresId]);
    return res.rowCount == 1;
};

// Suma el combustible y actualiza la posición.
export const sumarCombustible = async (vehiculoId, cantidad) => {
    const texto = `UPDATE vehiculos SET combustible = $1 WHERE id = $2`;
    const res = await db.query(texto, [cantidad, vehiculoId]);
    return res.rowCount == 1;
};

// Cuenta cuántos puntos de interés tiene el planeta en total y cuántos completó la nave,
export const chequearProgresoPlaneta = async (vehiculoId, cuerpoCelesteId) => {
    const textoTotales = `SELECT COUNT(*) as total FROM puntos_interes WHERE cuerpo_celeste_id = $1 AND borrado = FALSE`;
    const puntosTotales = await db.query(textoTotales, [cuerpoCelesteId]);

    const textoCompletos = `SELECT COUNT(*) as completados FROM puntos_interes_vehiculos pv, puntos_interes p WHERE pv.punto_interes_id = p.id AND pv.vehiculo_id = $1 AND p.cuerpo_celeste_id = $2 AND pv.completado = TRUE AND p.borrado = FALSE`;
    const puntosCompletados = await db.query(textoCompletas, [vehiculoId, cuerpoCelesteId]);
    return {totales: Number(puntosTotales.rows[0].total), completadas: Number(puntosCompletados.rows[0].completados)};
};


// Crea el registro con completado = FALSE.
export const desbloquearPunto = async (vehiculoId, puntoInteresId, cuerpoCelesteId) => {
    const texto = `INSERT INTO puntos_interes_vehiculos (vehiculo_id, punto_interes_id, cuerpo_celeste_id, completado) VALUES ($1, $2, $3, FALSE)`;
    const res = await db.query(texto, [vehiculoId, puntoInteresId, cuerpoCelesteId]);
    return res.rowCount === 1;
};

// Completa el planeta que está asociado a cuerpoCelesteId para vehiculoId en la tabla intermedia entre cuerpos celestes y vehículos.
export const completarPlaneta = async (vehiculoId, cuerpoCelesteId) => {
    const textoCompletado = `UPDATE cuerpos_celestes_vehiculos SET completado = TRUE WHERE vehiculo_id = $1 AND cuerpo_celeste_id = $2`;
    const res = await db.query(textoCompletado,[vehiculoId, cuerpoCelesteId]);
    return res.rowCount === 1;
};

// Agrega el cuerpo celeste asociado a cuerpoCelesteId a la tabla intermedia entre cuerpos celestes y vehículos para mostrar que el vehiculo asociado a vehiculoId
// tiene progreso.
export const agregarPlaneta = async (vehiculoId, cuerpoCelesteId) => {
    const texto = `INSERT INTO cuerpos_celestes_vehiculos (vehiculo_id, cuerpo_celeste_id, completado) VALUES ($1, $2, FALSE)`;
    const res = await db.query(texto,[vehiculoId, cuerpoCelesteId]);
    return res.rowCount === 1;
};