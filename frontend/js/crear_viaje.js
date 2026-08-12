import * as constantes from "./constantes.js";
import {mostrarNotificacion} from "./notificaciones.js";
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
function crearSelectorImagenes(contenedorId, imagenes, inputHiddenId) {
  const contenedor = document.getElementById(contenedorId);
  const inputHidden = document.getElementById(inputHiddenId);
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

// Hace un fetch para obtener los datos de la URL pasada por recurso y lo devuelve, si ocurre
// un error devuelve un arreglo vacío.
async function obtenerDatos(recurso) {
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
async function crearRegistro(recurso, datos) {
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
async function modificarRegistro(recurso, id, datos) {
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
async function eliminarRegistro(recurso, id) {
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

// La función arma el desplegable de las posiciones disponibles para crear o modificar un planeta.
async function actualizarPosicionesPlanetas() {
  const selectPosicion = document.getElementById("inputPosicion");
  if (!selectPosicion) return;

  // Obtenemos los planetas actuales
  const planetas = await obtenerDatos("cuerpos_celestes"); // Cambiar por cte
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

// LOGICA DE CONSULTA Y LLENADO DE SELECTS (Al cargar la página) 
async function inicializarSelects() {
  const planetas = await obtenerDatos("cuerpos_celestes"); //Cambiar cte
  await actualizarPosicionesPlanetas();
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

    planetas.forEach(planeta => {
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
  const vehiculos = await obtenerDatos("vehiculos"); // cambiar cte
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
  const puntosInteres = await obtenerDatos(constantes.PUNTOS_URL); // Cambiar cte
  const selectPunto = document.getElementById("selectPunto");
  
  if (selectPunto && selectPlanetaPunto) {
    
    function actualizarPuntosInteres () { // Pasar por params selectPunto, puntosInteres, planetaId
      selectPunto.innerHTML = '<option value="">-- Crear nuevo --</option>'; // Este hay que sacarlo afuera de la función
      const planetaId = parseInt(selectPlanetaPunto.value);
      const puntosInteresSinTierra = puntosInteres.filter(function (puntoInteres){return puntoInteres.cuerpo_celeste_id !== 1});
      const puntosInteresFiltrados = !planetaId ? puntosInteresSinTierra : puntosInteres.filter(function (puntoInteres) {
        return puntoInteres.cuerpo_celeste_id == planetaId;
      });
      puntosInteresFiltrados.forEach(puntoInteres => {
        const opcion = document.createElement("option");
        opcion.value = puntoInteres.id;
        opcion.textContent = puntoInteres.nombre;
        selectPunto.appendChild(opcion);
      });
    };
    actualizarPuntosInteres();
    function actualizarPosiciones() {// Pasar selectPosicion, planetaId, puntoInteresId, puntosInteres
      const selectPosicion = document.getElementById("inputPosicionPunto"); // Va afuera
      if (!selectPosicion) return; // Va afuera
      selectPosicion.innerHTML = '<option value="">-- Seleccione posición --</option>'; // Va afuera

      const planetaId = parseInt(selectPlanetaPunto.value); // Por parámetro
      const puntoInteresId = parseInt(selectPunto.value); // Por parámetro

      // Si no hay planeta seleccionado, no mostramos posiciones disponibles
      if (!planetaId) return;

      const puntosInteresDelPlaneta = new Set(puntosInteres.filter(function (puntoInteres) {
        return (puntoInteres.cuerpo_celeste_id === planetaId && puntoInteres.id !== puntoInteresId);
      }).map(function (puntoInteres) {return parseInt(puntoInteres.posicion)})); //Convierte todos los valores a entero.
      for (let i = 1; i <= 3; i++) { // Hacer el 3 cte.
        if (!puntosInteresDelPlaneta.has(i)) {
          const opcion = document.createElement("option");
          opcion.value = i;
          opcion.textContent = `${i}`;
          selectPosicion.appendChild(opcion);
        }
      }
    };
    actualizarPosiciones();
    selectPlanetaPunto.addEventListener("change", function () {
      actualizarPuntosInteres();
      actualizarPosiciones();
  });
    selectPunto.addEventListener("change", actualizarPosiciones);
  }
}
document.addEventListener("DOMContentLoaded", inicializarSelects);


//  MANEJADORES DE FORMULARIOS (Alta, Modificación y Baja) 

// FORMULARIO PLANETA 
const formPlaneta = document.getElementById("tab-planeta");
const selectPlaneta = document.getElementById("selectPlaneta");
const btnBorrarPlaneta = document.getElementById("btnBorrarPlaneta");

// Cargar datos en el form si selecciona uno existente (Modificación)
selectPlaneta.addEventListener("change", async () => { // función de cargado aparte
  const id = selectPlaneta.value;
  await actualizarPosicionesPlanetas();
  if (!id) {
    formPlaneta.reset();
    return;
  }
  const planetas = await obtenerDatos("cuerpos_celestes");
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
});

// Guardar (Alta o Modificación) Planeta
formPlaneta.addEventListener("submit", async (e) => { // Hacer una func aparte de Guardar
  e.preventDefault();
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
    exito = await modificarRegistro("cuerpos_celestes", id, datos);
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
});

// Borrar Planeta
btnBorrarPlaneta.addEventListener("click", async () => { // Armar func aparte
  const id = selectPlaneta.value;
  if (!id) {
    alert("Selecciona un planeta existente para borrar.");
    return;
  }
  if (confirm("¿Estás seguro de borrar este planeta?")) {

    const exito = await eliminarRegistro("cuerpos_celestes", id);
    if (exito) {
      alert("Planeta eliminado.");
      formPlaneta.reset();
      inicializarSelects();// Tiene que ser pasada por parámetro y ejecutada o tiene que devolver un flag tipo ok
    } else {
      alert("No se pudo eliminar.");
    }
  }
});
// FORMULARIO VEHÍCULO 
const formVehiculo = document.getElementById("tab-vehiculo");
const selectVehiculo = document.getElementById("selectVehiculo");
const btnBorrarVehiculo = document.getElementById("btnBorrarVehiculo");

// Cargar datos en el form si selecciona un vehículo existente
selectVehiculo.addEventListener("change", async () => { // Función aparte de cargado
  const id = selectVehiculo.value;
  if (!id) {
    formVehiculo.reset();
    return;
  }
  const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${id}`);
  const vehiculo = await resVehiculo.json();
  if (vehiculo) {
    document.getElementById("inputNombreVehiculo").value = vehiculo.nombre;
    document.getElementById("inputMotor").value = vehiculo.motor;
    document.getElementById("inputEstructura").value = vehiculo.estructura;
    document.getElementById("inputCombustible").value = vehiculo.combustible;
    document.getElementById("inputResistencia").value = vehiculo.resistencia;
    document.getElementById("inputPuntos").value = vehiculo.puntos;
  }
});

// Guardar (Alta o Modificación) Vehículo
formVehiculo.addEventListener("submit", async (e) => { // Función aparte de guardado
  e.preventDefault();
  const id = selectVehiculo.value;
  let vehiculo;
  if (id){
    const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${id}`);
    vehiculo = await resVehiculo.json();
    const puntosDisponibles = 9-parseInt(document.getElementById("inputEstructura").value)- parseInt(document.getElementById("inputResistencia").value) -parseInt(document.getElementById("inputMotor").value);
    if (puntosDisponibles < parseInt(document.getElementById("inputPuntos").value)){
        await mostrarNotificacion("Puntos disponibles excedidos", `Podés elegir tener como máximo ${puntosDisponibles} puntos de mejora.`);
        return
      }
    }
  const datos = {
    nombre: document.getElementById("inputNombreVehiculo").value,
    motor: parseInt(document.getElementById("inputMotor").value),
    estructura: parseInt(document.getElementById("inputEstructura").value),
    combustible: parseInt(document.getElementById("inputCombustible").value),
    resistencia: parseInt(document.getElementById("inputResistencia").value),
    puntos: parseInt(document.getElementById("inputPuntos").value),
    punto_interes: id ? parseInt(vehiculo.punto_interes): 1,
    ubicacion_id: id ? parseInt(vehiculo.punto_interes): 1
  };

  let exito = false;
   
  if (id) {
    exito = await modificarRegistro("vehiculos", id, datos);
  } else {
    exito = await crearRegistro("vehiculos", datos);
  }

  if (exito) {
    alert("¡Vehículo guardado con éxito!");
    formVehiculo.reset();
    inicializarSelects();
  } else {
    alert("Ocurrió un error al guardar el vehículo.");
  }
});

// Borrar Vehículo
btnBorrarVehiculo.addEventListener("click", async () => { // func aparte
  const id = selectVehiculo.value;
  if (!id) {
    alert("Selecciona un vehículo existente para borrar.");
    return;
  }
  if (confirm("¿Estás seguro de borrar este vehículo?")) {
    const exito = await eliminarRegistro("vehiculos", id);
    if (exito) {
      alert("Vehículo eliminado.");
      formVehiculo.reset();
      inicializarSelects();
    } else {
      alert("No se pudo eliminar el vehículo.");
    }
  }
});
// FORMULARIO PUNTO DE INTERÉS
const formPunto = document.getElementById("tab-punto");
const selectPunto = document.getElementById("selectPunto");
const btnBorrarPunto = document.getElementById("btnBorrarPunto");

// Cargar datos en el form si selecciona un punto de interés existente
selectPunto.addEventListener("change", async () => { // Func aparte
  const id = selectPunto.value;
  if (!id) {
    formPunto.reset();
    return;
  }
  const puntosInteres = await obtenerDatos(constantes.PUNTOS_URL); 
  const puntoInteres = puntosInteres.find(item => item.id == id);
  if (puntoInteres) {
    document.getElementById("selectPlanetaPunto").value = puntoInteres.cuerpo_celeste_id;
    document.getElementById("inputTituloPunto").value = puntoInteres.nombre;
    document.getElementById("inputDescripcionPunto").value = puntoInteres.descripcion;
    document.getElementById("inputPosicionPunto").value = puntoInteres.posicion;
    document.getElementById("inputImagenPunto").value = puntoInteres.imagen;
  }
});

// Guardar (Alta o Modificación) Punto de Interés
formPunto.addEventListener("submit", async (e) => { // Func aparte guardado
  e.preventDefault();
  const id = selectPunto.value; // Poner el select del html como parámetro
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
    exito = await modificarRegistro(constantes.PUNTOS_URL, id, datos);
  } else {
    const puntoOcupado = puntosInteres.find(function (puntoInteres){ return puntoInteres.posicion === punto});
    if (puntoOcupado){
      alert("Ocurrió un error al guardar el punto de interés, ya existe un punto de interés en esta posición.");
    return;
  }
    exito = await crearRegistro(constantes.PUNTOS_URL, datos);
  }

  if (exito) {
    alert("¡Punto de interés guardado con éxito!");
    formPunto.reset();
    inicializarSelects();
  } else {
    alert("Ocurrió un error al guardar el punto de interés.");
  }
});

// Borrar Punto de Interés
btnBorrarPunto.addEventListener("click", async () => { // Func aparte
  const id = selectPunto.value;
  if (!id) {
    alert("Selecciona un punto de interés existente para borrar.");
    return;
  }
  if (confirm("¿Estás seguro de borrar este punto de interés?")) {
    const exito = await eliminarRegistro(constantes.PUNTOS_URL, id);
    if (exito) {
      alert("Punto de interés eliminado.");
      formPunto.reset();
      inicializarSelects();
    } else {
      alert("No se pudo eliminar el punto de interés.");
    }
  }
});