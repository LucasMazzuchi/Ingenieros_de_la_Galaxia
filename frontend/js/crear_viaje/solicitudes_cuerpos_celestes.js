import * as constantes from "../constantes.js";
import * as viaje from "../crear_viaje/solicitudes_crear_viaje.js";
// La función arma el desplegable de las posiciones disponibles para crear o modificar un planeta.
// Hace un fetch para obtener los datos de la URL pasada por recurso y lo devuelve, si ocurre
// un error devuelve un arreglo vacío.

export async function actualizarPosicionesPlanetas() {
  const selectPosicion = document.getElementById("inputPosicion");
  if (!selectPosicion) return;

  // Obtenemos los planetas actuales
  const planetas = await viaje.obtenerDatos("cuerpos_celestes"); // Cambiar por cte
  const planetaIdSeleccionado = document.getElementById("selectPlaneta").value;

  selectPosicion.innerHTML = '<option value="">-- Seleccione posición --</option>';

  // Filtramos las posiciones ocupadas por otros planetas y las volvemos un entero.
  const posicionesOcupadas = new Set(
    planetas
      .filter(planeta => planeta.id != planetaIdSeleccionado && planeta.posicion)
      .map(planeta => parseInt(planeta.posicion))
  );

  const MAX_POSICIONES = 9;  

  for (let i = 1; i <= MAX_POSICIONES; i++) {
    if (!posicionesOcupadas.has(i)) {
      const opcion = document.createElement("option");
      opcion.value = i;
      opcion.textContent = `${i}`;
      selectPosicion.appendChild(opcion);
    }
  }
}

export async function cargarPlanetas(selectPlaneta, formPlaneta) {
    const id = selectPlaneta.value;
    await actualizarPosicionesPlanetas();
    if (!id) {
        formPlaneta.reset();
        return;
    }
    const planetas = await viaje.obtenerDatos("cuerpos_celestes");
    const planeta = planetas.find(item => item.id == id);
    if (planeta) { // Inicializa los valores actuales de planeta
        document.getElementById("inputNombre").value = planeta.nombre;
        document.getElementById("inputDescripcion").value = planeta.descripcion;
        document.getElementById("inputTipo").value = planeta.tipo;
        document.getElementById("inputDiametro").value = planeta.diametro;
        document.getElementById("inputGravedad").value = planeta.gravedad;
        document.getElementById("inputTemperatura").value = planeta.temperatura;
        document.getElementById("inputTerreno").value = planeta.terreno;
        document.getElementById("inputHabitable").value = planeta.habitable.toString();
        document.getElementById("inputPosicion").value = planeta.posicion;
        document.getElementById("inputImagen").value = planeta.imagen;
        document.getElementById("inputImagenFondo").value = planeta.imagen_fondo;
    }
  } 
export async function agregaPlaneta(inicializarSelects, selectPlaneta, formPlaneta) {
    
  const id = selectPlaneta.value;
  const datos = {
    nombre: document.getElementById("inputNombre").value,
    descripcion: document.getElementById("inputDescripcion").value,
    tipo: parseInt(document.getElementById("inputTipo").value),
    diametro: parseInt(document.getElementById("inputDiametro").value),
    gravedad: parseFloat(document.getElementById("inputGravedad").value),
    temperatura: parseInt(document.getElementById("inputTemperatura").value),
    terreno: parseInt(document.getElementById("inputTerreno").value),
    habitable: document.getElementById("inputHabitable").value === "true",
    posicion: parseInt(document.getElementById("inputPosicion").value),
    imagen: parseInt(document.getElementById("inputImagen").value),
    imagen_fondo: parseInt(document.getElementById("inputImagenFondo").value)
  };
    
  let exito = false;
  if (id) {
    exito = await viaje.modificarRegistro("cuerpos_celestes", id, datos);
  } else {
    exito = await crearRegistro("cuerpos_celestes", datos);
  }

  if (exito) {
    alert("¡Guardado exitoso!");
    formPlaneta.reset();
    inicializarSelects();
  } else {
    alert("Ocurrió un error al guardar.");
  }
}
  export async function borrarPlaneta (inicializarSelects, selectPlaneta, formPlaneta) {
    const id = selectPlaneta.value;
      if (!id) {
        alert("Selecciona un planeta existente para borrar.");
        return;
      }
      if (confirm("¿Estás seguro de borrar este planeta?")) {
    
        const exito = await viaje.eliminarRegistro("cuerpos_celestes", id);
        if (exito) {
          alert("Planeta eliminado.");
          formPlaneta.reset();
          inicializarSelects();// Tiene que ser pasada por parámetro y ejecutada o tiene que devolver un flag tipo ok
        } else {
          alert("No se pudo eliminar.");
        }
      }
  }