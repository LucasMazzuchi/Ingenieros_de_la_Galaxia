import * as constantes from "../constantes.js";
import {validarEntrada, validarString, validarEntero, validarImagen} from "./validaciones_errores.js"

export const validarVehiculo = (req, res, next) => {
    const reglasVehiculo = {
    [constantes.NOMBRE]:validarString,
    [constantes.TIPO]:validarEntero,
    [constantes.MOTOR]:validarEntero,
    [constantes.ESTRUCTURA]:validarEntero,
    [constantes.COLOR]:validarString,
    [constantes.COMBUSTIBLE]:validarEntero,
    [constantes.UBICACION]:validarEntero,
    [constantes.IMAGEN]:validarImagen
    };
    const entrada = {
    [constantes.NOMBRE]: { campo: req.body.nombre, min: 1, max: constantes.NOMBRE_MAX, error: constantes.NOMBRE },
    [constantes.TIPO]: { campo: req.body.tipo, min: 1, max: constantes.TIPO_MAX, error: constantes.TIPO },
    [constantes.MOTOR]:{ campo : req.body.motor, min : 1, max : constantes.MOTOR_MAX, error : constantes.MOTOR },
    [constantes.ESTRUCTURA]:{ campo : req.body.estructura, min : 1, max : constantes.ESTRUCTURA_MAX, error : constantes.ESTRUCTURA },
    [constantes.COLOR]:{ campo : req.body.color, min : 1, max : constantes.COLOR_MAX, error : constantes.COLOR },
    [constantes.COMBUSTIBLE]:{ campo : req.body.combustible, min : 0, max : constantes.COMBUSTIBLE_MAX, error : constantes.COMBUSTIBLE },
    [constantes.UBICACION]:{ campo : req.body.ubicacionId, min : 1, max : constantes.ID_MAX, error : constantes.UBICACION },
    [constantes.IMAGEN]: { campo: req.body.imagenURL }
    };
    const {errores, procesados} = validarEntrada(entrada, reglasVehiculo);
    if (errores.length !== 0){
        res.status(400).json({error:errores});
        return;
    }
    req.body = procesados;
    next();
};