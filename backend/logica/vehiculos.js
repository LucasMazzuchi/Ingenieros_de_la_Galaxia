import { getVehiculo, updateVehiculo } from "../bd/vehiculos.js";
export const mejorarVehiculo = async (req, res, next) => {
    if (req.body.cuerpo_celeste_id === 1){
        return next();
    }
    const vehiculoDatos = await getVehiculo(req.params.id);
    const resMejora = await updateVehiculo(req.params.id, {puntos : vehiculoDatos.puntos+1});
    req.body.mejorado = resMejora;
    next();
};