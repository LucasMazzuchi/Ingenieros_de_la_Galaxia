import { db } from "./pool.js";
export const armar_consulta = (id, entidad) => {
    const campos = Object.keys(entidad);
    let partes = [];

    for (let i = 0; i < campos.length; i++) {
        partes.push(`${campos[i]}=$${i + 2}`); 
    }
    const consulta = partes.join(", ");
    const valores = [id, ...Object.values(entidad)];
    return { consulta, valores };
};

export const verificarDependencia = async (id) => {
    console.log("Verificar dependencia");
    const consultaVehiculos = "SELECT 1 FROM vehiculos WHERE ubicacion_id = $1 AND borrado = FALSE LIMIT 1";
    const resVehiculos = await db.query(consultaVehiculos, [id]);
    console.log("consulta vehículos");
    const consultaMisiones = "SELECT 1 FROM misiones WHERE cuerpo_celeste_id = $1 AND borrado = FALSE LIMIT 1";
    const resMisiones = await db.query(consultaMisiones, [id]);
    console.log(resMisiones);
    console.log(resVehiculos);
    return (resVehiculos.rowCount > 0 || resMisiones.rowCount > 0)
};