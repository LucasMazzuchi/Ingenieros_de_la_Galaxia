import * as constantes from "../constantes.js";
import * as viaje from "../crear_viaje/solicitudes_crear_viaje.js";

/**
 * Actualiza el desplegable de posiciones disponibles (1 a 9) para crear o modificar un planeta.
 * Filtra y omite aquellas posiciones que ya se encuentran ocupadas por otros cuerpos celestes.
 */
export async function actualizarPosicionesPlanetas() {
  const selectPosicion = document.getElementById("inputPosicion");
  if (!selectPosicion) return;

  // Consulta la lista de planetas registrados desde la API
  const planetas = await viaje.obtenerDatos("cuerpos_celestes"); // Cambiar por constante si corresponde
  const planetaIdSeleccionado = document.getElementById("selectPlaneta").value;

  selectPosicion.innerHTML = '<option value="">-- Seleccione posición --</option>';

  // Filtra las posiciones ocupadas por otros planetas (excluye el que se está editando actualmente)
  const posicionesOcupadas = new Set(
    planetas
      .filter(planeta => planeta.id != planetaIdSeleccionado && planeta.posicion)
      .map(planeta => parseInt(planeta.posicion))
  );

  const MAX_POSICIONES = 9;  

  // Genera únicamente las posiciones libres en el rango del 1 al 9
  for (let i = 1; i <= MAX_POSICIONES; i++) {
    if (!posicionesOcupadas.has(i)) {
      const opcion = document.createElement("option");
      opcion.value = i;
      opcion.textContent = `${i}`;
      selectPosicion.appendChild(opcion);
    }
  }
}

/**
 * Carga los datos del planeta seleccionado en los campos del formulario y resalta sus imágenes en las galerías.
 * Si no se pasa un ID válido, se reinicia el formulario y se desmarcan las imágenes.
 * 
 * selectPlaneta - Elemento <select> con la lista de planetas.
 * formPlaneta - Formulario HTML que contiene los campos del planeta.
 * 
 */
export async function cargarPlanetas(selectPlaneta, formPlaneta) {
    const id = selectPlaneta.value;
    const imagenesPlanetas = document.getElementById("galeriaPlanetas").querySelectorAll("img");
    const imagenesPlanetasFondo = document.getElementById("galeriaFondoPlaneta").querySelectorAll("img");
    
    // Actualiza el listado de posiciones libres en el selector
    await actualizarPosicionesPlanetas();

    // Limpia la selección visual de las galerías
    imagenesPlanetas.forEach(imagen => imagen.classList.remove("seleccionada"));
    imagenesPlanetasFondo.forEach(imagen => imagen.classList.remove("seleccionada"));

    // Si es la opción vacía ("-- Crear nuevo --"), reinicia el formulario
    if (!id) {
        formPlaneta.reset();
        return;
    }

    // Obtiene los datos del planeta elegido
    const planetas = await viaje.obtenerDatos("cuerpos_celestes");
    const planeta = planetas.find(item => item.id == id);

    // Mapea y completa los campos del formulario con la información del planeta
    if (planeta) { 
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

        // Resalta visualmente las imágenes seleccionadas en las galerías (índice base 0)
        imagenesPlanetas[parseInt(planeta.imagen) - 1].classList.add("seleccionada");
        imagenesPlanetasFondo[parseInt(planeta.imagen_fondo) - 1].classList.add("seleccionada");
    }
};

/**
 * Registra un nuevo cuerpo celeste o modifica uno existente.
 * Tras completar la operación, limpia los inputs, desmarca las galerías y refresca los selectores.
 * 
 * inicializarSelects - Callback asíncrono para recargar los desplegables.
 * selectPlaneta - Elemento <select> para verificar si es alta o modificación.
 * formPlaneta - Formulario HTML que se reiniciará en caso de éxito.
 * returns - Objeto con la información del resultado para la notificación.
 */
export async function agregaPlaneta(inicializarSelects, selectPlaneta, formPlaneta) {
  const id = selectPlaneta.value;

  // Modela el objeto con los datos extraídos del formulario
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

  // Decide si realiza una actualización (PUT/PATCH) o creación (POST)
  if (id) {
    exito = await viaje.modificarRegistro("cuerpos_celestes", id, datos);
  } else {
    exito = await viaje.crearRegistro("cuerpos_celestes", datos);
  }

  // Si la petición fue exitosa, reinicia estado, galerías y actualización de selects
  if (exito) {
    formPlaneta.reset();
    inicializarSelects();
    const imagenesPlanetas = document.getElementById("galeriaPlanetas").querySelectorAll("img");
    const imagenesPlanetasFondo = document.getElementById("galeriaFondoPlaneta").querySelectorAll("img");
    imagenesPlanetas.forEach(imagen => imagen.classList.remove("seleccionada"));
    imagenesPlanetasFondo.forEach(imagen => imagen.classList.remove("seleccionada"));
    
    const texto = id ? "¡Cuerpo celeste modificado con éxito!" : "¡Cuerpo celeste guardado con éxito!";
    return { titulo: "¡Operación Exitosa!", textoEstado: texto };
  } else {
    return { titulo: "Operación Fallida", textoEstado: "Ocurrió un error al guardar el planeta." };
  }
}

/**
 * Elimina el planeta seleccionado de la base de datos.
 * 
 * inicializarSelects - Callback asíncrono para recargar los desplegables.
 * selectPlaneta - Elemento <select> que contiene el ID del planeta a eliminar.
 * formPlaneta - Formulario HTML que se reiniciará en caso de éxito.
 * returns - Objeto con la información del resultado para la notificación.
 */
export async function borrarPlaneta (inicializarSelects, selectPlaneta, formPlaneta) {
  const id = selectPlaneta.value;

  // Valida que se haya seleccionado un planeta
  if (!id) {
    return { titulo: "Operación Fallida", textoEstado: "Seleccioná un planeta existente para borrar." };
  }

  const exito = await viaje.eliminarRegistro("cuerpos_celestes", id);

  // Si se eliminó correctamente, limpia los campos y desmarca la interfaz
  if (exito) {
    formPlaneta.reset();
    inicializarSelects();
    const imagenesPlanetas = document.getElementById("galeriaPlanetas").querySelectorAll("img");
    const imagenesPlanetasFondo = document.getElementById("galeriaFondoPlaneta").querySelectorAll("img");
    imagenesPlanetas.forEach(imagen => imagen.classList.remove("seleccionada"));
    imagenesPlanetasFondo.forEach(imagen => imagen.classList.remove("seleccionada"));

    return { titulo: "¡Operación Exitosa!", textoEstado: "Planeta eliminado." };
  } else {
    return { titulo: "Operación Fallida", textoEstado: "No se pudo eliminar." };
  }
}