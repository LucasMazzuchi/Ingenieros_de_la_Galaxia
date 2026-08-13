import * as constantes from "../constantes.js";
import * as viaje from "../crear_viaje/solicitudes_crear_viaje.js";

export function actualizarPuntosInteres (selectPunto, puntosInteres, planetaId) {
    selectPunto.innerHTML = '<option value="">-- Crear nuevo --</option>';
    const puntosInteresFiltrados = !planetaId ? puntosInteres : puntosInteres.filter(function (puntoInteres) {
        return puntoInteres.cuerpo_celeste_id == planetaId;
    });
    puntosInteresFiltrados.forEach(puntoInteres => {
        const opcion = document.createElement("option");
        opcion.value = puntoInteres.id;
        opcion.textContent = puntoInteres.nombre;
        selectPunto.appendChild(opcion);
    });
};

export function actualizarPosiciones(selectPosicion, planetaId, puntoInteresId, puntosInteres) {
    selectPosicion.innerHTML = '<option value="">-- Seleccione posición --</option>';
    const puntosInteresDelPlaneta = new Set(puntosInteres.filter(function (puntoInteres) {
        return (puntoInteres.cuerpo_celeste_id === planetaId && puntoInteres.id !== puntoInteresId);
    }).map(function (puntoInteres) { return parseInt(puntoInteres.posicion); })); 
    for (let i = 1; i <= 3; i++) { 
        if (!puntosInteresDelPlaneta.has(i)) {
            const opcion = document.createElement("option");
            opcion.value = i;
            opcion.textContent = `${i}`;
            selectPosicion.appendChild(opcion);
        }
    }
};

export async function cargarPuntoDeInteres(selectPunto, formPunto, obtenerDatos) {
    const id = selectPunto.value;
    const imagenes = document.getElementById("galeriaPuntos").querySelectorAll("img"); 
    if (!id) {
        formPunto.reset();
        imagenes.forEach(imagen => imagen.classList.remove("seleccionada"));
        return;
    }
    imagenes.forEach(imagen => imagen.classList.remove("seleccionada"));
    const puntosInteres = await viaje.obtenerDatos(constantes.PUNTOS_URL); 
    const puntoInteres = puntosInteres.find(item => item.id == id);
    if (puntoInteres) {
        document.getElementById("selectPlanetaPunto").value = puntoInteres.cuerpo_celeste_id;
        document.getElementById("inputTituloPunto").value = puntoInteres.nombre;
        document.getElementById("inputDescripcionPunto").value = puntoInteres.descripcion;
        document.getElementById("inputPosicionPunto").value = puntoInteres.posicion;
        document.getElementById("inputImagenPunto").value = puntoInteres.imagen;
        imagenes[parseInt(puntoInteres.imagen) - 1].classList.add("seleccionada");
    }
}

export async function agregarPuntoDeInteres(selectPunto, formPunto, inicializarSelects) {
    const id = selectPunto.value;
    if (!document.getElementById("selectPlanetaPunto").value){
      return {titulo: "Operación Fallida", textoEstado: "Selecciona un planeta para poder guardar el punto."};
    }
    const resPuntosInteres = await fetch(`${constantes.API_URL}/${constantes.PUNTOS_URL}?cuerpo_celeste_id=${parseInt(document.getElementById("selectPlanetaPunto").value)}`);
    const puntosInteres = await resPuntosInteres.json();
    const punto = parseInt(document.getElementById("inputPosicionPunto").value);
    const datos = {
        cuerpo_celeste_id: parseInt(document.getElementById("selectPlanetaPunto").value),
        nombre: document.getElementById("inputTituloPunto").value,
        descripcion: document.getElementById("inputDescripcionPunto").value,
        posicion: parseInt(document.getElementById("inputPosicionPunto").value),
        imagen: parseInt(document.getElementById("inputImagenPunto").value)
    };

    let exito = false;
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

export async function borrarPuntoDeInteres(selectPunto, formPunto, inicializarSelects) {
    const id = selectPunto.value;
    if (!id) {
        return { titulo: "Operación Fallida", textoEstado: "Seleccioná un punto de interés existente para borrar." };
    }

    const exito = await viaje.eliminarRegistro(constantes.PUNTOS_URL, id);
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