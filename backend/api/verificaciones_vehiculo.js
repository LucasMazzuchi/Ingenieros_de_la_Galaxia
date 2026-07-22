import * as constantes from "../constantes.js";
import {validarEntrada, validarString, validarEntero,
    validarFiltros, validarValorFiltro, validarRango, orden} from "./validaciones_errores.js";
export const validarVehiculo = (req, res, next) => {
    console.log("Body recibido:", req.body);
    console.log("ID en la URL:", req.params.id);
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log("Body vacío");
        return res.status(400).json({ error: constantes.ERROR_BODY_VACIO });
    }
    const reglasVehiculo = {
    [constantes.NOMBRE]:validarString,
    [constantes.TIPO]:validarEntero,
    [constantes.MOTOR]:validarEntero,
    [constantes.ESTRUCTURA]:validarEntero,
    [constantes.COMBUSTIBLE]:validarEntero,
    [constantes.UBICACION]:validarEntero,
    [constantes.PUNTO_INTERES]:validarEntero
    };
    const body = req.body || {};
    const entrada = {
    [constantes.NOMBRE]: { campo: req.body.nombre, min: 1, max: constantes.NOMBRE_MAX, error: constantes.NOMBRE },
    [constantes.TIPO]: { campo: req.body.tipo, min: 1, max: constantes.TIPO_MAX, error: constantes.TIPO },
    [constantes.MOTOR]:{ campo : req.body.motor, min : 1, max : constantes.MOTOR_MAX, error : constantes.MOTOR },
    [constantes.ESTRUCTURA]:{ campo : req.body.estructura, min : 1, max : constantes.ESTRUCTURA_MAX, error : constantes.ESTRUCTURA },
    [constantes.COMBUSTIBLE]:{ campo : req.body.combustible, min : 0, max : constantes.COMBUSTIBLE_MAX, error : constantes.COMBUSTIBLE },
    [constantes.UBICACION]:{ campo : req.body.ubicacion_id, min : 1, max : constantes.ID_MAX, error : constantes.UBICACION },
    [constantes.PUNTO_INTERES]:{campo: req.body.punto_interes, min:0, max: constantes.PUNTO_INTERES_MAX, error: constantes.PUNTO_INTERES}
    };
    const {errores, procesados, camposInvalidos} = validarEntrada(entrada, reglasVehiculo, req.method, Object.keys(req.body));
    if (camposInvalidos.length !== 0) {
        console.log("Campos Invalidos");
        return res.status(400).json({error: constantes.ERROR_CAMPOS, campos: camposInvalidos});
    }
    if (errores.length !== 0){
        console.log("Errores");
        res.status(400).json({error:errores});
        return;
    }
    req.body = procesados;
    next();
};

export const validarFiltrosVehiculo = (req, res, next) => {
    const regex = [constantes.ID, constantes.NOMBRE, constantes.TIPO, constantes.MOTOR, 
    constantes.ESTRUCTURA, constantes.COMBUSTIBLE, constantes.UBICACION].join('|');
    const regexOrdenarPor = new RegExp( `^(${regex})$`, "i");
    const validadores = {
        [constantes.ID] : {regex : constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.ID_MAX},
        [constantes.NOMBRE] : {regex: constantes.REGEX_STRING, error: constantes.ERROR_FILTRO_STRING, caster : String},
        [constantes.TIPO] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.TIPO_MAX},
        [constantes.MOTOR] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.MOTOR_MAX},
        [constantes.ESTRUCTURA] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.ESTRUCTURA_MAX},
        [constantes.COMBUSTIBLE] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 0, max: constantes.COMBUSTIBLE_MAX},
        [constantes.PUNTO_INTERES] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster:Number, min:0, max: constantes.PUNTO_INTERES_MAX},
        [constantes.LIMITE]: { regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster: Number, min: 1, max: constantes.LIMITE_MAX },
        [constantes.ORDENAR_POR]: { regex: regexOrdenarPor, error: constantes.ERROR_FILTRO_ORDENAR, caster: String },
        [constantes.ORDEN]: { regex: constantes.REGEX_ORDEN, error: constantes.ERROR_ORDEN, caster: orden }
    }
    const permitidos = new Set([
        constantes.ID, constantes.ID + "_min", constantes.ID + "_max",
        constantes.NOMBRE, constantes.PUNTO_INTERES,
        constantes.TIPO, constantes.TIPO + "_min", constantes.TIPO + "_max" ,
        constantes.MOTOR, constantes.MOTOR + "_min", constantes.MOTOR + "_max",
        constantes.ESTRUCTURA, constantes.ESTRUCTURA + "_min", constantes.ESTRUCTURA +"_max",
        constantes.COMBUSTIBLE, constantes.COMBUSTIBLE + "_min", constantes.COMBUSTIBLE + "_max",
        constantes.UBICACION, constantes.UBICACION + "_min", constantes.UBICACION + "_max",
        constantes.LIMITE, constantes.ORDENAR_POR, constantes.ORDEN
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
