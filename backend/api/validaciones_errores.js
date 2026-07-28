import * as constantes from "../constantes.js";
export const validarEntrada = (parametros, validaciones, metodo, camposRecibidos, progreso) => {
    let errores = [];
    let procesados = {};
    for (const [campo, validador] of Object.entries(validaciones)) {
        if (metodo === "PATCH" && parametros[campo].campo === undefined && !progreso) {
            continue;
        }
        const error = validador(parametros[campo]);
        if (error.length !== 0){
            errores.push(error);
            continue;
        }
        procesados[campo] = parametros[campo].campo;
    };
    const camposInvalidos = camposRecibidos.filter(function(campo){
        return !Object.hasOwn(validaciones, campo);
    });
    return {errores, procesados, camposInvalidos};
}

export const validarFiltros = (filtros, camposPermitidos) => {
    return filtros.filter(function (filtro) {
        return !camposPermitidos.has(filtro);
    });
};

export const validarValorFiltro = (filtros, validadores) => {
    let valores = {};
    let erroresValores = [];
    for (const [filtro, valor] of Object.entries(filtros)) {
        let clave = filtro;
        if (clave.endsWith("_min") || clave.endsWith("_max")) {
            clave = filtro.substring(0, filtro.length-4);
        }
        if (!validadores[clave].regex.test(valor)){
            erroresValores.push(validadores[clave].error);
            continue;
        }
        const casteado = validadores[clave].caster(valor);
        const { min, max } = validadores[clave];
        if (min === undefined || max === undefined || (min <= casteado && casteado <= max)){
            valores[filtro] = casteado;
            continue;
        }
        erroresValores.push(validadores[clave].error);
        
    }
    return {valores, erroresValores};
};

export const validarRango = (filtros, valores) => {
    let errores = [];
    for (const filtro of filtros){
        const min = valores[filtro + "_min"];
        const max = valores[filtro + "_max"];
        if (min !== undefined && max !== undefined && min > max){
            errores.push(constantes.ERROR_FILTRO_RANGO(filtro));
        }
    }
    return errores;
};

export const validarString = ({ campo,min, max, error }) => {
    if (typeof campo !== "string" || campo.length<min || campo.length>max){
       return constantes.ERROR_STRING(error, min ,max);
    }
    return "";
};
export const validarEntero = ({ campo, min, max, error }) => {
    if (typeof campo !== "number" || !Number.isInteger(campo) || campo<min || campo>max){
            return constantes.ERROR_INT(error, min, max);
        }
    return "";
};

export const validarBool = ({ campo, error }) => {
    if (typeof campo !== "boolean"){
        return constantes.ERROR_BOOL(error);
    }
    return "";
};

export const validarFloat = ({ campo, min, max, error }) => {
    if (typeof campo !== "number" || !Number.isFinite(campo) || campo<min || campo>max){
        return constantes.ERROR_FLOAT(error, min, max);
    }
    return "";
};

// La función valida que hayan enviado un entero positivo dentro del rango 1-2.147.483.647.
// Si hay un error en la solicitud, envía un error 400 y devuelve. Sino, pasa a la función next pasada por parámetro.

export const validarId = (req, res, next) => {
    const ok = _validarId({campo : req.params.id, min: 1, max: constantes.ID_MAX, error: constantes.ID});
    if (ok.length !== 0){
        return res.status(400).json({error: constantes.ERROR_INT("id", 1, constantes.ID_MAX)});
    }
    req.params.id = Number(req.params.id);
    next();
};

export const _validarId = ({campo, min, max, error}) => {
    const id = Number(campo);
    if (!/^[0-9]+$/.test(campo) || !Number.isInteger(id) || id<min || id>max){
        return `El campo debe ser un entero entre ${min} y ${max}`;
    }
    return "";
}

export const manejarError = (error) => {
    switch (error.code) {
        case constantes.CODIGO_REPETIDO:
            return {estado : 400 , msjError : constantes.ERROR_REPETIDO};
        case constantes.CODIGO_FK:
            return {estado : 400, msjError : constantes.ERROR_FK};
        default:
            return {estado : 500, msjError: constantes.ERROR_CONEXION};
    }
};


export const orden = (filtro) => {
    let cadena = String(filtro);
    if (cadena.toUpperCase() === "DESC"){
        cadena = "DESC";
    } else {
        cadena = "ASC";
    }
    return cadena;
};
