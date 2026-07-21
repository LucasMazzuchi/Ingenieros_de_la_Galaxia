import { db } from "./pool.js";

/**
 * Arma dinámicamente la sección SET de un UPDATE de forma segura contra inyección SQL.
 * Los campos toman marcadores desde $1 hasta $N, y el ID toma la posición $N+1 al final.
 */
export const armar_consulta = (id, entidad) => {
    const campos = Object.keys(entidad);
    let partes = [];

    for (let i = 0; i < campos.length; i++) {
        partes.push(`${campos[i]}=$${i + 1}`); 
    }
    
    const consulta = partes.join(", ");
    const valores = [...Object.values(entidad), id];
    const numeroId = campos.length + 1; // Posición exacta para el WHERE id = $X

    return { consulta, valores, numeroId };
};

/**
 * Verifica si un cuerpo celeste está siendo usado activamente por vehículos o misiones
 * antes de permitir un borrado lógico.
 */
export const verificarDependencia = async (id) => {
    const consultaVehiculos = "SELECT 1 FROM vehiculos WHERE ubicacion_id = $1 AND borrado = FALSE LIMIT 1";
    const resVehiculos = await db.query(consultaVehiculos, [id]);
    const consultaMisiones = "SELECT 1 FROM misiones WHERE cuerpo_celeste_id = $1 AND borrado = FALSE LIMIT 1";
    const resMisiones = await db.query(consultaMisiones, [id]);
    return (resVehiculos.rowCount > 0 || resMisiones.rowCount > 0)
};
