import * as constantes from "../constantes.js";
import {manejarError, validarString, validarEntero, validarBool, validarImagen} from "./validaciones_errores.js";

export const validarMision = (req, res, next) => {
    const reglasMision = {
    [constantes.NOMBRE]: validarString,
    [constantes.DESCRIPCION]: validarString,
    [constantes.RELEVANCIA]: validarEntero,
    [constantes.PORCENTAJE]: validarEntero,
    [constantes.DISPONIBLE]: validarBool,
    [constantes.CUERPO_CELESTE]: validarEntero,
    [constantes.IMAGEN]: validarImagen
    };
    const entrada = {
    [constantes.NOMBRE]: { campo: req.body.nombre, min: 1, max: constantes.NOMBRE_MAX, error: constantes.NOMBRE },
    [constantes.DESCRIPCION]: { campo: req.body.descripcion, min: 0, max: constantes.DESCRIPCION_MAX, error: constantes.DESCRIPCION },
    [constantes.RELEVANCIA]: { campo: req.body.relevancia, min: 1, max: constantes.RELEVANCIA_MAX, error: constantes.RELEVANCIA },
    [constantes.PORCENTAJE]: { campo: req.body.porcentaje, min: 0, max: constantes.PORCENTAJE_MAX, error: constantes.PORCENTAJE },
    [constantes.DISPONIBLE]: { campo: req.body.disponible, error: constantes.DISPONIBLE },
    [constantes.CUERPO_CELESTE]: { campo: req.body.cuerpoCelesteId, min: 1, max: constantes.ID_MAX, error: constantes.CUERPO_CELESTE },
    [constantes.IMAGEN]: { campo: req.body.imagenURL }
    };
    const {errores, procesados} = manejarError(entrada, reglasMision);
        if (errores.length !== 0){
            res.status(400).json({error:errores});
            return;
        }
        req.body = procesados;
        next();
};