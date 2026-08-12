import * as constantes from "../constantes.js";
import { _validarId, validarEntrada, validarEntero } from "./validaciones_errores.js";
import * as progreso from "../bd/progreso.js";
import { getVehiculo } from "../bd/vehiculos.js";
import { getPunto, getAllPuntos } from "../bd/puntos_interes.js";
// La función valida que los Ids pasados por req.params o req.body sean válidos y los inserta procesados. Utiliza como validador en caso de estar en req.params
// _validarId, sino usa validarEntero. Valida los datos con validarEntrada y llama a la función next. En caso de no cumplir con los validadores, responde un
// error 400 con los errores y los campos a los que corresponden. Si ocurre un error responde con un error 400 y el error.
export const validarIdsParams = (req, res, next) => {
    // Chequeo de seguridad de params
    if (!req.params || Object.keys(req.params).length === 0 || Object.keys(req.params).length > 2) {
        return res.status(400).json({ error: constantes.ERROR_CAMPOS });
    }
    const entrada = {
        [constantes.ID]: { campo: req.params.id, min: 1, max: constantes.ID_MAX, error: constantes.ID },
        [constantes.CUERPO_CELESTE]: { campo: req.params.cuerpo_celeste_id, min: 1, max: constantes.ID_MAX, error: constantes.CUERPO_CELESTE }
    };
    const reglasIds = {
        [constantes.ID]: _validarId,
        [constantes.CUERPO_CELESTE]: _validarId
    };
    ejecutarValidacion(entrada, reglasIds, req.method, req.params, res, next, req);
};

// Validar para el PATCH general
export const validarIdsPatchGeneral = (req, res, next) => {
    const entrada = {
        [constantes.CUERPO_CELESTE]: { campo: req.body.cuerpo_celeste_id, min: 1, max: constantes.ID_MAX, error: constantes.CUERPO_CELESTE },
        [constantes.PUNTO_INTERES_ID]: { campo: req.body.punto_interes_id, min: 1, max: constantes.ID_MAX, error: constantes.PUNTO_INTERES }
    };
    const reglasIds = {
        [constantes.CUERPO_CELESTE]: validarEntero,
        [constantes.PUNTO_INTERES_ID]: validarEntero
    };
    ejecutarValidacion(entrada, reglasIds, req.method, req.body, res, next, req);
};

// Validaciones para el PATCH de completar
export const validarIdsPatchCompletar = (req, res, next) => {
    const entrada = {
        [constantes.CUERPO_CELESTE]: { campo: req.body.cuerpo_celeste_id, min: 1, max: constantes.ID_MAX, error: constantes.CUERPO_CELESTE }
    };
    const reglasIds = {
        [constantes.CUERPO_CELESTE]: validarEntero
    };
    ejecutarValidacion(entrada, reglasIds, req.method, req.body, res, next, req);
};

// Valida que los datos que está en req existan, que tengan la relación de distancia y disponiblidad adecuadas, evalúa si es la primera vez entrando al planeta
// y lo registra en req.primero. En caso de error, responde con un 500, sino llama a la función next.
export const validarReglasDesbloqueo = async (req, res, next) => {
    try {
        const {actual, vehiculo, puntosInteres, errorDatos} = await obtenerDatos(req.body.punto_interes_id, req.params.id, req.body.cuerpo_celeste_id);
        if (errorDatos.length !== 0){
            return res.status(404).json({ error: errorDatos });
        }
        const {estado, errorLogica} = await validacionesLogica(actual, puntosInteres, vehiculo, req.body.punto_interes_id, req.body.cuerpo_celeste_id);
        if (estado){
            return res.status(estado).json({ error: errorLogica });
        }
        req.primero = await esPrimeraVez(actual, puntosInteres, req.params.id, req.body.cuerpo_celeste_id);
        next();
    } catch (error) {
        console.error("Error exacto en validarReglasDesbloqueo:", error);
        res.status(500).json({ error: "Error interno al validar las reglas de exploración." });
    }
};

// La función busca el estado del punto de interés asociado al id pasado por el cuerpo de req respecto al vehículo asociado al id pasado por parámetro en req
// y llama a la función next, Si ocurre un error, responde. En caso de tener que descubrir otro punto primero responde con estado 403 junto con su error, si el punto fue explorado con estado 400, en otros
// casos de error con un estado 500.
export const verificarEstadoPunto = async (req, res, next) => {// Si hay 0 puntos de interes, o no se puede desubrir el punto, retorna.
    try {
        const puntoInteres = await progreso.getPunto(req.params.id, req.body.punto_interes_id);
        if (!puntoInteres) {
            return res.status(403).json({ error: "Tenés que descubrir este punto primero." });
        }
        if (puntoInteres.completado) {
            return res.status(400).json({ error: "Este punto ya fue explorado por la nave." });
        }
        return next();
    } catch (error){
        res.status(500).json({ error: "Error al verificar el estado del punto de interés." });
    }
};


// Función que llama al validador para los parámetros.
const ejecutarValidacion = (entrada, reglas, metodo, datosReales, res, next, req) => {
    const {errores, procesados, camposInvalidos} = validarEntrada(entrada, reglas, metodo, Object.keys(datosReales), true);
    if (camposInvalidos.length !== 0) {
        return res.status(400).json({error: constantes.ERROR_CAMPOS, campos: camposInvalidos});
    }
    if (errores.length !== 0){
        return res.status(400).json({error: errores}); 
    }
    req.body = procesados;
    next();
};



// Obtiene, valida y retorna los datos asociados a los ids pasados por parámetro. En caso de ocurrir un error, error contiene la cadena que especifica por que falló.
const obtenerDatos = async (idPunto, idVehiculo, idCuerpoCeleste) => {
    const actual = await getPunto(idPunto);
    if (!actual) return { actual: undefined, vehiculo: undefined, puntosInteres: undefined, errorDatos: constantes.ERROR_INEXISTENTE };
    const vehiculo = await getVehiculo(idVehiculo);
    if (!vehiculo) return { actual: undefined, vehiculo: undefined, puntosInteres: undefined, errorDatos: constantes.ERROR_INEXISTENTE };
    const puntosInteres = await getAllPuntos({
        cuerpo_celeste_id : idCuerpoCeleste,
        [constantes.ORDER_BY] : "posicion",
        [constantes.ORDER] : "ASC"
    });
    if (!puntosInteres || puntosInteres.length === 0) return { actual: undefined, vehiculo: undefined, puntosInteres: undefined, errorDatos: constantes.ERROR_CERO_PUNTOS };
    return { actual: actual, vehiculo: vehiculo, puntosInteres: puntosInteres, errorDatos: "" };
};

// La función devuelve true si es la primera vez que el vehículo asociado a vehiculoId visita al cuerpo celeste asociado a cuerpoCelesteId. Sino devuelve false.
const esPrimeraVez = async (actual, puntosInteres, vehiculoId, cuerpoCelesteId) => {
    if (actual.posicion === puntosInteres[0].posicion) {
        const yaVisitado = await progreso.getPlaneta(vehiculoId, cuerpoCelesteId);
        return !yaVisitado;
    }
    return false;
};

// La función valida que la distancia entre el punto actual y el anterior sea menor o igual a 1 y que el punto anterior esté desbloqueado.
// En caso de estar mal en el primer caso, retorna un estado 409, si es el segundo devuelve un 403, ambos con sus respectivos errores.
// Si el punto de interés al que quiere ir ya está desbloqueado, retorna el estado 200 con una cadena vacía. 
// Cuando no está desbloqueado y pasa las validaciones, estado es undefined.
const validacionesLogica = async (actual, puntosInteres, vehiculo, puntoId, cuerpoCelesteId) => {
    if (puntosInteres.length > 2 && Math.abs(vehiculo.punto_interes - actual.posicion) > 1) {
        return { estado: 409, errorLogica: constantes.ERROR_DISTANCIA };
    }

    const actualEstado = await progreso.getPunto(vehiculo.id, puntoId);
    if (actualEstado) {
        return { estado: 200, errorLogica: "" };             
    }

    if (actual.posicion > 1 && puntosInteres[0].id !== puntoId) {
        const puntoInteresAnterior = await progreso.getPuntoAnteriorEnPlaneta(cuerpoCelesteId, actual.posicion);
        const estaDesbloqueada = await progreso.getPunto(vehiculo.id, puntoInteresAnterior.id);
        if (!estaDesbloqueada) {
            return { estado: 403, errorLogica: constantes.ERROR_FALTA_PROGRESO };
        }
    }
    return { estado: undefined, errorLogica: "" };
}