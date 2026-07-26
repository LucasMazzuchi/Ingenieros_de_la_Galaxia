import { db } from "./pool.js";
import { armar_consulta, verificarDependencia } from "./consultas.js";
import { CUERPOS_CELESTES_MAX, consulta } from "../constantes.js";
import { updateVehiculo } from "./vehiculos.js";
import { removeMision } from "./misiones.js";

// Busca todos los CuerposCelestes, se puede filtrar por sus campos, texto es la consulta y procesados son los datos.
// Devuelve todos los cuerpos que cumplan con los requisitos de filtrado. 
export async function getAllCuerposCelestes( cuerpo, entidad) {
    const sinFiltro = "SELECT c.id, c.nombre, c.descripcion, c.tipo, c.diametro, c.gravedad, c.temperatura, c.habitable, c.terreno, c.posicion, c.imagen, c.imagen_fondo FROM cuerpos_celestes as c WHERE c.borrado = FALSE";
    const {texto, procesados} = consulta(cuerpo, entidad, sinFiltro);
    const res = await db.query(texto, procesados);
    return res.rows;
}

// Busca el CuerposCeleste por el id pasado por parámetro. Devuelve el cuerpoCeleste en forma de diccionario.
export async function getCuerpoCeleste(id) {
    const solicitud = "SELECT id, nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, posicion, imagen, imagen_fondo FROM cuerpos_celestes WHERE id=$1 AND borrado = FALSE";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

// Crea un cuerpo celeste con los datos pasados por parámetro mediante el diccionario cuerpo. 
export async function createCuerpoCeleste(cuerpo) {
    if (await cantidadCuerposCelestes() >= CUERPOS_CELESTES_MAX){
        return {cuerpo : false, id: undefined, max: true};
    }
    const solicitud = "INSERT INTO cuerpos_celestes (nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, posicion, imagen, imagen_fondo, borrado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id";
    const valores = [cuerpo.nombre, cuerpo.descripcion, cuerpo.tipo, cuerpo.diametro, cuerpo.gravedad, cuerpo.temperatura, cuerpo.habitable, cuerpo.terreno, cuerpo.posicion, cuerpo.imagen, cuerpo.imagen_fondo, false];
    const res = await db.query(solicitud, valores);
    const ok = res.rowCount == 1;
    return {cuerpo : ok, id : ok ? res.rows[0].id : undefined, max: false};
}

// Borra un cuerpo celeste por el id pasado por parámetro marcando la casilla borrado como true. En caso de que no exista el cuerpo celeste devuelve false, sino devuelve true en ok junto
//  al cuerpo celeste borrado. Si el cuerpo celeste tiene puntos de interés que hacen referencia a él, devuelve ok en false, tieneDependientes en true y cuerpoCeleste en null. En el caso
// de no tener dependientes, devuelve en ok true, en cuerpoCeleste el cuerpo borrado y en tieneDependiendtes, false.
export async function removeCuerpoCeleste(id) {
    const {misiones, vehiculos} = await verificarDependencia(id);
    for (const mision of misiones){
        await removeMision(mision.id);
    }
    for (const vehiculo of vehiculos){
        await updateVehiculo(vehiculo.id, {ubicacion_id : 1, punto_interes: 0});
    }
    const consultaUpdate = "UPDATE cuerpos_celestes SET borrado = TRUE WHERE id = $1 AND borrado = FALSE RETURNING *";
    const resBorrado = await db.query(consultaUpdate, [id]);
    return { cuerpo: resBorrado.rows[0], misiones: misiones, vehiculos: vehiculos };
}

// Actualiza el cuerpo celeste con los datos pasados por el objeto cuerpo, para buscarlo usa el id pasado por parámetro.
// Devuelve true si se actualizo el cuerpo celeste, en caso contrario devuelve false.
export async function updateCuerpoCeleste(id, cuerpo){
    const { consulta, valores, numeroId } = armar_consulta(id, cuerpo)
    const solicitud = `UPDATE cuerpos_celestes SET ${consulta} WHERE id=$${numeroId} AND borrado = FALSE`;
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}
// Cuenta la cantidad de cuerpos celestes que hay en la base de datos sin borrar.
export async function cantidadCuerposCelestes(){
    const res = await db.query(" SELECT COUNT(*) FROM cuerpos_celestes WHERE borrado=FALSE");
    return Number(res.rows[0].count);
}
