import { db } from "./pool.js";

// Arma dinámicamente la sección SET de un UPDATE.
// Los campos toman marcadores desde $1 hasta $N sieendo N la cantidad de campos a actualizar, y el ID toma la posición $N+1 al final.

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

// Verifica si un cuerpo celeste está siendo usado activamente por vehículos o puntos de interés
// antes de permitir un borrado lógico.
export const verificarDependencia = async (id) => {
    const consultaMisiones = "SELECT * FROM misiones WHERE cuerpo_celeste_id = $1 AND borrado = FALSE";
    const consultaVehiculos = "SELECT * FROM vehiculos WHERE ubicacion_id = $1 AND borrado = FALSE";
    const resMisiones = await db.query(consultaMisiones, [id]);
    const resVehiculos = await db.query(consultaVehiculos, [id]);
    return {misiones : resMisiones.rows, vehiculos : resVehiculos.rows};

};

// Retorna todas las nave que se encuentran en la posición pasada por parámetro dentro del cuerpo celeste asociado a cuerpoCelesteId.
export const verificarNaves = async (posicion, cuerpoCelesteId) => {
    const consultaVehiculos = "SELECT * FROM vehiculos WHERE punto_interes = $1 AND ubicacion_id = $2";
    const resVehiculos = await db.query(consultaVehiculos, [posicion, cuerpoCelesteId]);
    return resVehiculos.rows;
};
