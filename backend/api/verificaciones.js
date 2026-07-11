
// La función valida que hayan enviado un entero positivo dentro del rango 1-2.147.483.647.
// Si hay un error en la solicitud, enía un error 400 y devuelve. Sino, pasa a la función next pasada por parámetro.
export const validarId = (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id<=0 || id>2147483647){
        res.status(400).json({error: "El id ingresado debe ser un entero dentro del rango 1-2.147.483.647."});
        return;
    }
    next();
};

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
       return "El nombre ingresado es incorrecto, debe ser un string que contiene entre 1-50 caracteres.";
    }
    return "";
};
export const validarTipo = (tipo) => {
    if (typeof tipo != "string" || tipo.length===0 || tipo.length>20){
        return "El tipo ingresado es incorrecto, deber ser un string que contiene entre 1-20 caracteres.";
    }
    return "";
}

export const validarMotor = (motor) => {
    const motor_d = Number(motor);
    if (typeof motor != "number" || !Number.isInteger(motor_d) || motor_d<1 || motor_d>4){
        return "El motor ingresado es incorrecto, tiene que ser un entero en el rango 1-4.";
    }
    return "";
}

export const validarEstructura = (estructura) => {
    const estructura_d = Number(estructura);
    if (typeof estructura != "number" || !Number.isInteger(estructura_d)|| estructura_d<1 || estructura_d>4){
        return "La estructura ingresada es incorrecta, tiene que ser un entero en el rango 1-4.";
    }
    return "";
}

export const validarColor = (color) => {
    if (typeof color != "string" || color.length===0 || color.length>10){
        return "El color ingresdo es incorrecto, tiene que ser un string que contiene entre 1-10 caracteres.";
    }
    return "";
};
export const validarCombustible = (combustible) => {
    const combustible_d = Number(combustible);
    if (typeof combustible != "number" || !Number.isInteger(combustible_d) || combustible_d<0 || combustible_d>100){
        return "El combustible ingresado es incorrecto, debe ser un entero entre 0-100"
    }
    return "";
};

export const validarUbicacion = (ubicacion) => {
    const ubicaion_d = Number(ubicacion);
    if (typeof ubicacion != "number" || !Number.isInteger(ubicacion_d)|| ubicacion_d<1){
        return "La ubicación ingresada es incorrecta, tiene que ser un entero positivo.";
    }
    return "";
};