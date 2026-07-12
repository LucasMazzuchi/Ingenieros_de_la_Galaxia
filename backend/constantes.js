export const ERROR_STRING = (campo, min, max) => {
    return `El valor ingresado en ${campo} es incorrecto. Debe ser un texto de entre ${min} y ${max} caracteres.`;
};
export const ERROR_INT = (campo, min, max) => {
    return `El valor ingresado en ${campo} es incorrecto. Debe ser un entero entre ${min} y ${max}.`;
};

export const ERROR_CONSULTA = (entidad, consulta) => {
    return `La entidad ${entidad} no pudo ser ${consulta}`;
};
export const ERROR_INEXISTENTE = "La entidad no existe."
export const CODIGO_REPETIDO = "23505";
export const CODIGO_FK = "23503";
export const ERROR_FK = "La clave foránea es incorrecta. Debe referenciar a una entidad existente.";
export const ERROR_REPETIDO = "El id ingresado es incorrecto, pues ya existe en el sistema.";
export const ERROR_CONEXION = "Ocurrió un error con la conexión a la base de datos.";

export const EXITO_CONSULTA = (entidad, consulta) => {
    return `La entidad ${entidad} fue ${consulta} exitosamente.`;
};
export const NOMBRE = "nombre";
export const TIPO = "tipo";
export const COLOR = "color";
export const UBICACION = "ubicacionId";

export const MOTOR = "motor";
export const ESTRUCTURA = "estructura";
export const COMBUSTIBLE = "combustible";