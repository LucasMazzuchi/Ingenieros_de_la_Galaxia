import * as constantes from "../constantes.js";
import * as viaje from "../crear_viaje/solicitudes_crear_viaje.js";

/**
 * Puebla el desplegable de puntos de interés filtrando según el planeta seleccionado.
 * 
 * selectPunto - Elemento <select> donde se renderizarán las opciones.
 * puntosInteres - Lista completa de puntos de interés.
 * planetaId - ID del planeta seleccionado para aplicar el filtro.
 */
export function actualizarPuntosInteres (selectPunto, puntosInteres, planetaId) {
    selectPunto.innerHTML = '<option value="">-- Crear nuevo --</option>';

    // Filtra los puntos de interés por el planeta elegido (si no se especifica, conserva todos)
    const puntosInteresFiltrados = !planetaId ? puntosInteres : puntosInteres.filter(function (puntoInteres) {
        return puntoInteres.cuerpo_celeste_id == planetaId;
    });

    // Inserta cada punto de interés como una opción dentro del desplegable
    puntosInteresFiltrados.forEach(puntoInteres => {
        const opcion = document.createElement("option");
        opcion.value = puntoInteres.id;
        opcion.textContent = puntoInteres.nombre;
        selectPunto.appendChild(opcion);
    });
};

/**
 * Genera las opciones de posiciones disponibles (1 a 3) para un punto de interés en un planeta,
 * omitiendo aquellas posiciones que ya estén asignadas a otros puntos.
 * 
 * selectPosicion - Elemento <select> para seleccionar la posición.
 * planetaId - ID del planeta actual.
 * puntoInteresId - ID del punto de interés actual (permite ignorar su propia posición al editar).
 * puntosInteres - Lista completa de puntos de interés.
 */
export function actualizarPosiciones(selectPosicion, planetaId, puntoInteresId, puntosInteres) {
    selectPosicion.innerHTML = '<option value="">-- Seleccione posición --</option>';

    // Identifica las posiciones ya ocupadas dentro del planeta actual
    const puntosInteresDelPlaneta = new Set(puntosInteres.filter(function (puntoInteres) {
        return (puntoInteres.cuerpo_celeste_id === planetaId && puntoInteres.id !== puntoInteresId);
    }).map(function (puntoInteres) { return parseInt(puntoInteres.posicion); })); 

    // Renderiza únicamente las posiciones desocupadas dentro del rango permitido (1 a 3)
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
 * Carga la información de un punto de interés seleccionado en los campos del formulario
 * y destaca su imagen correspondiente en la galería visual.
 * 
 * selectPunto - Elemento <select> con el ID del punto elegido.
 * formPunto - Formulario HTML que contiene los inputs a completar.
 * obtenerDatos - Función auxiliar de solicitud de datos.
 */
export async function cargarPuntoDeInteres(selectPunto, formPunto, obtenerDatos) {
    const id = selectPunto.value;
    const imagenes = document.getElementById("galeriaPuntos").querySelectorAll("img"); 

    // Si no hay punto seleccionado ("-- Crear nuevo --"), limpia el formulario y la galería
    if (!id) {
        formPunto.reset();
        imagenes.forEach(imagen => imagen.classList.remove("seleccionada"));
        return;
    }

    // Remueve las marcas de selección previas en las imágenes
    imagenes.forEach(imagen => imagen.classList.remove("seleccionada"));

    // Obtiene los puntos de interés desde la API para encontrar el registro seleccionado
    const puntosInteres = await viaje.obtenerDatos(constantes.PUNTOS_URL); 
    const puntoInteres = puntosInteres.find(item => item.id == id);

    // Mapea los valores del objeto a los campos del formulario
    if (puntoInteres) {
        document.getElementById("selectPlanetaPunto").value = puntoInteres.cuerpo_celeste_id;
        document.getElementById("inputTituloPunto").value = puntoInteres.nombre;
        document.getElementById("inputDescripcionPunto").value = puntoInteres.descripcion;
        document.getElementById("inputPosicionPunto").value = puntoInteres.posicion;
        document.getElementById("inputImagenPunto").value = puntoInteres.imagen;

        // Activa la clase visual en la imagen de la galería (índice base 0)
        imagenes[parseInt(puntoInteres.imagen) - 1].classList.add("seleccionada");
    }
}

/**
 * Registra un nuevo punto de interés o actualiza uno existente.
 * Valida que la posición seleccionada no esté previamente ocupada.
 * 
 * selectPunto - Elemento <select> para determinar si es alta o modificación.
 * formPunto - Formulario a reiniciar tras el guardado.
 * inicializarSelects - Callback asíncrono para actualizar los desplegables de la vista.
 * returns - Objeto con el resultado para mostrar en la notificación.
 */
export async function agregarPuntoDeInteres(selectPunto, formPunto, inicializarSelects) {
    const id = selectPunto.value;
    if (!document.getElementById("selectPlanetaPunto").value){
      return {titulo: "Operación Fallida", textoEstado: "Selecciona un planeta para poder guardar el punto."};
    }
    const resPuntosInteres = await fetch(`${constantes.API_URL}/${constantes.PUNTOS_URL}?cuerpo_celeste_id=${parseInt(document.getElementById("selectPlanetaPunto").value)}`);
    const puntosInteres = await resPuntosInteres.json();
    const punto = parseInt(document.getElementById("inputPosicionPunto").value);

    // Estructura el objeto con los datos recolectados del formulario
    const datos = {
        cuerpo_celeste_id: parseInt(document.getElementById("selectPlanetaPunto").value),
        nombre: document.getElementById("inputTituloPunto").value,
        descripcion: document.getElementById("inputDescripcionPunto").value,
        posicion: parseInt(document.getElementById("inputPosicionPunto").value),
        imagen: parseInt(document.getElementById("inputImagenPunto").value)
    };

    let exito = false;

    // Ejecuta la modificación si hay ID, o la creación validando solapamiento de posición
    if (id) {
        exito = await viaje.modificarRegistro(constantes.PUNTOS_URL, id, datos);
    } else {
        const puntoOcupado = puntosInteres.find(function (puntoInteres){ return puntoInteres.posicion === punto; });
        if (puntoOcupado) {
            return { 
                titulo: "Operación Fallida", 
                textoEstado: "Ocurrió un error al guardar el punto de interés, ya existe un punto de interés en esta posición." 
            };
        }
        exito = await viaje.crearRegistro(constantes.PUNTOS_URL, datos);
    }

    // Si el guardado fue exitoso, limpia formulario, galerías y actualiza desplegables
    if (exito) {
        formPunto.reset();
        await inicializarSelects();
        const imagenes = document.getElementById("galeriaPuntos").querySelectorAll("img");
        imagenes.forEach(imagen => imagen.classList.remove("seleccionada"));

        const texto = id ? "¡Punto de interés modificado con éxito!" : "¡Punto de interés guardado con éxito!";
        return { titulo: "¡Operación Exitosa!", textoEstado: texto };
    } else {
        return { titulo: "Operación Fallida", textoEstado: "Ocurrió un error al guardar el punto de interés." };
    }
}

/**
 * Elimina el punto de interés seleccionado de la base de datos.
 * 
 * selectPunto - Elemento <select> que contiene el ID del punto a eliminar.
 * formPunto - Formulario a reiniciar tras la eliminación.
 * inicializarSelects - Callback asíncrono para recargar los desplegables.
 * returns - Objeto con el resultado para mostrar en la notificación.
 */
export async function borrarPuntoDeInteres(selectPunto, formPunto, inicializarSelects) {
    const id = selectPunto.value;

    // Comprueba que exista un elemento seleccionado antes de proceder
    if (!id) {
        return { titulo: "Operación Fallida", textoEstado: "Seleccioná un punto de interés existente para borrar." };
    }

    const exito = await viaje.eliminarRegistro(constantes.PUNTOS_URL, id);

    // Si la eliminación fue exitosa, reinicia los controles de la interfaz
    if (exito) {
        formPunto.reset();
        await inicializarSelects();
        const imagenes = document.getElementById("galeriaPuntos").querySelectorAll("img");
        imagenes.forEach(imagen => imagen.classList.remove("seleccionada"));

        return { titulo: "¡Operación Exitosa!", textoEstado: "Punto de interés eliminado." };
    } else {
        return { titulo: "Operación Fallida", textoEstado: "No se pudo eliminar el punto de interés." };
    }
}