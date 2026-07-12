import * as constantes from "../constantes.js";
import {validarEntrada, validarNombre, validarTipo, validarColor} from "./validaciones_errores.js"

export const validarVehiculo = (req, res, next) => {
    const reglasVehiculo = {
    [constantes.NOMBRE]:validarNombre,
    [constantes.TIPO]:validarTipo,
    [constantes.MOTOR]:validarMotor,
    [constantes.ESTRUCTURA]:validarEstructura,
    [constantes.COLOR]:validarColor,
    [constantes.COMBUSTIBLE]:validarCombustible,
    [constantes.UBICACION]:validarUbicacion
    };
    const entrada = {
    [constantes.NOMBRE]:req.body.nombre,
    [constantes.TIPO]:req.body.tipo,
    [constantes.MOTOR]:req.body.motor,
    [constantes.ESTRUCTURA]:req.body.estructura,
    [constantes.COLOR]:req.body.color,
    [constantes.COMBUSTIBLE]:req.body.combustible,
    [constantes.UBICACION]:req.body.ubicacionId
    };
    const {errores, procesados} = validarEntrada(entrada, reglasVehiculo);
    if (errores.length !== 0){
        res.status(400).json({error:errores});
        return;
    }
    req.body = procesados;
    next();
};


const validarMotor = (motor) => {
    if (typeof motor != "number" || !Number.isInteger(motor) || motor<1 || motor>4){
        return constantes.ERROR_INT(constantes.MOTOR, 1, 4);
    }
    return "";
};

const validarEstructura = (estructura) => {
    if (typeof estructura != "number" || !Number.isInteger(estructura)|| estructura<1 || estructura>4){
        return constantes.ERROR_INT(constantes.ESTRUCTURA, 1, 4);
    }
    return "";
};

const validarCombustible = (combustible) => {
    if (typeof combustible != "number" || !Number.isInteger(combustible) || combustible<0 || combustible>100){
        return constantes.ERROR_INT(constantes.COMBUSTIBLE, 0,100)
    }
    return "";
};

const validarUbicacion = (ubicacion) => {
    if (typeof ubicacion != "number" || !Number.isInteger(ubicacion)|| ubicacion<1 || ubicacion>2147483647){
        return constantes.ERROR_INT("ubicacion",0,2147483647);
    }
    return "";
};