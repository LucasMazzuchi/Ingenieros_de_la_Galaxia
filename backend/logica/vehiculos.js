import { getVehiculo, updateVehiculo } from "../bd/vehiculos.js";
// La función agrega un punto de mejora al vehículo para la que es utilizada y llama a la función next. Si el cuerpo completado es el 1 (la Tierra) o
// la suma de los niveles de los atributos y los puntos de mejora sin uso da 9 o más, no se asigna un punto más de mejora.
export const mejorarVehiculo = async (req, res, next) => {
    if (req.body.cuerpo_celeste_id === 1){
        return next();
    }
    const vehiculoDatos = await getVehiculo(req.params.id);
    if (vehiculoDatos.motor+vehiculoDatos.estructura+vehiculoDatos.resistencia+vehiculoDatos.puntos >= 9){
        return next();
    }
    const resMejora = await updateVehiculo(req.params.id, {puntos : vehiculoDatos.puntos+1});
    next();
};