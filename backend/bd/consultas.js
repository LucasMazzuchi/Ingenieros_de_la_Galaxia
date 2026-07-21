import { db } from "./pool.js";
export const armar_consulta = (id, entidad) => {
    const campos = Object.keys(entidad);
    let partes = [];

    for (let i = 0; i < campos.length; i++) {
        console.log(`${campos[i]}=$${i + 2}`);
        partes.push(`${campos[i]}=$${i + 2}`); 
    }
    const consulta = partes.join(", ");
    const valores = [id, ...Object.values(entidad)];
    return { consulta, valores };
};

export const verificarDependencia = async (id) => {
    const consultaVehiculos = "SELECT 1 FROM vehiculos WHERE ubicacion_id = $1 AND borrado = FALSE LIMIT 1";
    const resVehiculos = await db.query(consultaVehiculos, [id]);
    const consultaMisiones = "SELECT 1 FROM misiones WHERE cuerpo_celeste_id = $1 AND borrado = FALSE LIMIT 1";
    const resMisiones = await db.query(consultaMisiones, [id]);
    return (resVehiculos.rowCount > 0 || resMisiones.rowCount > 0)
};