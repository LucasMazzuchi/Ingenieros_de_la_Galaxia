import * as constantes from "./constantes.js";
const contenedor = document.getElementById("planetas-contenedor");


// Datos de prueba (mientras el backend no está conectado)
const planetasPrueba = [
  { id: 1, nombre: "La Tierra", imagen_url: "../assets/img/tierra.png", posicion: 0 },
  { id: 2, nombre: "Marte", imagen_url: "../assets/img/marte.png", posicion: 1 },
  { id: 3, nombre: "Mercurio", imagen_url: "../assets/img/mercurio.png", posicion: 2 }
];

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
    1 : "../assets/img/tierra.png",
    2 : "../assets/img/marte.png",
    3 : "../assets/img/mercurio.png",
    4 : "../assets/img/sol.png",
    5 : "../assets/img/saturno.png",
    6 : "../assets/img/planeta_violeta.png",
    7 : "../assets/img/planeta_verde.png",
    8 : "../assets/img/luna.png",
    9 : "../assets/img/agujero_negro.png",
    10 : "../assets/img/neptuno.png"
  };
  return imagenes_planeta[imagenId];
}

function pintarPlanetas(cuerpos_celestes) {


  contenedor.innerHTML = ""; // limpia por las dudas

  cuerpos_celestes.forEach(cuerpo => {
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

    div.addEventListener("click", () => {
      if (cuerpo.disponible !== false) {
        window.location.href = `planeta.html?id=${cuerpo.id}`;
      }
    });

    contenedor.appendChild(div);
  });
}

// AHORA (mientras probás sin backend):
async function iniciar () {
try {
    const respuestaVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}?tipo=1`);
    const vehiculo = await respuestaVehiculo.json();
    pintarPlanetas(await obtenerPlanetas(vehiculo.id).cuerpos);
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", iniciar);
