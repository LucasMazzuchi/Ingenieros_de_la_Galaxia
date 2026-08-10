import { getVehiculo, updateVehiculo } from "../bd/vehiculos.js";
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