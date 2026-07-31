import * as progreso from "../bd/progreso.js"
import { getVehiculo } from "../bd/vehiculos.js";
export const completarMision = async (req, res, next) => {
    try {
        const resCompletar = await progreso.completarMision(req.params.id, req.body.mision_id);
        console.log(resCompletar);
        const {totales, completadas} = await progreso.chequearProgresoPlaneta(req.params.id, req.body.cuerpo_celeste_id);
        if (totales < 1){
            return res.status(403).json({error: "No hay puntos de interés en el cuerpo celeste."})
        }
        req.body.recompensa = parseInt(100/totales) === 33 ? 34 : 100/totales;
        const vehiculo = await getVehiculo(req.params.id);
        if (vehiculo.combustible+req.body.recompensa > 100) {
            req.body.recompensa = 100-vehiculo.combustible;
        }
        req.body.nafta = parseInt(vehiculo.combustible + req.body.recompensa);
        const resCombustible = await progreso.sumarCombustible(req.params.id, req.body.nafta);
        if (completadas === totales) {
            return next();
        }
        return res.status(200).json({mensaje : "Punto expolorado con éxito", combustible : req.body.recompensa, cuerpoCompletado : false});
    } catch (error){
        console.log(error);
        res.status(500).json({ error: "Error al completar la misión." });
    }
};