import * as constantes from "./constantes.js";
import { mostrarNotificacion} from "./notificaciones.js";
const contenedor = document.getElementById("planetas-contenedor");

async function obtenerPlanetas(vehiculoId){
  const url = `${constantes.API_URL}/${constantes.CUERPOS_URL}?vehiculo_id=${vehiculoId}`;
  try{
  const respuesta = await fetch(url);
  const planetas = await respuesta.json();
  return {error : "", cuerpos : planetas};
  } catch (error){
    return {error : "", cuerpos : []};
  }
}
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

async function pintarPlanetas(cuerpos_celestes, naveId) {
  console.log("Planetas recibidos del backend:", cuerpos_celestes);

  contenedor.innerHTML = ""; // limpia por las dudas
  let completados = 0;
  for (const cuerpo of cuerpos_celestes){
    const div = document.createElement("div");
    div.className = `planeta pos-${cuerpo.posicion}`;
    const ruta = obtenerImagen(cuerpo.imagen);
    let divNoDisponible = ``;
    if (!cuerpo.disponible){
      divNoDisponible = `<div class="capa-oscura">Inalcanzable, explore más planetas para desbloquearlo.</div>`;
      div.classList.add("no-disponible");
    }
    div.innerHTML = `
      <div class="imagen-contenedor">
        <img src="${ruta}" alt="${cuerpo.nombre}">
        ${divNoDisponible}
      </div>
      <p class="nombre-planeta">${cuerpo.nombre}</p>
    `;
    const resEstado = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/${cuerpo.id}`);
    const estado = await resEstado.json();
    console.log(`${cuerpo.nombre}`, estado.planetaCompletado);
    if (estado.planetaCompletado){
      completados++;
    }
    div.addEventListener("click", async () => {
      const navePuedeViajar = await puedeViajar(naveId, cuerpo.id);
      console.log("Nave puede viajar: ", navePuedeViajar);
      if (cuerpo.disponible && navePuedeViajar) {
        window.location.href = `planeta.html?id=${cuerpo.id}`;
      } else {
        mostrarNotificacion("No puede entrar al planeta","Combustible insuficiente, completa todos los puntos de interés del planeta donde está la nave para poder viajar a otro.", false)
      }
    });
    contenedor.appendChild(div);
  };
  return completados;
}

async function iniciar () {
try {
    const vehiculoId = localStorage.getItem("vehiculoSeleccionadoId");
    const planetas = await obtenerPlanetas(parseInt(vehiculoId));
    const completados = await pintarPlanetas(planetas.cuerpos, parseInt(vehiculoId));
    console.log("planetas completados:", completados);
    console.log("planetas totales", planetas.cuerpos.length);
    if (completados === planetas.cuerpos.length){
    mostrarNotificacion("Juego completado", "Si querés seguir jugando, podés modificar la galaxia o comenzar de nuevo creando otra nave.", false);
  }
  } catch (error) {
    console.log(error);
  }
}

async function puedeViajar(naveId, planetaId) {
    const resEstado = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/${planetaId}`);
    const estado = await resEstado.json();
    const resVehiculoDatos = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`);
    const vehiculoDatos = await resVehiculoDatos.json();
    return !(!estado.planetaCompletado && vehiculoDatos.combustible<100 && !estado.enProgreso);
}
document.addEventListener("DOMContentLoaded", iniciar);