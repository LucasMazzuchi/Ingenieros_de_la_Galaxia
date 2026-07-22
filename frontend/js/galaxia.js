import { app } from "../../backend/index.js";
import * as constantes from "./constantes.js";
const contenedor = document.getElementById("planetas-contenedor");


// Datos de prueba (mientras el backend no está conectado)
const planetasPrueba = [
  { id: 1, nombre: "La Tierra", imagen_url: "../assets/img/tierra.png", posicion: 0 },
  { id: 2, nombre: "Marte", imagen_url: "../assets/img/marte.png", posicion: 1 },
  { id: 3, nombre: "Mercurio", imagen_url: "../assets/img/mercurio.png", posicion: 2 }
];

function obtenerPlanetas(vehiculoId){
  const url = `${constantes.API_URL}/${constantes.CUERPOS_URL}?vehiculo_id=${vehiculo.id}`;
  const cuerpos = fetch(url);
}
function obtenerImagen(imagenId){
  imagenes_planeta = {
    1 : "../assets/img/tierra.png",
    2 : "../assets/img/marte.png",
    3 : "../assets/img/mercurio.png",
    4 : ,
    5 : ,
    6 : ,
    7 : ,
    8 : ,
    9 : ,
    10 : 
  };
  imagenes_fondo = {
    1 : "",
    2 : "",
    3 : "",
  };
  if (imagenId.key === "cuerpo") {
  return imagenes_planeta[Object.values(imagenId)];
  }
  return imagenes_fondo[Object.values(imagenId)];
}

function pintarPlanetas(cuerpos_celestes) {


  contenedor.innerHTML = ""; // limpia por las dudas

  cuerpos_celestes.forEach(cuerpo => {
    const div = document.createElement("div");
    div.className = `planeta pos-${cuerpo.posicion}`;
    const ruta = obtener_Imagen({["cuerpo"] : cuerpo.imagen_fondo});
    div.innerHTML = `
      <img src="${ruta}" alt="${cuerpo.nombre}">
      <p class="nombre-planeta">${cuerpo.nombre}</p>
    `;

    div.addEventListener("click", () => {
      window.location.href = `planeta.html?id=${cuerpo.id}`;
    });

    contenedor.appendChild(div);
  });
}

// AHORA (mientras probás sin backend):
pintarPlanetas(obtenerPlanetas(fetch(`${constantes.API_URL}/${constantes.VEHICULO_URL}?tipo=1`).id));

// DESPUÉS (cuando el backend esté listo, comentás la línea de arriba y usás esta):
/*
fetch("http://localhost:5000/api/cuerpos_celestes")
  .then(res => res.json())
  .then(planetas => pintarPlanetas(planetas));
*/

/*const contenedor = document.getElementById("planetas-contenedor");

fetch("http://localhost:puerto/api/cuerpos-celestes")
  .then(res => res.json())
  .then(planetas => {
    planetas.forEach(planeta => {
      const div = document.createElement("div");
      div.className = `planeta pos-${planeta.posicion}`;

      div.innerHTML = `
        <img src="${planeta.imagen_url}" alt="${planeta.nombre}">
        <p class="nombre-planeta">${planeta.nombre}</p>
      `;

      div.addEventListener("click", () => {
        window.location.href = `planeta.html?id=${planeta.id}`;
      });

      contenedor.appendChild(div);
    });
  });
/*
document.addEventListener("DOMContentLoaded", async () => {
    const contenedorGalaxia = document.getElementById("contenedor-galaxia"); // Asegurate de tener este ID en tu HTML
    
    if (!contenedorGalaxia) {
        console.error("No se encontró el contenedor de la galaxia en el HTML.");
        return;
    }

    try {
        // Pedir los datos de manera dinámica al Backend (CSR)
        const respuesta = await fetch("http://localhost:5000/api/cuerpos_celestes");
        if (!respuesta.ok) throw new Error("Error al traer los cuerpos celestes");
        
        const planetas = await respuesta.rows ? respuesta.rows : await respuesta.json(); // Manejo de formato según API
        
        // Limpiamos el HTML hardcodeado para inyectar los dinámicos
        contenedorGalaxia.innerHTML = "";

        // Iterar e inyectar cada planeta dinámicamente
        planetas.forEach((planeta) => {
            const divPlaneta = document.createElement("div");
            divPlaneta.classList.add("planeta");
            divPlaneta.id = `planeta-${planeta.id}`;

            // Usamos el campo 'posicion' numérico de la base de datos para calcular un top/left elíptico o lineal.
            const angulo = (planeta.posicion * 45) * (Math.PI / 180); // Distribución radial
            const radioX = 350; // Radio horizontal de la órbita
            const radioY = 150; // Radio vertical de la órbita
            
            const centroX = contenedorGalaxia.clientWidth / 2;
            const centroY = contenedorGalaxia.clientHeight / 2;

            const posX = centroX + radioX * Math.cos(angulo) - 40; // 40 es la mitad del ancho estimado del planeta
            const posY = centroY + radioY * Math.sin(angulo) - 40;

            divPlaneta.style.left = `${posX}px`;
            divPlaneta.style.top = `${posY}px`;

            // Validar si la imagen no existe en assets/img/ usar una por defecto (Placeholder espacial)
            const rutaImagen = planeta.imagen_url ? planeta.imagen_url : "assets/img/default-planet.png";

            // Inyectamos la estructura visual del planeta
            divPlaneta.innerHTML = `
                <a href="planeta.html?id=${planeta.id}">
                    <img src="${rutaImagen}" alt="${planeta.nombre}" class="img-planeta">
                    <span class="nombre-planeta">${planeta.nombre}</span>
                </a>
            `;

            contenedorGalaxia.appendChild(divPlaneta);
        });

    } catch (error) {
        console.error("❌ Falló la carga dinámica de la galaxia:", error);
        contenedorGalaxia.innerHTML = `<p class="error-msg">Error de comunicación con la base de datos central de la galaxia.</p>`;
    }
});
>>>>>>> origin/feature/database
*/
