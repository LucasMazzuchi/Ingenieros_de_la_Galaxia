import * as constantes from "../constantes.js";
import {validarEntrada, validarString, validarEntero, validarBool, validarFloat, validarImagen,
    validarFiltros, validarValorFiltro, validarRango, orden} from "./validaciones_errores.js";

export const validarCuerpoCeleste = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: constantes.ERROR_BODY_VACIO });
    }
    const reglasCuerpoCeleste = {
    [constantes.NOMBRE]: validarString,
    [constantes.DESCRIPCION]: validarString,
    [constantes.TIPO]: validarEntero,
    [constantes.TERRENO]: validarEntero,
    [constantes.DIAMETRO]: validarEntero,
    [constantes.GRAVEDAD]: validarFloat,
    [constantes.TEMPERATURA]: validarEntero,
    [constantes.HABITABLE]: validarBool,
    [constantes.TERRENO]: validarEntero,
    [constantes.POSICION]: validarEntero,
    [constantes.IMAGEN]: validarImagen
    };
    const entrada = {
    [constantes.NOMBRE]: { campo: req.body.nombre, min: 1, max: constantes.NOMBRE_MAX, error: constantes.NOMBRE },
    [constantes.DESCRIPCION]: { campo: req.body.descripcion, min: 0, max: constantes.DESCRIPCION_MAX, error: constantes.DESCRIPCION },
    [constantes.TIPO]: { campo: req.body.tipo, min: 1, max: constantes.TIPO_MAX, error: constantes.TIPO },
    [constantes.TERRENO]: { campo: req.body.terreno, min: 1, max: constantes.TERRENO_MAX, error: constantes.TERRENO },
    [constantes.DIAMETRO]: { campo: req.body.diametro, min: 1, max: constantes.DIAMETRO_MAX, error: constantes.DIAMETRO },
    [constantes.GRAVEDAD]: { campo: req.body.gravedad, min: 1, max: constantes.GRAVEDAD_MAX, error: constantes.GRAVEDAD },
    [constantes.TEMPERATURA]: { campo: req.body.temperatura, min: constantes.TEMPERATURA_MIN, max: constantes.TEMPERATURA_MAX, error: constantes.TEMPERATURA },
    [constantes.HABITABLE]: { campo: req.body.habitable, error: constantes.HABITABLE },
    [constantes.TERRENO]: {campo:req.body.terreno, min: 1, max:constantes.TERRENO_MAX, error: constantes.TERRENO },
    [constantes.POSICION]: { campo: req.body.posicion, min: 1, max: constantes.POSICION_MAX, error: constantes.POSICION },
    [constantes.IMAGEN]: { campo: req.body.imagen_url }
    };
    const {errores, procesados, camposInvalidos} = validarEntrada(entrada, reglasCuerpoCeleste, req.method, Object.keys(req.body));
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

export const validarFiltrosCuerpoCeleste = (req, res, next) => {
    // 1. Armamos la regex dinámica para las columnas válidas de ordenamiento
    const regex = [constantes.ID, constantes.NOMBRE, constantes.TIPO, 
    constantes.DIAMETRO, constantes.GRAVEDAD, constantes.TEMPERATURA,
    constantes.TERRENO, constantes.HABITABLE].join('|');
    const regexOrdenarPor = new RegExp( `^(${regex})$`, "i");

    const validadores = {
        [constantes.ID] : {regex : constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.ID_MAX},
        [constantes.NOMBRE] : {regex: constantes.REGEX_STRING, error: constantes.ERROR_FILTRO_STRING, caster : String},
        [constantes.TIPO] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.TIPO_MAX},
        [constantes.DIAMETRO] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.DIAMETRO_MAX},
        [constantes.GRAVEDAD] : {regex: constantes.REGEX_FLOAT, error: constantes.ERROR_FILTRO_FLOAT, caster : Number, min: 1, max: constantes.GRAVEDAD_MAX},
        [constantes.TEMPERATURA] : {regex: /^-?[0-9]+$/, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: constantes.TEMPERATURA_MIN, max: constantes.TEMPERATURA_MAX},
        [constantes.HABITABLE] : {regex: constantes.REGEX_BOOL, error: constantes.ERROR_FILTRO_BOOL, caster : (bool) => String(bool).toLowerCase() === 'true'},
        [constantes.TERRENO] : {regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster : Number, min: 1, max: constantes.TERRENO_MAX},
        [constantes.LIMITE]: { regex: constantes.REGEX_ENTERO, error: constantes.ERROR_FILTRO_ENTERO, caster: Number, min: 1, max: constantes.LIMITE_MAX },
        [constantes.ORDENAR_POR]: { regex: regexOrdenarPor, error: constantes.ERROR_FILTRO_ORDENAR, caster: String },
        [constantes.ORDEN]: { regex: constantes.REGEX_ORDEN, error: constantes.ERROR_ORDEN, caster: orden }
    };

    const permitidos = new Set([
        constantes.ID, constantes.ID + "_min", constantes.ID + "_max",
        constantes.NOMBRE, constantes.HABITABLE,
        constantes.TIPO, constantes.TIPO + "_min", constantes.TIPO + "_max",
        constantes.DIAMETRO, constantes.DIAMETRO + "_min", constantes.DIAMETRO + "_max",
        constantes.GRAVEDAD, constantes.GRAVEDAD + "_min", constantes.GRAVEDAD + "_max",
        constantes.TEMPERATURA, constantes.TEMPERATURA + "_min", constantes.TEMPERATURA + "_max",
        constantes.TERRENO, constantes.TERRENO + "_min", constantes.TERRENO + "_max",
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
    for (const key in req.query) {
        delete req.query[key];
    }
    for (const key in valores) {
        req.query[key] = valores[key];
    }
    next();
};
