import * as constantes from "../constantes.js";
import {validarEntrada, validarString, validarEntero, validarImagen,
    validarFiltros, validarValorFiltro, validarRango, orden} from "./validaciones_errores.js";
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
    const body = req.body || {};
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
    const {errores, procesados} = validarEntrada(entrada, reglasVehiculo, req.method);
    if (errores.length !== 0){
        res.status(400).json({error:errores});
        return;
    }
    req.body = procesados;
    next();
};

export const validarFiltrosVehiculo = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: constantes.ERROR_BODY_VACIO });
    }
    const regex = [constantes.ID, constantes.NOMBRE, constantes.TIPO, constantes.MOTOR, 
    constantes.ESTRUCTURA, constantes.COLOR, constantes.COMBUSTIBLE, constantes.UBICACION].join('|');
    const regexOrdenarPor = new RegExp( `^(${regex})$`, "i");
    const validadores = {
        [constantes.ID] : {regex : constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number},
        [constantes.NOMBRE] : {regex: constantes.REGEX_STRING, error: constantes.ERROR_FILTRO_STRING, caster : String},
        [constantes.TIPO] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number},
        [constantes.MOTOR] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number},
        [constantes.ESTRUCTURA] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number},
        [constantes.COLOR] : {regex: constantes.REGEX_STRING, error: constantes.ERROR_FILTRO_STRING, caster : String},
        [constantes.COMBUSTIBLE] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number},
        [constantes.UBICACION] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number},
        [constantes.LIMITE]: { regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster: Number },
        [constantes.ORDENAR_POR]: { regex: regexOrdenarPor, error: constantes.ERROR_FILTRO_ORDENAR, caster: String },
        [constantes.ORDEN]: { regex: constantes.REGEX_ORDEN, error: constantes.ERROR_ORDEN, caster: orden }
    }
    const permitidos = new Set([
        constantes.ID, constantes.ID + "_min", constantes.ID + "_max",
        constantes.NOMBRE, constantes.COLOR,
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
    req.query = valores;
    next();
};