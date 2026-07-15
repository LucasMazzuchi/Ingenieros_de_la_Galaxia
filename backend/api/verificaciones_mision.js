import * as constantes from "../constantes.js";
import {validarEntrada, validarString, validarEntero, validarBool, validarFloat, validarImagen,
    validarFiltros, validarValorFiltro, validarRango, orden} from "./validaciones_errores.js";
export const validarMision = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: constantes.ERROR_BODY_VACIO });
    }
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
    const {errores, procesados} = validarEntrada(entrada, reglasMision, req.method);
        if (errores.length !== 0){
            res.status(400).json({error:errores});
            return;
        }
        req.body = procesados;
        next();
};

export const validarFiltrosMision = (req, res, next) => {
    const regex = [constantes.ID, constantes.NOMBRE, constantes.DISPONIBLE, constantes.RELEVANCIA, 
    constantes.PORCENTAJE, constantes.CUERPO_CELESTE].join('|');
    const regexOrdenarPor = new RegExp( `^(${regex})$`, "i");

    const validadores = {
        [constantes.ID] : {regex : constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number},
        [constantes.NOMBRE] : {regex: constantes.REGEX_STRING, error: constantes.ERROR_FILTRO_STRING, caster : String},
        [constantes.RELEVANCIA] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number},
        [constantes.PORCENTAJE] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number},
        [constantes.DISPONIBLE] : {regex: constantes.REGEX_BOOL, error: constantes.ERROR_FILTRO_BOOL, caster : (val) => String(val).toLowerCase() === 'true'},
        [constantes.CUERPO_CELESTE] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number},
        [constantes.LIMITE]: { regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster: Number },
        [constantes.ORDENAR_POR]: { regex: regexOrdenarPor, error: constantes.ERROR_FILTRO_ORDENAR, caster: String },
        [constantes.ORDEN]: { regex: constantes.REGEX_ORDEN, error: constantes.ERROR_ORDEN, caster: orden }
    };

    const permitidos = new Set([
        constantes.ID, constantes.ID + "_min", constantes.ID + "_max",
        constantes.NOMBRE, constantes.DISPONIBLE, constantes.CUERPO_CELESTE,
        constantes.RELEVANCIA, constantes.RELEVANCIA + "_min", constantes.RELEVANCIA + "_max",
        constantes.PORCENTAJE, constantes.PORCENTAJE + "_min", constantes.PORCENTAJE + "_max",
        constantes.LIMITE, constantes.ORDENAR_POR, constantes.ORDEN
    ]);

    const erroresClaves = validarFiltros(Object.keys(req.query), permitidos);
    if (erroresClaves.length !== 0){
        return res.status(400).json({ error: constantes.ERROR_FILTROS, errores: erroresClaves });
    }

    const { valores, erroresValores } = validarValorFiltro(req.query, validadores);
    if (erroresValores.length !== 0){
        return res.status(400).json({ error: constantes.ERROR_FILTROS, errores: erroresValores });
    }

    const erroresRangos = validarRango(Object.keys(validadores), valores);
    if (erroresRangos.length !== 0){
        return res.status(400).json({ error: constantes.ERROR_FILTROS, errores: erroresRangos });
    }

    req.query = valores;
    next();
};
