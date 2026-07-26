import * as progreso from "../bd/progreso.js"
export const completarMision = (req, res) => {
    await progreso.completarMision(req.params.vehiculo_id, req.body.mision_id);
    const {totales, completadas} = await progreso.chequearProgresoPlaneta(req.params.vehiculo_id, req.body.cuerpo_celeste_id);
    req.body.nafta = totales > 0 ? 100/totales : 0;
    await progreso.sumarCombustible(req.params.vehiculo_id, req.body.mision_id, req.body.nafta);
    if (completadas === totales) {
        next();
    }
};