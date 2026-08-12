import { db } from "./pool.js";
import { armar_consulta, verificarDependencia, verificarNaves } from "./consultas.js";
import { consulta, PUNTO_INTERES_MAX } from "../constantes.js"; 
import { updateVehiculo } from "./vehiculos.js";

// Busca todas los puntos de interés, se puede filtrar por sus campos. El parámetro texto es la consulta y procesados son los datos.
// Devuelve todas los puntos de interés que cumplan con los requisitos de filtrado. 
export async function getAllPuntos(filtros) {
    const sinFiltro = `SELECT p.id, p.nombre, c.nombre AS cuerpo_celeste, p.descripcion, p.posicion, p.imagen, p.cuerpo_celeste_id FROM puntos_interes as p, cuerpos_celestes as c WHERE c.id = p.cuerpo_celeste_id AND p.borrado = FALSE AND c.borrado = FALSE`;
    const {texto, procesados} = consulta(filtros, "puntos_interes", sinFiltro);
    const res = await db.query(texto, procesados);
    return res.rows;
}

// Busca el punto de interés por el id pasado por parámetro. Devuelve el punto de interés encontrado.
export async function getPunto(id) {
    const solicitud = "SELECT p.id, p.nombre, c.nombre AS cuerpo_celeste, p.descripcion, p.posicion, p.imagen, p.cuerpo_celeste_id FROM puntos_interes as p, cuerpos_celestes as c WHERE p.id = $1 AND c.id = p.cuerpo_celeste_id AND p.borrado = FALSE AND c.borrado = FALSE";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}
// Crea un punto de interés con los datos pasados por parámetro mediante el diccionario puntoInteres.
// Devuelve true en puntoInteres, si fue creado exitosamente, sino devuelve false. También devuelve su id.
export async function createPunto(puntoInteres) {
    if (await cantidadPuntos(puntoInteres.cuerpo_celeste_id) >= PUNTO_INTERES_MAX){
        return { puntoInteres: false, id: undefined, max: true};
    }
    const solicitud = "INSERT INTO puntos_interes (nombre, descripcion, posicion, imagen, cuerpo_celeste_id, borrado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
    const valores = [puntoInteres.nombre, puntoInteres.descripcion, puntoInteres.posicion, puntoInteres.imagen, puntoInteres.cuerpo_celeste_id, false];
    const res = await db.query(solicitud, valores);
    const ok = res.rowCount === 1;
    const resId = ok ? res.rows[0].id : undefined;
    return {puntoInteres : ok, id : resId, max: false};
}


// Borra un punto de interés por el id pasado por parámetro marcando la casilla borrado como true. En caso de que no exista el punto de interés devuelve false en ok,
// sino devuelve true en ok junto con el vehiculo borrado.
export async function removePunto(posicion, cuerpoCelesteId, id){
    const navesConflicto = await verificarNaves(posicion, cuerpoCelesteId);
    if (navesConflicto.length !== 0){
        const puntosInteres = await getAllPuntos({cuerpo_celeste_id: cuerpoCelesteId, "order_by": "posicion", "order": "ASC"});
        let indice = 0;
        puntosInteres.forEach(function (puntoInteres, index){
            if (puntoInteres.posicion === posicion){
                indice = index;
            }
        });
        for(const vehiculo of navesConflicto){
            if (puntosInteres.length > 1){
                const nuevoIndice = indice > 0 ? indice - 1 : indice + 1;
                const cambioNavePunto = await updateVehiculo(vehiculo.id, {punto_interes: puntosInteres[nuevoIndice].posicion});
            } else {
                const cambioNaveCuerpo = await updateVehiculo(vehiculo.id, {ubicacion_id: 1, punto_interes: 1});
            }
        };
    }
    const solicitud = "UPDATE puntos_interes SET borrado = TRUE WHERE id=$1 AND borrado = FALSE RETURNING *";
    const res = await db.query(solicitud, [id]);
    return {ok : res.rowCount == 1, puntoInteres : res.rows[0]};
}

// Actualiza el punto de interés con los datos pasados por el objeto puntoInteres, para buscarlo usa el id pasado por parámetro. Devuelve true si se actualizo el punto de interés,
// en caso contrario devuelve false.
export async function updatePunto(id, puntoInteres){
    const { consulta, valores, numeroId } = armar_consulta(id, puntoInteres)
    const solicitud = `UPDATE puntos_interes SET ${consulta} WHERE id=$${numeroId} AND borrado = FALSE`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}

// Cuenta la cantidad de puntos de interés que hay en la base de datos sin borrar.
export async function cantidadPuntos(id){
    const res = await db.query("SELECT COUNT(*) FROM puntos_interes WHERE borrado=FALSE AND cuerpo_celeste_id=$1", [id]);
    return Number(res.rows[0].count);
}