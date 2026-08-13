import * as constantes from "../constantes.js";
import * as viaje from "../crear_viaje/solicitudes_crear_viaje.js";

/**
 * Genera y actualiza las opciones del desplegable de posiciones disponibles (1 a MAX_POSICIONES)
 * para la creación o modificación de un planeta, excluyendo las posiciones ocupadas por otros planetas.
 */
export async function actualizarPosicionesPlanetas() {
  const selectPosicion = document.getElementById("inputPosicion");
  if (!selectPosicion) return;

  // Obtiene los planetas registrados y el ID del planeta actualmente seleccionado
  const planetas = await viaje.obtenerDatos("cuerpos_celestes"); // Cambiar por cte
  const planetaIdSeleccionado = document.getElementById("selectPlaneta").value;

  // Reinicia las opciones del desplegable con la opción por defecto
  selectPosicion.innerHTML = '<option value="">-- Seleccione posición --</option>';

  // Filtra las posiciones ocupadas por otros planetas (excluyendo la del planeta seleccionado)
  const posicionesOcupadas = new Set(
    planetas
      .filter(planeta => planeta.id != planetaIdSeleccionado && planeta.posicion)
      .map(planeta => parseInt(planeta.posicion))
  );

  const MAX_POSICIONES = 9;  

  // Puebla el select únicamente con las posiciones numéricas libres
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
 * Carga los datos del planeta seleccionado en los campos del formulario.
 * Si no hay un ID seleccionado (opción vacía), limpia los campos del formulario.
 * 
 * selectPlaneta: Elemento <select> con los planetas registrados.
 * formPlaneta: Formulario HTML que contiene los inputs del planeta.
 */
export async function cargarPlanetas(selectPlaneta, formPlaneta) {
    const id = selectPlaneta.value;
    
    // Actualiza el listado de posiciones libres considerando el planeta seleccionado
    await actualizarPosicionesPlanetas();
    
    // Si no hay planeta seleccionado, limpia el formulario y finaliza
    if (!id) {
        formPlaneta.reset();
        return;
    }
    
    // Busca los datos del planeta seleccionado en la base de datos/API
    const planetas = await viaje.obtenerDatos("cuerpos_celestes");
    const planeta = planetas.find(item => item.id == id);
    
    // Completa cada input del formulario con los valores correspondientes
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
    }
} 

/**
 * Guarda un planeta en la base de datos (crea uno nuevo o modifica uno existente 
 * según si hay un ID seleccionado en el selector).
 * 
 * inicializarSelects: Callback para recargar los desplegables de la interfaz.
 * selectPlaneta: Elemento <select> para identificar si es alta o edición.
 * formPlaneta: Formulario con los datos a guardar.
 * returns: Mensaje de resultado para notificaciones.
 */
export async function agregaPlaneta(inicializarSelects, selectPlaneta, formPlaneta) {
  const id = selectPlaneta.value;
  
  // Recolecta y convierte los datos del formulario al tipo de dato esperado
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
  
  // Si existe ID actualiza el registro, de lo contrario crea uno nuevo
  if (id) {
    exito = await viaje.modificarRegistro("cuerpos_celestes", id, datos);
  } else {
    exito = await viaje.crearRegistro("cuerpos_celestes", datos);
  }

  // Si la operación fue exitosa limpia el formulario y refresca la UI
  if (exito) {
    formPlaneta.reset();
    inicializarSelects();
    const texto = id ? "¡Cuerpo celeste modificado con éxito!" : `¡Cuerpo celeste guardado con éxito!`;
    return { titulo: "¡Operación Exitosa!", textoEstado: texto };
  } else {
    return { titulo: "Operación Fallida", textoEstado: `Ocurrió un error al guardar el planeta.` };
  }
}

/**
 * Elimina de la base de datos el planeta actualmente seleccionado.
 * 
 * inicializarSelects: Callback para actualizar los selectores de la pantalla.
 * selectPlaneta: Elemento <select> que contiene el ID del planeta a borrar.
 * formPlaneta: Formulario a reiniciar tras borrar.
 * returns:  Mensaje de resultado para notificaciones.
 */
export async function borrarPlaneta (inicializarSelects, selectPlaneta, formPlaneta) {
    const id = selectPlaneta.value;
    
    // Valida que haya un planeta seleccionado antes de intentar borrar
    if (!id) {
      return { titulo: "Operación Fallida", textoEstado: "Seleccioná un planeta existente para borrar." };
    }
    
    const exito = await viaje.eliminarRegistro("cuerpos_celestes", id);
    
    if (exito) {
      formPlaneta.reset();
      inicializarSelects();
      return { titulo: "¡Operación Exitosa!", textoEstado: "Planeta eliminado." };
    } else {
      return { titulo: "Operación Fallida", textoEstado: "No se pudo eliminar." };
    }
}