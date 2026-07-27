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

// Cadenas de consulta
export const LIMITE = "limite";
export const ORDEN = "orden";
export const ORDENAR_POR = "ordenar_por";
export const LIMIT = "limit";
export const ORDER = "order";
export const ORDER_BY = "order_by"

// REGEX
export const REGEX_STRING = /^[a-zA-Z_]+$/
export const REGEX_ORDEN = /^(ASC|DESC)$/i;
export const REGEX_ENTERO = /^[0-9]+$/;
export const REGEX_FLOAT = /^[0-9]+(\.[0-9]+)?$/;
export const REGEX_BOOL = /^(TRUE|FALSE)$/i;

// Errores filtro
export const ERROR_ORDEN = "El orden debe ser ASC o DESC";
export const ERROR_FILTRO_ORDENAR = "Columna de orden inválida";
export const ERROR_FILTRO_URL = "El valor debe ser una ruta valida.";
export const ERROR_FILTRO_STRING = "El valor debe ser un string de letras minúsculas o mayusculas.";
export const ERROR_FILTRO_ENTERO = "El valor debe ser un entero.";
export const ERROR_FILTRO_FLOAT = "El valor debe ser un float.";
export const ERROR_FILTRO_BOOL = "El valor debe ser un booleano.";
export const ERROR_FILTRO_RANGO = (campo) => {
    return `El valor min del campo ${campo} debe ser menor al valor máx.`
};

export const ERROR_URL = (campo) => {
    return `La URL ingresada para acceder al campo ${campo} es incorrecta, la ruta local no es válida o no cumple con el protocolo (HTTP/HTTPS).`;
};

// Resultado de consulta.
export const ERROR_CONSULTA = (entidad, consulta) => {
    return `La entidad ${entidad} no pudo ser ${consulta}`;
};

export const ERROR_ENTIDAD_LLENA = (entidad, max, extra = ".") => {
    return `La entidad ${entidad} no puede tener más de ${max} objetos${extra}`;
};

export const EXITO_CONSULTA = (entidad, consulta) => {
    return `La entidad ${entidad} fue ${consulta} exitosamente.`;
};

// Claves genéricas.
export const ID = "id";
export const NOMBRE = "nombre";
export const DESCRIPCION = "descripcion";
export const TIPO = "tipo";
export const UBICACION = "ubicacion_id";
export const POSICION = "posicion";
export const VEHICULO = "vehiculo_id";
export const MISION = "mision_id";

/* La función arma la consulta con los filtros que se le pasen, para la entidad especificada,
comenzando con el texto ingresado por parámetro.*/
export const consulta = (filtros, entidad, texto) => {
    let procesados = [];
    let indice = 1;
    for (let [campo, filtro] of Object.entries(filtros)) {
        if (campo === "limit" || campo === "order_by" || campo === "order") {
            continue; 
        }
        let operador = "=";
        if (campo.endsWith("_min")){
            campo = campo.replace("_min", "");
            operador = ">=";
        } else if (campo.endsWith("_max")){
            campo = campo.replace("_max", "");
            operador = "<=";
        }
        texto += ` AND ${entidad[0]}.${campo} ${operador} $${indice}`;
        procesados.push(filtro);
        indice++;
    }
    const filtro = filtros[ORDER_BY] || ID;
    const orden = filtros[ORDER] || "ASC";
    const limite = filtros[LIMIT] || 100;
    texto += ` ORDER BY ${entidad[0]}.${filtro} ${orden}`;

    texto += ` LIMIT $${indice}`;
    procesados.push(limite);
    return {texto, procesados};
};

// Errores de consultas.
export const ERROR_BODY_VACIO = "El cuerpo de la solicitud (body) no puede estar vacío.";
export const ERROR_INEXISTENTE = "La entidad no existe.";
export const ERROR_DEPENDENCIAS = "No se puede eliminar el cuerpo celeste porque tiene vehículos o misiones activos asociados.";
export const ERROR_FILTROS = "Los filtros enviados son incorrectos.";
export const ERROR_FILTROS_VALORES = "Los valores envíados para filtrar son incorrectos.";
export const ERROR_CAMPOS = "El cuerpo de la solicitud contiene campos no permitidos.";
export const ERROR_FK = "La clave foránea es incorrecta. Debe referenciar a una entidad existente.";
export const ERROR_REPETIDO = "El id ingresado es incorrecto, pues ya existe en el sistema.";
export const ERROR_CONEXION = "Ocurrió un error con la conexión a la base de datos.";
export const CODIGO_REPETIDO = "23505";
export const CODIGO_FK = "23503";



// Claves de vehículos.
export const MOTOR = "motor";
export const ESTRUCTURA = "estructura";
export const RESISTENCIA= "resistencia";

export const COMBUSTIBLE = "combustible";
export const PUNTO_INTERES = "punto_interes";


// Claves de cuerpos celestes.
export const TERRENO = "terreno";
export const DIAMETRO = "diametro";
export const GRAVEDAD = "gravedad";
export const TEMPERATURA = "temperatura";
export const HABITABLE = "habitable";
export const IMAGEN = "imagen";
export const IMAGEN_FONDO = "imagen_fondo";

// Claves de misiones.
export const PORCENTAJE = "porcentaje";
export const DISPONIBLE = "disponible";
export const CUERPO_CELESTE = "cuerpo_celeste_id";

// Límites a parámetros genéricos.
export const ID_MAX = 2147483647;
export const NOMBRE_MAX = 50;
export const DESCRIPCION_MAX = 1000;
export const TIPO_MAX = 3;

// Límites a parámetros de cuerpos celestes.
export const TEMPERATURA_MIN = -273;
export const TEMPERATURA_MAX = 10000;
export const CUERPOS_CELESTES_MAX = 10;
export const IMAGEN_MAX = 10;
export const IMAGEN_FONDO_MAX = 10;

export const POSICION_MAX = 10; //Cambiar en base a la cantidad de planetas que se hagan en el front

export const TERRENO_MAX = 3;
export const DIAMETRO_MAX = 10000000;
export const GRAVEDAD_MAX = 1000;

// Límites a parámetros de vehículos.
export const MOTOR_MAX = 3;
export const RESISTENCIA_MAX = 3;
export const ESTRUCTURA_MAX = 3;
export const COMBUSTIBLE_MAX = 100;
export const VEHICULOS_MAX = 2;
export const PUNTO_INTERES_MAX = 3;

// Límites a parámetros de misiones.
export const PORCENTAJE_MAX = 100;
export const LIMITE_MAX = 100;
export const MISIONES_MAX = 4;
