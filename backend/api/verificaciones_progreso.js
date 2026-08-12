import * as constantes from "../constantes.js";
import { _validarId, validarEntrada, validarEntero } from "./validaciones_errores.js";
import * as progreso from "../bd/progreso.js";

// La función valida que los Ids pasados por req.params o req.body sean válidos y los inserta procesados. Utiliza como validador en caso de estar en req.params
// _validarId, sino usa validarEntero. Valida los datos con validarEntrada y llama a la función next. En caso de no cumplir con los validadores, responde un
// error 400 con los errores y los campos a los que corresponden. Si ocurre un error responde con un error 400 y el error.
export const validarIds = (req, res, next) => {
    if (!req.params || Object.keys(req.params).length === 0 || Object.keys(req.params).length > 2) {
        return res.status(400).json({ error: constantes.ERROR_CAMPOS });
    }
    let entrada = {}
    let datos;
    let reglasIds = {};
    if (req.method === "GET" || req.method === "POST"){
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
                [constantes.PUNTO_INTERES]: { campo: req.body.punto_interes_id, min: 1, max: constantes.ID_MAX, error: constantes.PUNTO_INTERES }
            };
            reglasIds[constantes.CUERPO_CELESTE] = validarEntero;
            reglasIds[constantes.PUNTO_INTERES] = validarEntero;
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

// La función busca el estado del punto de interés asociado al id pasado por el cuerpo de req respecto al vehículo asociado al id pasado por parámetro en req
// y llama a la función next, Si ocurre un error, responde. En caso de tener que descubrir otro punto primero responde con estado 403 junto con su error, si el punto fue explorado con estado 400, en otros
// casos de error con un estado 500.
export const verificarEstadoPunto = async (req, res, next) => {// Si hay 0 puntos de interes, o no se puede desubrir el punto, retorna.
    try {
        const puntoInteres = await progreso.getPunto(req.params.id, req.body.punto_interes_id);
        if (!puntoInteres) {
            return res.status(403).json({ error: "Tenés que descubrir este punto primero." });
        }
        if (puntoInteres.completado) {
            return res.status(400).json({ error: "Este punto ya fue explorado por la nave." });
        }
        return next();
    } catch (error){
        res.status(500).json({ error: "Error al verificar el estado del punto de interés." });
    }
}
