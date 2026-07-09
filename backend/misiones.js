import { db } from "bd/pool.js";

export async function getAllMisiones() {
    const res = await db.query(
        "SELECT m.nombre, c.nombre as planeta, m.descripcion, m.relevancia, m.porcentaje, m.disponible FROM Misiones as m, CuerposCelestes as c WHERE c.id = m.planetaId"
    );
    return res.rows;
}

export async function getMision(id) {
    const solicitud = "SELECT m.nombre, c.nombre as planeta, m.descripcion, m.relevancia, m.porcentaje, m.disponible FROM Misiones as m, CuerposCelestes as c WHERE m.id = $1 and c.id = m.planetaId";
    const res = await db.query(solicitud, [id]);
    return res.rows[0];
}

export async function createMision(mision) {
    const solicitud = "INSERT INTO Misiones (nombre, descripcion, relevancia, porcentaje, disponible, planetaId) VALUES ($1, $2, $3, $4, $5, $6)";
    const valores = [mision.nombre, mision.descripcion, mision.relevancia, mision.porcentaje, mision.disponible, mision.planetaId];
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}

export async function removeMision(id){
    const solicitud = "DELETE FROM Misiones WHERE id=$1";
    const res = await db.query(solicitud, [id]);
    return res.rowCount == 1;
}

export async function updateMision(mision){
    const solicitud = "Update Misiones SET nombre=$2, descripcion=$3, relevancia=$4, porcentaje=$5, disponible=$6, planetaId=$7 WHERE id=$1";
    const valores = [mision.id, mision.nombre, mision.descripcion, mision.relevancia, mision.porcentaje, mision.disponible, mision.planetaId];
    const res = await db.query(solicitud, valores);
    return res.rowCount == 1;
}