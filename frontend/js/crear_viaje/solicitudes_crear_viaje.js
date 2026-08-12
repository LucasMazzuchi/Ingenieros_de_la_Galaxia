// Hace un fetch para obtener los datos de la URL pasada por recurso y lo devuelve, si ocurre
// un error devuelve un arreglo vacío.
import * as constantes from "../constantes.js";
export async function obtenerDatos(recurso) {
  try {
    const res = await fetch(`${constantes.API_URL}/${recurso}`);
    if (!res.ok) throw new Error(`Error al obtener ${recurso}`);
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Hace un fetch para crear una entidad con lo que contiene datos usando como URL recurso y
// devuelve un booleano indicando si la creación fue exitosa.
export async function crearRegistro(recurso, datos) {
  try {
    const res = await fetch(`${constantes.API_URL}/${recurso}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    return res.ok;
  } catch (error) {
    console.error("Error grave en el Fetch:", error);
    return false;
  }
}

// Hace un fetch para modificar la entidad asociada al id con lo que contiene datos usando
// como URL recurso y devuelve un booleano indicando si la creación fue exitosa.
export async function modificarRegistro(recurso, id, datos) {
  try {
    const res = await fetch(`${constantes.API_URL}/${recurso}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    return res.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Hace un fetch para eliminar la entidad asociada a id usando como URL recurso y
// devuelve un booleano indicando si la creación fue exitosa.
export async function eliminarRegistro(recurso, id) {
  try {
    const res = await fetch(`${constantes.API_URL}/${recurso}/${id}`, {
      method: "DELETE"
    });
    return res.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}
