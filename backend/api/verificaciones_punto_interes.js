import * as constantes from "../constantes.js";
import {validarEntrada, validarString, validarEntero, validarBool,
    validarFiltros, validarValorFiltro, validarRango, orden} from "./validaciones_errores.js";

// La función inicializa el diccionario de validadores y el de entrada para la entidad puntos de interés, valida la entrada mediante validarEntrada y llama a la
// next. En caso de tener campos que no cumplan con los validadores, responde con un error 400 que contiene los campos inválidos y sus errores. Si ocurre un error
// dentro de las validaciones, responde con un código 400 y los errores.
export const validarPuntoInteres = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: constantes.ERROR_BODY_VACIO });
    }
    const reglasPuntoInteres = {
    [constantes.NOMBRE]: validarString,
    [constantes.DESCRIPCION]: validarString,
    [constantes.POSICION]: validarEntero,
    [constantes.IMAGEN]: validarEntero,
    [constantes.CUERPO_CELESTE]: validarEntero

    };
    const entrada = {
    [constantes.NOMBRE]: { campo: req.body.nombre, min: 1, max: constantes.NOMBRE_MAX, error: constantes.NOMBRE },
    [constantes.DESCRIPCION]: { campo: req.body.descripcion, min: 0, max: constantes.DESCRIPCION_MAX, error: constantes.DESCRIPCION },
    [constantes.POSICION]: {campo: req.body.posicion, min:1, max: constantes.PUNTO_INTERES_MAX, error: constantes.POSICION},
    [constantes.IMAGEN]: {campo: req.body.imagen, min: 1, max: constantes.IMAGEN_PUNTO_MAX, error: constantes.IMAGEN},
    [constantes.CUERPO_CELESTE]: { campo: req.body.cuerpo_celeste_id, min: 1, max: constantes.ID_MAX, error: constantes.CUERPO_CELESTE }

};
    const {errores, procesados, camposInvalidos} = validarEntrada(entrada, reglasPuntoInteres, req.method, Object.keys(req.body), false);
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

// La función inicializa los diccionarios con los validadores y los campos permitidos para filtrar en la entidad puntos de interés, valida que los filtros
// dentro de req sean correctos, los procesa, los carga en body y llama a next. En caso de haber filtros que no cumplen con los validadores, responde con un
// código 400, los filtros equivocados y sus errores.
export const validarFiltrosPuntoInteres = (req, res, next) => {
    const regex = [constantes.ID, constantes.NOMBRE, constantes.CUERPO_CELESTE, constantes.POSICION].join('|');
    const regexOrdenarPor = new RegExp( `^(${regex})$`, "i");

    const validadores = {
        [constantes.ID] : {regex : constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.ID_MAX},
        [constantes.NOMBRE] : {regex: constantes.REGEX_STRING, error: constantes.ERROR_FILTRO_STRING, caster : String},
        [constantes.CUERPO_CELESTE] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.ID_MAX},
        [constantes.POSICION] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster: Number, min: 1, max: constantes.PUNTO_INTERES_MAX},
        [constantes.LIMITE]: { regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster: Number, min: 1, max: constantes.LIMITE_MAX },
        [constantes.ORDER_BY]: { regex: regexOrdenarPor, error: constantes.ERROR_FILTRO_ORDENAR, caster: String },
        [constantes.ORDER]: { regex: constantes.REGEX_ORDEN, error: constantes.ERROR_ORDEN, caster: orden }
    };

    const permitidos = new Set([
        constantes.ID, constantes.ID + "_min", constantes.ID + "_max",
        constantes.NOMBRE, constantes.CUERPO_CELESTE, constantes.POSICION,
        constantes.LIMITE, constantes.ORDER_BY, constantes.ORDER
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

    for (const key in req.query) {
        delete req.query[key];
    }
    for (const key in valores) {
        req.query[key] = valores[key];
    }    next();
};