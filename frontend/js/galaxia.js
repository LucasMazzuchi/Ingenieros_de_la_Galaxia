import * as constantes from "./constantes.js";
import { mostrarNotificacion} from "./notificaciones.js";
const contenedor = document.getElementById("planetas-contenedor");

// La función devuelve todos los planetas que están en la base de datos junto con una cadeena vacía. Si ocurre un error, devuelve el error y un arreglo vacío.
async function obtenerPlanetas(vehiculoId){
  const url = `${constantes.API_URL}/${constantes.CUERPOS_URL}?vehiculo_id=${vehiculoId}`;
  try{
  const respuesta = await fetch(url);
  const planetas = await respuesta.json();
  return {error : "", cuerpos : planetas};
  } catch (error){
    return {error : error, cuerpos : []};
  }
}

// La función devuelve la ruta a la imagen asociada al id pasado por parámetro.
function obtenerImagen(imagenId){
  const imagenes_planeta = {
   1 : "../assets/img/agujero_negro.png",
    2 : "../assets/img/luna.png",
    3 : "../assets/img/marte.png",
    4 : "../assets/img/mercurio.png",
    5 : "../assets/img/neptuno.png",
    6 : "../assets/img/planeta_verde.png",
    7 : "../assets/img/planeta_violata.png",
    8 : "../assets/img/saturno.png",
    9 : "../assets/img/sol.png",
    10 : "../assets/img/tierra.png"
  };
  return imagenes_planeta[imagenId];
}


// La función muestra los planetas que obtiene por parámetro por pantalla. Cada planeta tiene un div que forma parte de contenedor. Si el planeta no está
// disponible, se le agrega un div al planeta con una capa que mestra que está bloqueado y un texto indicando como desbloquear el planeta. 
async function pintarPlanetas(cuerpos_celestes, naveId) {
  console.log("Planetas recibidos del backend:", cuerpos_celestes); // Sacar
  const resEstadoTierra = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/1`);
  const estadoTierra = await resEstadoTierra.json();
  // Pintar estación espacial
  if (!estadoTierra.planetaCompletado){
    document.getElementById("estacionEspacial").classList.add("no-disponible");
    document.getElementById("contenedorEstacion").insertAdjacentHTML(
      "beforeend", 
      `<div class="capa-oscura">Se necesita una nave.</div>`
    );
  }
  document.getElementById("contenedorEstacion").addEventListener("click", () => {
    if (estadoTierra.planetaCompletado){
      window.location.href = "estacion_espacial.html";
    } else {
      await mostrarNotificacion("No puede entrar a la estación","Desbloquee la nave completando todos los puntos en la Tierra.");
    }
  });
  // Hasta acá pintar Estación espacial

  contenedor.innerHTML = "";
  let completados = 0;
  for (const cuerpo of cuerpos_celestes){
    // Armar div func que devuelva el div.
    const div = document.createElement("div");
    div.className = `planeta pos-${cuerpo.posicion}`;
    const ruta = obtenerImagen(cuerpo.imagen);
    let divNoDisponible = ``;
    if (cuerpo.id !== 1 && (!cuerpo.disponible || !estadoTierra.planetaCompletado)){
      const texto = estadoTierra.planetaCompletado ? `explore más planetas`: `se necesita una nave`
      divNoDisponible = `<div class="capa-oscura">Inalcanzable, ${texto} para desbloquearlo.</div>`;
      div.classList.add("no-disponible");
    }
    div.innerHTML = `
      <div class="imagen-contenedor">
        <img src="${ruta}" alt="${cuerpo.nombre}">
        ${divNoDisponible}
      </div>
      <p class="nombre-planeta">${cuerpo.nombre}</p>
    `;
    // hasta acá
    const resEstado = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/${cuerpo.id}`);
    const estado = await resEstado.json();
    console.log(`${cuerpo.nombre}`, estado.planetaCompletado); // Sacar
    if (estado.planetaCompletado){
      completados++;
    }

    div.addEventListener("click", async () => {
      const navePuedeViajar = await puedeViajar(naveId, cuerpo.id);
      console.log("Nave puede viajar: ", navePuedeViajar); // Sacar
      if (cuerpo.disponible && navePuedeViajar) {
        window.location.href = `planeta.html?id=${cuerpo.id}`;
      } else {
        const errorNave = "Nave no desbloqueada, completa todos los puntos de interés del planeta Tierra para poder acceder a los demás." // Hacer cte
        const errorCombustible = "Combustible insuficiente, completa todos los puntos de interés del planeta donde está la nave o recarga combustible para poder viajar a otro."; // Hacer cte
        const textoError = estadoTierra.planetaCompletado ? errorCombustible : errorNave;
        await mostrarNotificacion("No puede entrar al planeta",textoError)
      }
    });

    contenedor.appendChild(div);
  };
  return completados;
}

// La función usa el id que está en el localStorage para mostrar los planetas con el estado correspondiente. Si todos los planetas están completados,
// muestra por pantalla una notificación indicando que el juego fue completado.
async function iniciar () {
  try {
      const vehiculoId = localStorage.getItem("vehiculoSeleccionadoId");
      const planetas = await obtenerPlanetas(parseInt(vehiculoId));
      const completados = await pintarPlanetas(planetas.cuerpos, parseInt(vehiculoId));
      console.log("planetas completados:", completados); // Sacar
      console.log("planetas totales", planetas.cuerpos.length); // Sacar
      if (completados === planetas.cuerpos.length){
        await mostrarNotificacion("Juego completado", "Si querés seguir jugando, podés modificar la galaxia o comenzar de nuevo creando otra nave.");
    }


  } catch (error) {
    console.log(error);
  }
}
// La función puedeViajar devuelve false si el combustible es menor a 100, el planeta no está en progreso y no está completado. Sino devuelve true.
async function puedeViajar(naveId, planetaId) {
    const resEstado = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/${planetaId}`);
    const estado = await resEstado.json();
    const resVehiculoDatos = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`);
    const vehiculoDatos = await resVehiculoDatos.json();
    return !(!estado.planetaCompletado && vehiculoDatos.combustible<100 && !estado.enProgreso);
}

document.addEventListener("DOMContentLoaded", iniciar);