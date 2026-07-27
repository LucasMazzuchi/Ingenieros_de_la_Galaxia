import * as constantes from "./constantes.js";
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

function pintarPlanetas(cuerpos_celestes) {
  console.log("Planetas recibidos del backend:", cuerpos_celestes);

  contenedor.innerHTML = ""; // limpia por las dudas

  cuerpos_celestes.forEach(cuerpo => {
    const div = document.createElement("div");
    div.className = `planeta pos-${cuerpo.posicion}`;
    const ruta = obtenerImagen(cuerpo.imagen);
    let divNoDisponible = ``;
    if (!cuerpo.disponible){
      divNoDisponible = `<div class="capa-oscura">Inalcanzable, explore más planetas para desbloquearlo.</div>`;
      div.classList.add("no-disponible");
      div.classList
    }
    div.innerHTML = `
      <div class="imagen-contenedor">
        <img src="${ruta}" alt="${cuerpo.nombre}">
        ${divNoDisponible}
      </div>
      <p class="nombre-planeta">${cuerpo.nombre}</p>
    `;

    div.addEventListener("click", () => {
      if (cuerpo.disponible) {
        window.location.href = `planeta.html?id=${cuerpo.id}`;
      }
    });

    contenedor.appendChild(div);
  });
}

async function iniciar () {
try {
    const respuestaVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}`);
    const vehiculos = await respuestaVehiculo.json();
    const planetas = await obtenerPlanetas(vehiculos[0].id);
    pintarPlanetas(planetas.cuerpos);
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", iniciar);