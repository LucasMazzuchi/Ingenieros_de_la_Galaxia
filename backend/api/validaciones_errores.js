import * as constantes from "../constantes.js"
export const validarEntrada = (parametros, validaciones) => {
    let errores = [];
    let procesados = {};
    for (const [campo, validador] of Object.entries(validaciones)) {
        const error = validador(parametros[campo]);
        if (error.length !== 0){
            errores.push(error);
        }
        procesados[campo] = parametros[campo];
    };
    return {errores, procesados};
}


export const validarNombre = (nombre) => {
    if (typeof nombre !== "string" || nombre.length===0 || nombre.length>50){
       return constantes.ERROR_STRING(constantes.NOMBRE, 0 ,50);
    }
    return "";
};
export const validarTipo = (tipo) => {
    if (typeof tipo != "string" || tipo.length===0 || tipo.length>20){
        return constantes.ERROR_STRING(constantes.TIPO, 0, 20);
    }
    return "";
};

export const validarColor = (color) => {
    if (typeof color != "string" || color.length===0 || color.length>10){
        return constantes.ERROR_STRING(constantes.COLOR, 0, 10);
    }
    return "";
};

// La función valida que hayan enviado un entero positivo dentro del rango 1-2.147.483.647.
// Si hay un error en la solicitud, envía un error 400 y devuelve. Sino, pasa a la función next pasada por parámetro.

export const validarId = (req, res, next) => {
    const id = Number(req.params.id);
    if (!/^[0-9]+$/.test(req.params.id) || !Number.isInteger(id) || id<1 || id>2147483647){
        res.status(400).json({error: constantes.ERROR_INT("id", 1, 2147483647)});
        return;
    }
    next();
};

export const manejarError = (error) => {
    switch (error) {
        case constantes.CODIGO_REPETIDO:
            return {estado : 400 , msjError : constantes.ERROR_REPETIDO}
        case constantes.CODIGO_FK:
            return {estado : 400, msjError : constantes.ERROR_FK}
        
        default:
            return {estado : 500, msjError: constantes.ERROR_CONEXION}
    }
};

