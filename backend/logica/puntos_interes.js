import * as progreso from "../bd/progreso.js"
import { getVehiculo } from "../bd/vehiculos.js";
// La función completa un punto de interés, asigna una cantidad de combustible diviendiendo 100 entre todas los puntos de interés en el cuerpo celeste, 
// como recompensa y responde un json indicando el mensaje de éxito, la cantidad de combustible obtenido y si el cuerpo fue completado.
// En caso que el punto de interés sea el que faltaba para completar el planeta se llama a la función next. Si no hay puntos de interés responde un
// error 403, por cualquier otro error responde con el código 500.
export const completarPunto = async (req, res, next) => {
    try {
        const resCompletar = await progreso.completarPunto(req.params.id, req.body.punto_interes_id);
        const {totales, completadas} = await progreso.chequearProgresoPlaneta(req.params.id, req.body.cuerpo_celeste_id);
        if (totales < 1){
            return res.status(403).json({error: "No hay puntos de interés en el cuerpo celeste."})
        }
        req.body.recompensa = parseInt(100/totales) === 33 ? 34 : 100/totales;
        const vehiculo = await getVehiculo(req.params.id);
        if (vehiculo.combustible+req.body.recompensa > 100) { // No deja que se pase de 100
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
        res.status(500).json({ error: "Error al completar el punto de interés." });
    }
};