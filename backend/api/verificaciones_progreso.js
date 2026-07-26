import { REGEX_ENTERO } from "../constantes";
import { _validarId } from "./validaciones_errores";

export const validarIds = (req, res, next) => {
    if (!req.params || Object.keys(req.params).length === 0 || Object.keys(req.params).length > 2) {
        return res.status(400).json({ error: constantes.ERROR_CAMPOS });
    }
    let entrada = {}
    let reglasIds = {
    [constantes.CUERPO_CELESTE]: _validarId,
    };
    if (req.method === "GET"){
    let entrada = {
        [constantes.ID]: { campo: req.params.id, min: 1, max: constantes.ID_MAX, error: constantes.ID },
        [constantes.CUERPO_CELESTE]: { campo: req.params.cuerpo_celeste_id, min: 1, max: constantes.ID_MAX, error: constantes.CUERPO_CELESTE }
    };
    reglasIds[constantes.ID]= _validarId;

    } else if (req.method === "PATCH"){

        let entrada = {
            [constantes.CUERPO_CELESTE]: { campo: req.body.cuerpo_celeste_id, min: 1, max: constantes.ID_MAX, error: constantes.CUERPO_CELESTE },
            [constantes.VEHICULO]: { campo: req.body.vehiculo_id, min: 1, max: constantes.ID_MAX, error: constantes.VEHICULO }
        };
        reglasIds[constantes.VEHICULO] = _validarId;
    }

    const {errores, procesados, camposInvalidos} = validarEntrada(entrada, reglasIds, req.method, req.method === "GET" ? Object.keys(req.body) : Object.keys(req.body), true);
    if (camposInvalidos.length !== 0) {
        return res.status(400).json({error: constantes.ERROR_CAMPOS, campos: camposInvalidos});
    }
    if (errores.length !== 0){
        res.status(400).json({error:errores});
        return;
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
        next()
    } catch (error){
        res.status(500).json({ error: "Error al verificar el estado de la misión." });
    }
}
