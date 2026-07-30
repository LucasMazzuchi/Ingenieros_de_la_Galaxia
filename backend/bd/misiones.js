import { db } from "./pool.js";
import { armar_consulta } from "./consultas.js";
import { consulta, MISIONES_MAX } from "../constantes.js"; 

// Busca todas las misiones, se puede filtrar por sus campos. El parámetro texto es la consulta y procesados son los datos.
// Devuelve todas las misiones que cumplan con los requisitos de filtrado. 
export async function getAllMisiones(filtros) {
    const sinFiltro = `SELECT m.id, m.nombre, c.nombre AS cuerpo_celeste, m.descripcion, m.posicion, m.imagen FROM misiones as m, cuerpos_celestes as c WHERE c.id = m.cuerpo_celeste_id AND m.borrado = FALSE AND c.borrado = FALSE`;
    const {texto, procesados} = consulta(filtros, "misiones", sinFiltro);
    const res = await db.query(texto, procesados);
    return res.rows;
}

// Busca la misión por el id pasado por parámetro. Devuelve la misión encontrada.
export async function getMision(id) {
    const solicitud = "SELECT m.id, m.nombre, c.nombre AS cuerpo_celeste, m.descripcion, m.posicion, m.imagen FROM misiones as m, cuerpos_celestes as c WHERE m.id = $1 AND c.id = m.cuerpo_celeste_id AND m.borrado = FALSE AND c.borrado = FALSE";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}
// Crea una misión con los datos pasados por parámetro mediante el diccionario mision.
// Devuelve true en mision, si fue creada exitosamente, sino devuelve false. También devuelve su id.
export async function createMision(mision) {
    if (await cantidadMisiones(mision.cuerpo_celeste_id) >= MISIONES_MAX){
        return { mision: false, id: undefined, max: true};
    }
    const solicitud = "INSERT INTO misiones (nombre, descripcion, posicion, imagen, cuerpo_celeste_id, borrado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
    const valores = [mision.nombre, mision.descripcion, mision.posicion, mision.imagen, mision.cuerpo_celeste_id, false];
    const res = await db.query(solicitud, valores);
    const ok = res.rowCount === 1;
    const resId = ok ? res.rows[0].id : undefined;
    return {mision : ok, id : resId, max: false};
}


// Borra una misión por el id pasado por parámetro marcando la casilla borrado como true. En caso de que no exista la misión devuelve false en ok,
// sino devuelve true en ok junto con el vehiculo borrado.
export async function removeMision(id){
    const solicitud = "UPDATE misiones SET borrado = TRUE WHERE id=$1 AND borrado = FALSE RETURNING *";
    const res = await db.query(solicitud, [id]);
    return {ok : res.rowCount == 1, mision : res.rows[0]};
}

// Actualiza la misión con los datos pasados por el objeto mision, para buscarla usa el id pasado por parámetro. Devuelve true si se actualizo la misión,
// en caso contrario devuelve false.
export async function updateMision(id, mision){
    const { consulta, valores, numeroId } = armar_consulta(id, mision)
    const solicitud = `UPDATE misiones SET ${consulta} WHERE id=$${numeroId} AND borrado = FALSE`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}

// Cuenta la cantidad de misiones que hay en la base de datos sin borrar.
export async function cantidadMisiones(id){
    const res = await db.query("SELECT COUNT(*) FROM misiones WHERE borrado=FALSE AND cuerpo_celeste_id=$1", [id]);
    return Number(res.rows[0].count);
}