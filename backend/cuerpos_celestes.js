import { db } from "bd/pool.js";

export async function getAllCuerposCelestes() {
    const res = await db.query(
        "SELECT c.nombre, c.tipo, c.diametro, c.gravedad, c.temperatura, c.habitable, c.terreno FROM cuerposCelestes as c"
    );
    return res.rows;
}

export async function getCuerpoCeleste(id) {
    const solicitud = "SELECT c.nombre, c.tipo, c.diametro, c.gravedad, c.temperatura, c.habitable, c.terreno FROM cuerposCelestes as c WHERE c.id=$1"
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

export async function createCuerpoCeleste(cuerpo) {
    const solicitud = "INSERT INTO cuerposCelestes (nombre, tipo, diametro, gravedad, temperatura, habitable, terreno) VALUES ($1, $2, $3, $4, $5, $6, $7)"
    const valores = [cuerpo.nombre, cuerpo.tipo, cuerpo.diametro, cuerpo.gravedad, cuerpo.temperatura, cuerpo.habitable, cuerpo.terreno]
    const res = await db.query(solicitud, valores);
}

export async function removeCuerpoCeleste(id){
    const solicitud = "DELETE FROM cuerposCelestes WHERE id=$1"
    const res = await db.query(solicitud, [id]);
    return res
}

export async function updateCuerpoCeleste(cuerpo){
    const solicitud = "Update cuerposCelestes SET nombre=$2, tipo=$3, diametro=$4, gravedad=$5, temperatura=$6, habitable=$7, terreno=$8 WHERE id=$1" 
    const valores = [cuerpo.id, cuerpo.nombre, cuerpo.tipo, cuerpo.diametro, cuerpo.gravedad, cuerpo.temperatura, cuerpo.habitable, cuerpo.terreno]
    const res = await db.query(solicitud, valores);
}