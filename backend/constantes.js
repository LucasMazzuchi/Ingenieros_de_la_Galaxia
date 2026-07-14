// Cadenas de error de formato.
export const ERROR_STRING = (campo, min, max) => {
    return `El valor ingresado en ${campo} es incorrecto. Debe ser un texto de entre ${min} y ${max} caracteres.`;
};
export const ERROR_INT = (campo, min, max) => {
    return `El valor ingresado en ${campo} es incorrecto. Debe ser un entero entre ${min} y ${max}.`;
};

export const ERROR_BOOL = (campo) => {
    return `El valor ingresado en ${campo} es incorrecto. Debe ser un booleano.`;
};

export const ERROR_FLOAT = (campo, min, max) => {
    return `El valor ingresado en ${campo} es incorrecto. Debe ser un float entre ${min} y ${max}.`;
};

export const ERROR_URL = (campo) => {
    return `La URL ingresada para acceder al campo ${campo} es incorrecta, la ruta local no es válida o no cumple con el protocolo (HTTP/HTTPS).`;
};

// Resultado de consulta.
export const ERROR_CONSULTA = (entidad, consulta) => {
    return `La entidad ${entidad} no pudo ser ${consulta}`;
};

export const EXITO_CONSULTA = (entidad, consulta) => {
    return `La entidad ${entidad} fue ${consulta} exitosamente.`;
};

// Errores de consultas.
export const ERROR_INEXISTENTE = "La entidad no existe.";
export const ERROR_FK = "La clave foránea es incorrecta. Debe referenciar a una entidad existente.";
export const ERROR_REPETIDO = "El id ingresado es incorrecto, pues ya existe en el sistema.";
export const ERROR_CONEXION = "Ocurrió un error con la conexión a la base de datos.";
export const CODIGO_REPETIDO = "23505";
export const CODIGO_FK = "23503";


// Claves genéricas.
export const NOMBRE = "nombre";
export const DESCRIPCION = "descripcion";
export const TIPO = "tipo";
export const COLOR = "color";
export const UBICACION = "ubicacionId";
export const IMAGEN = "imagenURL";
export const POS_X = "x";
export const POS_Y = "y";

// Claves de vehículos.
export const MOTOR = "motor";
export const ESTRUCTURA = "estructura";
export const COMBUSTIBLE = "combustible";


// Claves de cuerpos celestes.
export const TERRENO = "terreno";
export const DIAMETRO = "diametro";
export const GRAVEDAD = "gravedad";
export const TEMPERATURA = "temperatura";
export const HABITABLE = "habitable";

// Claves de misiones.
export const RELEVANCIA = "relevancia";
export const PORCENTAJE = "porcentaje";
export const DISPONIBLE = "disponible";
export const CUERPO_CELESTE = "cuerpoCelesteId";

// Límites a parámetros genéricos.
export const ID_MAX = 2147483647;
export const NOMBRE_MAX = 30;
export const IMAGEN_MAX = 250;
export const DESCRIPCION_MAX = 1000;
export const TIPO_MAX = 4;

// Límites a parámetros de cuerpos celestes.
export const TEMPERATURA_MIN = -273;
export const TEMPERATURA_MAX = 10000;

export const COORDENADA_MIN = -20000;
export const COORDENADA_MAX = 20000;

export const TERRENO_MAX = 5;
export const DIAMETRO_MAX = 10000000;
export const GRAVEDAD_MAX = 1000;

// Límites a parámetros de vehículos.
export const COLOR_MAX = 10;
export const MOTOR_MAX = 4;
export const ESTRUCTURA_MAX = 4;
export const COMBUSTIBLE_MAX = 100;

// Límites a parámetros de misiones.
export const RELEVANCIA_MAX = 3;
export const PORCENTAJE_MAX = 100;
