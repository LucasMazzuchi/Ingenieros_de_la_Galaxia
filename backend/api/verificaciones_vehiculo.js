import * as constantes from "../constantes.js";
import {validarEntrada, validarString, validarEntero,
    validarFiltros, validarValorFiltro, validarRango, orden} from "./validaciones_errores.js";

// La función inicializa el diccionario de validadores y el de entrada para la entidad vehículo, valida la entrada mediante validarEntrada y llama a la
// next. En caso de tener campos que no cumplan con los validadores, responde con un error 400 que contiene los campos inválidos y sus errores. Si ocurre un error
// dentro de las validaciones, responde con un código 400 y los errores.

export const validarVehiculo = (req, res, next) => {
        if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: constantes.ERROR_BODY_VACIO });
    }
    const reglasVehiculo = {
    [constantes.NOMBRE]:validarString,
    [constantes.MOTOR]:validarEntero,
    [constantes.ESTRUCTURA]:validarEntero,
    [constantes.COMBUSTIBLE]:validarEntero,
    [constantes.RESISTENCIA]: validarEntero,
    [constantes.PUNTO_INTERES]:validarEntero,
    [constantes.PUNTOS]:validarEntero,
    [constantes.UBICACION]: validarEntero
    };
    const body = req.body || {};
    const entrada = {
    [constantes.NOMBRE]: { campo: req.body.nombre, min: 1, max: constantes.NOMBRE_MAX, error: constantes.NOMBRE },
    [constantes.MOTOR]:{ campo : req.body.motor, min : 1, max : constantes.MOTOR_MAX, error : constantes.MOTOR },
    [constantes.ESTRUCTURA]:{ campo : req.body.estructura, min : 1, max : constantes.ESTRUCTURA_MAX, error : constantes.ESTRUCTURA },
    [constantes.COMBUSTIBLE]:{ campo : req.body.combustible, min : 0, max : constantes.COMBUSTIBLE_MAX, error : constantes.COMBUSTIBLE },
    [constantes.RESISTENCIA]:{ campo : req.body.resistencia, min : 1, max : constantes.RESISTENCIA_MAX, error : constantes.RESISTENCIA },
    [constantes.PUNTO_INTERES]:{campo: req.body.punto_interes, min:0, max: constantes.PUNTO_INTERES_MAX, error: constantes.PUNTO_INTERES},
    [constantes.PUNTOS]:{campo: req.body.puntos, min:0, max: constantes.PUNTOS_MAX, error: constantes.PUNTOS},
    [constantes.UBICACION]:{campo:req.body.ubicacion_id, min: 1, max: constantes.ID_MAX, error: constantes.UBICACION}
    };
    const {errores, procesados, camposInvalidos} = validarEntrada(entrada, reglasVehiculo, req.method, Object.keys(req.body), false);
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

// La función inicializa los diccionarios con los validadores y los campos permitidos para filtrar en la entidad vehículo, valida que los filtros dentro de req
// sean correctos, los procesa, los carga en body y llama a next. En caso de haber filtros que no cumplen con los validadores, responde con un código 400, los
// los filtros equivocados y sus errores.
export const validarFiltrosVehiculo = (req, res, next) => {
    const regex = [constantes.ID, constantes.NOMBRE, constantes.TIPO, constantes.MOTOR, 
    constantes.ESTRUCTURA, constantes.COMBUSTIBLE, constantes.RESISTENCIA, constantes.UBICACION].join('|');
    const regexOrdenarPor = new RegExp( `^(${regex})$`, "i");
    const validadores = {
        [constantes.ID] : {regex : constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.ID_MAX},
        [constantes.NOMBRE] : {regex: constantes.REGEX_STRING, error: constantes.ERROR_FILTRO_STRING, caster : String},
        [constantes.MOTOR] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.MOTOR_MAX},
        [constantes.ESTRUCTURA] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.ESTRUCTURA_MAX},
        [constantes.RESISTENCIA] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.RESISTENCIA_MAX},
        [constantes.COMBUSTIBLE] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 0, max: constantes.COMBUSTIBLE_MAX},
        [constantes.PUNTO_INTERES] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster:Number, min:0, max: constantes.PUNTO_INTERES_MAX},
        [constantes.PUNTOS] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster: Number, min:0, max: constantes.PUNTOS_MAX},
        [constantes.UBICACION] : {regex : constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.ID_MAX},
        [constantes.LIMIT]: { regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster: Number, min: 1, max: constantes.LIMITE_MAX },
        [constantes.ORDENAR_POR]: { regex: regexOrdenarPor, error: constantes.ERROR_FILTRO_ORDENAR, caster: String },
        [constantes.ORDER]: { regex: constantes.REGEX_ORDEN, error: constantes.ERROR_ORDEN, caster: orden }
    }
    const permitidos = new Set([
        constantes.ID, constantes.ID + "_min", constantes.ID + "_max",
        constantes.NOMBRE, constantes.PUNTO_INTERES, constantes.UBICACION,
         constantes.PUNTOS, constantes.PUNTOS + "_min", constantes.PUNTOS + "_max",
        constantes.MOTOR, constantes.MOTOR + "_min", constantes.MOTOR + "_max",
        constantes.ESTRUCTURA, constantes.ESTRUCTURA + "_min", constantes.ESTRUCTURA +"_max",
        constantes.RESISTENCIA, constantes.RESISTENCIA + "_min", constantes.RESISTENCIA+"_max",
        constantes.COMBUSTIBLE, constantes.COMBUSTIBLE + "_min", constantes.COMBUSTIBLE + "_max",
        constantes.LIMIT, constantes.ORDER_BY, constantes.ORDER
    ]);
    const erroresClaves = validarFiltros(Object.keys(req.query), permitidos);
    if (erroresClaves.length !== 0){
        return res.status(400).json({ error:constantes.ERROR_FILTROS, errores : erroresClaves });
    }
    const {valores, erroresValores} = validarValorFiltro(req.query, validadores);
    if (erroresValores.length !== 0){
        return res.status(400).json({ error:constantes.ERROR_FILTROS, errores : erroresValores });
    }
    const erroresRango = validarRango(Object.keys(validadores), valores);
    if (erroresRango.length !== 0){
        return res.status(400).json({ error:constantes.ERROR_FILTROS, errores : erroresRango });
    }
    for (const key in req.query) {
        delete req.query[key];
    }
    for (const key in valores) {
        req.query[key] = valores[key];
    }    next();
};
