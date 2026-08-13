import * as constantes from "../constantes.js";
import * as viaje from "../crear_viaje/solicitudes_crear_viaje.js";

/**
 * Pobla el desplegable de puntos de interés filtrando por el planeta seleccionado.
 * 
 * selectPunto: Elemento <select> donde se cargarán los puntos de interés.
 * puntosInteres: Lista completa de puntos de interés disponibles.
 * planetaId: ID del planeta seleccionado para aplicar el filtro.
 */
export function actualizarPuntosInteres (selectPunto, puntosInteres, planetaId) {
    // Reinicia las opciones del select con la opción por defecto para crear uno nuevo
    selectPunto.innerHTML = '<option value="">-- Crear nuevo --</option>';

    // Si no hay planetaId seleccionado, incluye todos los puntos; de lo contrario, filtra por el ID del planeta
    const puntosInteresFiltrados = !planetaId ? puntosInteres : puntosInteres.filter(function (puntoInteres) {
        return puntoInteres.cuerpo_celeste_id == planetaId;
    });

    // Agrega cada punto de interés como una opción dentro del selector
    puntosInteresFiltrados.forEach(puntoInteres => {
        const opcion = document.createElement("option");
        opcion.value = puntoInteres.id;
        opcion.textContent = puntoInteres.nombre;
        selectPunto.appendChild(opcion);
    });
};

/**
 * Genera y actualiza las posiciones disponibles (1 a 3) para un punto de interés en un planeta,
 * excluyendo aquellas posiciones que ya estén ocupadas por otros puntos.
 * 
 * selectPosicion: Elemento <select> para las posiciones.
 * planetaId: ID del planeta actual.
 * puntoInteresId: ID del punto de interés actual (para omitirse a sí mismo en edición).
 * puntosInteres: Lista completa de puntos de interés para validar ocupación.
 */
export function actualizarPosiciones(selectPosicion, planetaId, puntoInteresId, puntosInteres) {
    selectPosicion.innerHTML = '<option value="">-- Seleccione posición --</option>';

    // Crea un Set con las posiciones ocupadas en el planeta (excluyendo el punto en edición)
    const puntosInteresDelPlaneta = new Set(puntosInteres.filter(function (puntoInteres) {
        return (puntoInteres.cuerpo_celeste_id === planetaId && puntoInteres.id !== puntoInteresId);
    }).map(function (puntoInteres) { return parseInt(puntoInteres.posicion); })); 

    // Solo se permiten posiciones del 1 al 3
    for (let i = 1; i <= 3; i++) { 
        if (!puntosInteresDelPlaneta.has(i)) {
            const opcion = document.createElement("option");
            opcion.value = i;
            opcion.textContent = `${i}`;
            selectPosicion.appendChild(opcion);
        }
    }
};

/**
 * Carga la información del punto de interés seleccionado en los campos del formulario.
 * Si no hay selección, reinicia los campos del formulario.
 * 
 * selectPunto: Elemento <select> con el punto de interés seleccionado.
 * formPunto: Formulario a completar o reiniciar.
 * obtenerDatos: Función auxiliar para obtener datos de la API/Servidor.
 */
export async function cargarPuntoDeInteres(selectPunto, formPunto, obtenerDatos) {
  const id = selectPunto.value;

  // Si no se seleccionó un ID (ej: "-- Crear nuevo --"), se resetea el formulario
  if (!id) {
    formPunto.reset();
    return;
  }

  // Obtiene los datos del servidor y busca el punto correspondiente
  const puntosInteres = await viaje.obtenerDatos(constantes.PUNTOS_URL); 
  const puntoInteres = puntosInteres.find(item => item.id == id);

  // Asigna los valores a los inputs del formulario
  if (puntoInteres) {
    document.getElementById("selectPlanetaPunto").value = puntoInteres.cuerpo_celeste_id;
    document.getElementById("inputTituloPunto").value = puntoInteres.nombre;
    document.getElementById("inputDescripcionPunto").value = puntoInteres.descripcion;
    document.getElementById("inputPosicionPunto").value = puntoInteres.posicion;
    document.getElementById("inputImagenPunto").value = puntoInteres.imagen;
  }
}

/**
 * Guarda o modifica un punto de interés en la base de datos previa validación de posición.
 * 
 * selectPunto: Elemento <select> para identificar si es alta o edición.
 * modificarRegistro: Función para modificar registro existente.
 * crearRegistro: Función para crear un nuevo registro.
 * inicializarSelects: Callback para refrescar los selectores de la pantalla.
 */
export async function agregarPuntoDeInteres(selectPunto, modificarRegistro, crearRegistro, inicializarSelects) {
      const id = selectPunto.value;

      // Obtiene los puntos de interés existentes para el planeta seleccionado
      const resPuntosInteres = await fetch(`${constantes.API_URL}/${constantes.PUNTOS_URL}?cuerpo_celeste_id=${parseInt(document.getElementById("selectPlanetaPunto").value)}`);
      const puntosInteres = await resPuntosInteres.json();
      
      const punto = parseInt(document.getElementById("inputPosicionPunto").value);

      // Prepara el objeto de datos a partir de los inputs de la interfaz
      const datos = {
        cuerpo_celeste_id: parseInt(document.getElementById("selectPlanetaPunto").value),
        nombre: document.getElementById("inputTituloPunto").value,
        descripcion: document.getElementById("inputDescripcionPunto").value,
        posicion: parseInt(document.getElementById("inputPosicionPunto").value),
        imagen: parseInt(document.getElementById("inputImagenPunto").value)
      };

      let exito = false;

      // Si hay un ID seleccionado, modifica el registro existente
      if (id) {
        exito = await viaje.modificarRegistro(constantes.PUNTOS_URL, id, datos);
      } else {
        // En creación nueva, valida que la posición no esté ya ocupada
        const puntoOcupado = puntosInteres.find(function (puntoInteres){ return puntoInteres.posicion === punto; });
        if (puntoOcupado){
          alert("Ocurrió un error al guardar el punto de interés, ya existe un punto de interés en esta posición.");
          return;
        }
        exito = await viaje.crearRegistro(constantes.PUNTOS_URL, datos);
      }
    
      // Muestra resultado y reinicia la interfaz si fue exitoso
      if (exito) {
        alert("¡Punto de interés guardado con éxito!");
        formPunto.reset();
        inicializarSelects();
      } else {
        alert("Ocurrió un error al guardar el punto de interés.");
      }
}

/**
 * Elimina un punto de interés seleccionado tras solicitar confirmación al usuario.
 * 
 * selectPunto: Elemento <select> con la opción elegida para eliminar.
 * formPunto: Formulario a reiniciar tras la eliminación.
 * inicializarSelects: Callback para actualizar los desplegables de la pantalla.
 */
export async function borrarPuntoDeInteres(selectPunto, formPunto, inicializarSelects) {
  const id = selectPunto.value;

  // Valida que se haya seleccionado un punto existente
  if (!id) {
    alert("Selecciona un punto de interés existente para borrar.");
    return;
  }

  // Pide confirmación antes de proceder con el borrado
  if (confirm("¿Estás seguro de borrar este punto de interés?")) {
    const exito = await viaje.eliminarRegistro(constantes.PUNTOS_URL, id);
    if (exito) {
      alert("Punto de interés eliminado.");
      formPunto.reset();
      inicializarSelects();
    } else {
      alert("No se pudo eliminar el punto de interés.");
    }
  }
}