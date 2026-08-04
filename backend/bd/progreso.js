import { db } from "./pool.js";
import { updateVehiculo } from "./vehiculos.js";

export const getAllMisiones = async (vehiculoId, cuerpoCelesteId) => {
    const texto = `SELECT mv.mision_id, mv.vehiculo_id, mv.cuerpo_celeste_id, mv.completado, m.nombre FROM misiones_vehiculos mv, misiones m WHERE mv.mision_id = m.id AND mv.vehiculo_id = $1 AND m.cuerpo_celeste_id = $2 AND m.borrado = FALSE AND mv.completado = TRUE`;
    const res = await db.query(texto, [vehiculoId, cuerpoCelesteId]);
    return res.rows;
};

export const getPlaneta = async (vehiculoId, cuerpoCelesteId) => {
    const texto = `SELECT * FROM cuerpos_celestes_vehiculos WHERE vehiculo_id = $1 AND cuerpo_celeste_id = $2`;
    const res = await db.query(texto, [vehiculoId, cuerpoCelesteId]);
    return res.rows[0];
};

export const getMision = async (vehiculoId, misionId) => {
    const texto = `SELECT * FROM misiones_vehiculos WHERE vehiculo_id = $1 AND mision_id = $2`;
    const res = await db.query(texto, [vehiculoId, misionId]);
    return res.rows[0];
};

// Busca la misión anterior en el mismo planeta basándose en el ID
export const getMisionAnteriorEnPlaneta = async (cuerpoCelesteId, posicion) => {
    const texto = `SELECT * FROM misiones WHERE cuerpo_celeste_id = $1 AND posicion < $2 AND borrado = FALSE ORDER BY posicion DESC LIMIT 1`;
    const res = await db.query(texto, [cuerpoCelesteId, posicion]);
    return res.rows[0];
};

// Marca la misión como completada
export const completarMision = async (vehiculoId, misionId) => {
    const texto = `UPDATE misiones_vehiculos SET completado = TRUE WHERE vehiculo_id = $1 AND mision_id = $2`;
    const res = await db.query(texto, [vehiculoId, misionId]);
    return res.rowCount == 1;
};

// Suma el combustible y actualiza la posición
export const sumarCombustible = async (vehiculoId, cantidad) => {
    const texto = `UPDATE vehiculos SET combustible = $1 WHERE id = $2`;
    const res = await db.query(texto, [cantidad, vehiculoId]);
    return res.rowCount == 1;
};

// Cuenta cuántas misiones tiene el planeta en total y cuántas completó la nave
export const chequearProgresoPlaneta = async (vehiculoId, cuerpoCelesteId) => {
    const textoTotales = `SELECT COUNT(*) as total FROM misiones WHERE cuerpo_celeste_id = $1 AND borrado = FALSE`;
    const misionesTotales = await db.query(textoTotales, [cuerpoCelesteId]);

    const textoCompletas = `SELECT COUNT(*) as completadas FROM misiones_vehiculos mv, misiones m WHERE mv.mision_id = m.id AND mv.vehiculo_id = $1 AND m.cuerpo_celeste_id = $2 AND mv.completado = TRUE AND m.borrado = FALSE`;
    const misionesCompletadas = await db.query(textoCompletas, [vehiculoId, cuerpoCelesteId]);
    return {totales: Number(misionesTotales.rows[0].total), completadas: Number(misionesCompletadas.rows[0].completadas)};
};


// Crea el registro con completado = FALSE (Optimizada, sin campo "disponible")
export const desbloquearMision = async (vehiculoId, misionId, cuerpoCelesteId) => {
    const texto = `INSERT INTO misiones_vehiculos (vehiculo_id, mision_id, cuerpo_celeste_id, completado) VALUES ($1, $2, $3, FALSE)`;
    const res = await db.query(texto, [vehiculoId, misionId, cuerpoCelesteId]);
    return res.rowCount === 1;
};

export const completarPlaneta = async (vehiculoId, cuerpoCelesteId) => {
    // Registramos que completó el planeta
    const textoCompletado = `UPDATE cuerpos_celestes_vehiculos SET completado = TRUE WHERE vehiculo_id = $1 AND cuerpo_celeste_id = $2`;
    const res = await db.query(textoCompletado,[vehiculoId, cuerpoCelesteId]);
    return res.rowCount === 1;
};

export const AgregarPlaneta = async (vehiculoId, cuerpoCelesteId) => {
    // Registramos que completó el planeta
    const textoCompletado = `INSERT INTO cuerpos_celestes_vehiculos (vehiculo_id, cuerpo_celeste_id, completado) VALUES ($1, $2, FALSE)`;
    const res = await db.query(textoCompletado,[vehiculoId, cuerpoCelesteId]);
    return res.rowCount === 1;
};