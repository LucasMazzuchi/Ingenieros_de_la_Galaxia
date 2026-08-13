import * as constantes from "../constantes.js";
import {mostrarNotificacion} from "../notificaciones.js";
import * as viaje from "./solicitudes_crear_viaje.js";
import * as planetas from "./solicitudes_cuerpos_celestes.js";
import * as puntosDeInteres from "./solicitudes_punto_de_interes.js";
import * as vehiculos from "./solicitudes_vehiculos.js";
// Listas de imágenes de los planetas por fuera
const imagenesPlanetas = [
  "../assets/img/agujero_negro.png",
  "../assets/img/luna.png",
  "../assets/img/marte.png",
  "../assets/img/mercurio.png",
  "../assets/img/neptuno.png",
  "../assets/img/planeta_verde.png",
  "../assets/img/planeta_violata.png",
  "../assets/img/saturno.png",
  "../assets/img/sol.png",
  "../assets/img/tierra.png"
];

// Listas de imágenes de los planetas por dentro
const imagenesFondos = [
  "../assets/img/fondo-agujero_negro.jpg",
  "../assets/img/fondo-luna.jpg",
  "../assets/img/fondo-marte.jpg",
  "../assets/img/fondo-mercurio.jpg",
  "../assets/img/fondo-neptuno.jpg",
  "../assets/img/fondo-saturno.jpg",
  "../assets/img/fondo-sol.jpg",
  "../assets/img/fondo-tierra.jpg",
  "../assets/img/fondo-verde.jpg",
  "../assets/img/fondo-violeta.jpg"
];

// Listas de imágenes de los puntos de interés
const imagenesPuntos = [
  "../assets/img/marcador1.png",
  "../assets/img/marcador2.png",
  "../assets/img/marcador3.png",
  "../assets/img/marcador4.png",
  "../assets/img/marcador5.webp"
]


// Crea una galería clickeable dentro de un contenedor, y guarda la elegida en un input hidden
function crearSelectorImagenes(contenedorId, imagenes, inputIdimagen) {
  const contenedor = document.getElementById(contenedorId);
  const inputHidden = document.getElementById(inputIdimagen);
  contenedor.innerHTML = "";

  imagenes.forEach((url, index) => {
    const img = document.createElement("img");
    img.src = url;
    img.addEventListener("click", () => {
      contenedor.querySelectorAll("img").forEach(i => i.classList.remove("seleccionada"));
      img.classList.add("seleccionada");

      inputHidden.value = index + 1; 
    });
    contenedor.appendChild(img);
  });
}
// Galería del planeta: imagen del planeta e imagen de fondo
crearSelectorImagenes("galeriaPlanetas", imagenesPlanetas, "inputImagen");
crearSelectorImagenes("galeriaFondoPlaneta", imagenesFondos, "inputImagenFondo");

// Galería de los puntos de interés.
crearSelectorImagenes("galeriaPuntos", imagenesPuntos, "inputImagenPunto");

// Tabs: cambia entre Planeta / Punto de interés / Vehículo
const botonesTab = document.querySelectorAll(".tab-btn");
const seccionesTab = document.querySelectorAll(".seccion-tab");

// Cambia de color al botón seleccionado y desliza la pantalla hasta la sección indicada.
botonesTab.forEach(boton => {
  boton.addEventListener("click", () => {
    botonesTab.forEach(botonActual => botonActual.classList.remove("activo"));
    boton.classList.add("activo");

    const tabElegido = boton.dataset.tab; // "planeta" | "punto" | "vehiculo"
    seccionesTab.forEach(seccion => {
      const esVisible = seccion.id === `tab-${tabElegido}`;
      seccion.hidden = !esVisible;
      seccion.dataset.visible = esVisible ? "true" : "false";
      if (esVisible) seccion.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});

// LOGICA DE CONSULTA Y LLENADO DE SELECTS (Al cargar la página) 
async function inicializarSelects() {
  const planetas_lista = await viaje.obtenerDatos(constantes.CUERPOS_URL);
  await planetas.actualizarPosicionesPlanetas();
  const selectPlaneta = document.getElementById("selectPlaneta");
  const selectPlanetaPunto = document.getElementById("selectPlanetaPunto"); // El que esta en la sección puntos de interés
  // Limpiar y poblar selects de planetas
  [selectPlaneta, selectPlanetaPunto].forEach(selectActual => {
    if (!selectActual) return;
    if (selectActual === selectPlaneta) {
      selectActual.innerHTML = '<option value="">-- Crear nuevo --</option>';
    } else {
      selectActual.innerHTML = '<option value="">-- Seleccione un planeta --</option>';
    }

    planetas_lista.forEach(planeta => {
      if (planeta.nombre.toLowerCase().includes("tierra")) {
        return; 
      }
      const opcion = document.createElement("option");
      opcion.value = planeta.id;
      opcion.textContent = planeta.nombre;
      selectActual.appendChild(opcion);
    });
  });

  // Cargar vehículos existentes en su select
  const vehiculos = await viaje.obtenerDatos(constantes.VEHICULOS_URL);
  const selectVehiculo = document.getElementById("selectVehiculo");
  if (selectVehiculo) {
    selectVehiculo.innerHTML = '<option value="">-- Crear nuevo --</option>';
    vehiculos.forEach(vehiculo => {
      const opcion = document.createElement("option");
      opcion.value = vehiculo.id;
      opcion.textContent = vehiculo.nombre;
      selectVehiculo.appendChild(opcion);
    });
  }

  // Cargar puntos de interés existentes en su select
  const puntosInteres = await viaje.obtenerDatos(constantes.PUNTOS_URL);
  const selectPunto = document.getElementById("selectPunto");
  
  if (selectPunto && selectPlanetaPunto) {
    puntosDeInteres.actualizarPuntosInteres(selectPunto, puntosInteres, parseInt(selectPlanetaPunto.value));
    puntosDeInteres.actualizarPosiciones(document.getElementById("inputPosicionPunto"), parseInt(selectPlanetaPunto.value), parseInt(selectPunto.value), puntosInteres);
    selectPlanetaPunto.addEventListener("change", function () {
      puntosDeInteres.actualizarPuntosInteres(selectPunto, puntosInteres, parseInt(selectPlanetaPunto.value));
      puntosDeInteres.actualizarPosiciones(document.getElementById("inputPosicionPunto"), parseInt(selectPlanetaPunto.value), parseInt(selectPunto.value), puntosInteres);
    });
    selectPunto.addEventListener("change", function () {
      puntosDeInteres.actualizarPosiciones(document.getElementById("inputPosicionPunto"), parseInt(selectPlanetaPunto.value), parseInt(selectPunto.value), puntosInteres);
    });
  }
};
document.addEventListener("DOMContentLoaded", inicializarSelects);

//  MANEJADORES DE FORMULARIOS (Alta, Modificación y Baja) 
// FORMULARIO PLANETA 
const formPlaneta = document.getElementById("tab-planeta");
const selectPlaneta = document.getElementById("selectPlaneta");
const btnBorrarPlaneta = document.getElementById("btnBorrarPlaneta");

// Cargar datos en el form si selecciona uno existente (Modificación)
selectPlaneta.addEventListener("change", async () => {   
  await planetas.cargarPlanetas(selectPlaneta, formPlaneta);
});
// Guardar (Alta o Modificación) Planeta
formPlaneta.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { titulo, textoEstado} = await planetas.agregaPlaneta(inicializarSelects, selectPlaneta, formPlaneta);
  await mostrarNotificacion(titulo,textoEstado);
});

// Borrar Planeta
btnBorrarPlaneta.addEventListener("click", async () => {
  const { titulo, textoEstado} = await planetas.borrarPlaneta(inicializarSelects, selectPlaneta, formPlaneta);
  await mostrarNotificacion(titulo,textoEstado);
});
// FORMULARIO VEHÍCULO 
const formVehiculo = document.getElementById("tab-vehiculo");
const selectVehiculo = document.getElementById("selectVehiculo");
const btnBorrarVehiculo = document.getElementById("btnBorrarVehiculo");

// Cargar datos en el form si selecciona un vehículo existente
selectVehiculo.addEventListener("change", async () => {
  vehiculos.cargarVehiculos(selectVehiculo, formVehiculo);
});

// Guardar (Alta o Modificación) Vehículo
formVehiculo.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { titulo, textoEstado} = await vehiculos.agregarVehiculos(selectVehiculo, inicializarSelects, formVehiculo);
  await mostrarNotificacion(titulo, textoEstado);
});

// Borrar Vehículo
btnBorrarVehiculo.addEventListener("click", async () => {
  const {titulo, textoEstado} = await vehiculos.borrarVehiculo(selectVehiculo, formVehiculo, inicializarSelects);
  await mostrarNotificacion(titulo, textoEstado);
});

// FORMULARIO PUNTO DE INTERÉS
const formPunto = document.getElementById("tab-punto");
const selectPunto = document.getElementById("selectPunto");
const btnBorrarPunto = document.getElementById("btnBorrarPunto");
const selectPlanetaPunto = document.getElementById("selectPlanetaPunto");

// Cargar datos en el form si selecciona un punto de interés existente
selectPunto.addEventListener("change", async () => {
 puntosDeInteres.cargarPuntoDeInteres(selectPunto, formPunto)
});

selectPlanetaPunto.addEventListener("change", async () => {
    document.getElementById("inputTituloPunto").value = "";
    document.getElementById("inputDescripcionPunto").value = "";
    document.getElementById("inputPosicionPunto").value = "";
    document.getElementById("inputImagenPunto").value = "";
});

// Guardar (Alta o Modificación) Punto de Interés
formPunto.addEventListener("submit", async (e) => {
  e.preventDefault();
  puntosDeInteres.agregarPuntoDeInteres(selectPunto, formPunto, inicializarSelects)
});

// Borrar Punto de Interés
btnBorrarPunto.addEventListener("click", async () => {
  puntosDeInteres.borrarPuntoDeInteres(selectPunto, formPunto, inicializarSelects)
});