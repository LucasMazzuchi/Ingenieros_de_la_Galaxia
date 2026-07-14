import { db } from "bd/pool.js";

export async function getAllCuerposCelestes() {
    const res = await db.query(
        "SELECT nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, x, y, imagenURL FROM cuerposCelestes"
    );
    return res.rows;
}

export async function getCuerpoCeleste(id) {
    const solicitud = "SELECT nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, x, y, imagenURL FROM cuerposCelestes WHERE id=$1";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

export async function createCuerpoCeleste(cuerpo) {
    const solicitud = "INSERT INTO cuerposCelestes (nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, x, y, imagenURL) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)";
    const valores = [cuerpo.nombre, cuerpo.descripcion, cuerpo.tipo, cuerpo.diametro, cuerpo.gravedad, cuerpo.temperatura, cuerpo.habitable, cuerpo.terreno, cuerpo.x, cuerpo.y, cuerpo.imagenURL];
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}

export async function removeCuerpoCeleste(id){
    const solicitud = "DELETE FROM cuerposCelestes WHERE id=$1";
    const res = await db.query(solicitud, [id]);
    return res.rowCount == 1;
}

export async function updateCuerpoCeleste(cuerpo){
    const solicitud = "Update cuerposCelestes SET nombre=$2, descripcion=$3, tipo=$4, diametro=$5, gravedad=$6, temperatura=$7, habitable=$8, terreno=$9, x=$10, y=$11, imagenURL=$12 WHERE id=$1";
    const valores = [cuerpo.id, cuerpo.nombre, cuerpo.descripcion, cuerpo.tipo, cuerpo.diametro, cuerpo.gravedad, cuerpo.temperatura, cuerpo.habitable, cuerpo.terreno, cuerpo.x, cuerpo.y, cuerpo.imagenURL];
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}