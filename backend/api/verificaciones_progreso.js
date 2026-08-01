import * as constantes from "../constantes.js";
import { _validarId, validarEntrada, validarEntero } from "./validaciones_errores.js";
import * as progreso from "../bd/progreso.js";

export const validarIds = (req, res, next) => {
    if (!req.params || Object.keys(req.params).length === 0 || Object.keys(req.params).length > 2) {
        return res.status(400).json({ error: constantes.ERROR_CAMPOS });
    }
    let entrada = {}
    let datos;
    let reglasIds = {};
    if (req.method === "GET"){
    entrada = {
        [constantes.ID]: { campo: req.params.id, min: 1, max: constantes.ID_MAX, error: constantes.ID },
        [constantes.CUERPO_CELESTE]: { campo: req.params.cuerpo_celeste_id, min: 1, max: constantes.ID_MAX, error: constantes.CUERPO_CELESTE }
    };
    datos = req.params;
    reglasIds[constantes.ID]= _validarId;
    reglasIds[constantes.CUERPO_CELESTE]= _validarId;

    } else if (req.method === "PATCH"){

   datos = req.body;
        if (req.path.includes("completar")) {
            entrada = {
                [constantes.CUERPO_CELESTE]: { campo: req.body.cuerpo_celeste_id, min: 1, max: constantes.ID_MAX, error: constantes.CUERPO_CELESTE }
            };
            reglasIds[constantes.CUERPO_CELESTE] = validarEntero;
            
        } else {
            entrada = {
                [constantes.CUERPO_CELESTE]: { campo: req.body.cuerpo_celeste_id, min: 1, max: constantes.ID_MAX, error: constantes.CUERPO_CELESTE },
                [constantes.MISION]: { campo: req.body.mision_id, min: 1, max: constantes.ID_MAX, error: constantes.MISION }
            };
            reglasIds[constantes.CUERPO_CELESTE] = validarEntero;
            reglasIds[constantes.MISION] = validarEntero;
        }
    }
    const {errores, procesados, camposInvalidos} = validarEntrada(entrada, reglasIds, req.method, Object.keys(datos), true);
    if (camposInvalidos.length !== 0) {
        return res.status(400).json({error: constantes.ERROR_CAMPOS, campos: camposInvalidos});
    }
    if (errores.length !== 0){
        return res.status(400).json({error:errores}); 
    }
    req.body = procesados;
    next();
};

export const verificarEstadoMision = async (req, res, next) => {// Si hay 0 misiones, o no se puede desubrir el punto, retorna.
    try {
        const mision = await progreso.getMision(req.params.id, req.body.mision_id);
        if (!mision) {
            return res.status(403).json({ error: "Tenés que descubrir este punto primero." });
        }
        if (mision.completado) {
            return res.status(400).json({ error: "Este punto ya fue explorado por la nave." });
        }
        return next();
    } catch (error){
        res.status(500).json({ error: "Error al verificar el estado de la misión." });
    }
}
