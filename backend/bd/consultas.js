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
    try {
        console.log(`🌌 Verificando dependencias para el cuerpo celeste ID: ${id}...`);
        
        const consultaVehiculos = "SELECT 1 FROM vehiculos WHERE ubicacion_id = $1 AND borrado = FALSE LIMIT 1";
        const resVehiculos = await db.query(consultaVehiculos, [id]);
        
        const consultaMisiones = "SELECT 1 FROM misiones WHERE cuerpo_celeste_id = $1 AND borrado = FALSE LIMIT 1";
        const resMisiones = await db.query(consultaMisiones, [id]);
        
        return (resVehiculos.rowCount > 0 || resMisiones.rowCount > 0);
    } catch (error) {
        console.error("❌ Error crítico en verificarDependencia:", error);
        throw error;
    }
};

/**
 * EJEMPLO DE USO (Podés dejarlo de guía o adaptarlo a tus modelos):
 * Así es como el controlador o modelo del backend usará tus funciones dinámicas para actualizar:
 * 
 * export const actualizarCuerpoCeleste = async (id, datosNuevos) => {
 *     const { consulta, valores, numeroId } = armar_consulta(id, datosNuevos);
 *     const queryFull = `UPDATE cuerpos_celestes SET ${consulta} WHERE id = $${numeroId} RETURNING *`;
 *     const resultado = await db.query(queryFull, valores);
 *     return resultado.rows[0];
 * };
 */