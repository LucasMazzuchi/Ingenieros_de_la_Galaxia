import * as progreso from "../bd/progreso.js"
export const completarMision = async (req, res, next) => {
    try {
        const resCompletar = await progreso.completarMision(req.params.id, req.body.mision_id);
        console.log(resCompletar);
        const {totales, completadas} = await progreso.chequearProgresoPlaneta(req.params.id, req.body.cuerpo_celeste_id);
        req.body.nafta = totales > 0 ? parseInt(100/totales) : 0;
        const resCombustible = await progreso.sumarCombustible(req.params.id, req.body.mision_id, req.body.nafta);
        if (completadas === totales) {
            next();
        }
        return res.status(200).json({mensaje : "Punto expolorado con éxito", combustible : req.body.nafta, cuerpoCompletado : false});
    } catch (error){
        res.status(500).json({ error: "Error al completar la misión." });
    }
};