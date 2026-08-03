import * as constantes from "./constantes.js";
import { mostrarNotificacion } from "./notificaciones.js";

const contenedorMapa = document.getElementById("mapa-planeta");
const panelPunto = document.getElementById("panelPunto");
const vehiculo = document.getElementById("vehiculo");
const coordenadasVisuales = [
        { top: constantes.PUNTO1_TOP, left: constantes.PUNTO1_LEFT },
        { top: constantes.PUNTO2_TOP, left: constantes.PUNTO2_LEFT },
        { top: constantes.PUNTO3_TOP, left: constantes.PUNTO3_LEFT }
    ];

//Chequea que pueda ingresar al planeta.
async function iniciarPlaneta() {
    const parametros = new URLSearchParams(window.location.search);
    const planetaId = parseInt(parametros.get("id"));
    const naveId = localStorage.getItem("vehiculoSeleccionadoId");
    
    if (!naveId) {
        window.location.href = "usuario.html";
        return;
    }
    if (!planetaId) {
        window.location.href = "galaxia.html"; 
        return;
    }
    
    const tipoVehiculo = (planetaId === 1) ? 2 : 1;
    vehiculo.src = (tipoVehiculo === 2) ? "../assets/img/auto1.png" : "../assets/img/nave1.png";
    
    try {
        // 1. Fetches corregidos: usamos los endpoints y filtros que coinciden con tu DB
        const resPlanetas = await fetch(`${constantes.API_URL}/${constantes.CUERPOS_URL}`);
        const planetas = await resPlanetas.json();
        
        // Buscamos el planeta en el que el usuario hizo click (en lugar de usar planetas[0] siempre)
        const planetaActual = planetas.find(p => p.id === planetaId) || planetas[0];

        // Filtramos las misiones por cuerpo_celeste_id en vez de "planeta"
        const resMisiones = await fetch(`${constantes.API_URL}/misiones?cuerpo_celeste_id=${planetaId}`);
        let misiones = await resMisiones.json();
        if (!Array.isArray(misiones)) misiones = []; // Por seguridad, si falla aseguramos que sea un arreglo vacío

        const resVehiculos = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}`);
        const vehiculos = await resVehiculos.json();
        
        const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`);
        const vehiculoDatos = await resVehiculo.json();
        const resEstado = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/${planetaId}`);
        const estado = await resEstado.json();
        
        // Filtramos para asegurarnos de contar solo los puntos visitados de este planeta
        const puntosVisitadosActuales = estado.puntosVisitados ? estado.puntosVisitados.filter(pv => 
            misiones.some(m => m.id === pv.mision_id)
        ) : [];

        if (!estado.planetaCompletado && vehiculoDatos.combustible < 100 && !estado.enProgreso){
            mostrarNotificacion("No puede entrar al planeta", "Combustible insuficiente, completa todos los puntos de interés del planeta donde está la nave para poder viajar a otro.", false)
            return window.location.href = "galaxia.html";
        }
        
        if (!estado.planetaCompletado && misiones.length > 0 && misiones.length === puntosVisitadosActuales.length){
            const completarPlaneta = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/completar`,{
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cuerpo_celeste_id : planetaId
                })
            });
            mostrarNotificacion("¡Planeta Explorado!", 
                "Has recolectado todos los datos de este sector. Ya puedes volver a la galaxia para continuar tu viaje o mejorar tu nave.",
                false)
        }

        let puntoActual = vehiculoDatos.punto_interes;
        if (vehiculoDatos.ubicacion_id !== planetaId){
            puntoActual = misiones.length !== 0 ? misiones[0].posicion : 1;
            vehiculoDatos.punto_interes = puntoActual;
        }
        
        const actualizarVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ubicacion_id : planetaId,
                punto_interes: puntoActual
            })
        });
        
        if (misiones.length !== 0 && puntosVisitadosActuales.length === 0){
            const primerMision = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/desbloquear`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cuerpo_celeste_id: planetaId, mision_id: misiones[0].id})
            });
        }

        // 2. Le pasamos planetaActual en lugar de planetas[0]
        const resDibujado = await dibujarDatosDelPlaneta(planetaActual, misiones, vehiculoDatos, vehiculos); 
        
        if (misiones.length !== 0 && puntosVisitadosActuales.length === 0){ 
            const actualizacionCombustibleVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ combustible: 0})
            });
        }

        document.getElementById("botonVolver").addEventListener("click", function () {
            window.location.href = "galaxia.html";
        });
        
    } catch (error) {
        console.error("Error en iniciarPlaneta:", error);
    }
}

async function dibujarDatosDelPlaneta(planeta, misiones, vehiculoObjeto, vehiculos){
  if(!planeta) return;
  try{
    document.getElementById("nombre-planeta").textContent = planeta.nombre; 
    const ruta = buscarImagenFondo(planeta.imagen_fondo);
    contenedorMapa.style.backgroundImage = `url('${ruta}')`;
    contenedorMapa.style.backgroundSize = "cover"; 
    contenedorMapa.style.backgroundPosition = "center"; 
    contenedorMapa.style.backgroundRepeat = "no-repeat"; 
    rellenarApartadoIzquierda(planeta);
    if (misiones.length !== 0){
        dibujarCamino(misiones);
        pintarPuntosDeInteres(planeta, misiones, vehiculoObjeto);
        pintarVehiculos(vehiculos, vehiculoObjeto, planeta.id);
    }
  } catch (error){
    console.error("Error En la consulta de misiones: ", error);
  }
}

function buscarImagenFondo(imagenId) {
    const imagenes_fondo = {
    1 : "../assets/img/fondo-agujero_negro.jpg",
    2 : "../assets/img/fondo-luna.jpg",
    3 : "../assets/img/fondo-marte.jpg",
    4 : "../assets/img/fondo-mercurio.jpg",
    5 : "../assets/img/fondo-neptuno.jpg",
    6 : "../assets/img/fondo-saturno.jpg",
    7 : "../assets/img/fondo-sol.jpg",
    8 : "../assets/img/fondo-tierra.jpg",
    9 : "../assets/img/fondo-verde.jpg",
    10 : "../assets/img/fondo-violeta.jpg"
  };
  return imagenes_fondo[imagenId];
}

function buscarImagenPunto(imagenId){
    const imagenes_punto = {
        1: "../assets/img/marcador1.png",
        2: "../assets/img/marcador2.png",
        3: "../assets/img/marcador3.png",
        4: "../assets/img/marcador4.png",
        5: "../assets/img/marcador5.webp"
    }
    return imagenes_punto[imagenId];
}

async function pintarPuntosDeInteres(cuerpoCeleste, misiones, vehiculoObjetos) {
    if (misiones.length < 1){
        return;
    }

    const resProgreso = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${vehiculoObjetos.id}/${cuerpoCeleste.id}`);
    const progresoData = await resProgreso.json();
    
    // 3. SEGURO ANTI-CRASH: Si es la primera vez y no hay puntosVisitados, forzamos un arreglo vacío [] en lugar de undefined.
    const puntosVisitados = progresoData.puntosVisitados || []; 
    
    let posNave = (vehiculoObjetos.punto_interes || 1) - 1;
    
    misiones.forEach((mision) => {
        const coordenadas = coordenadasVisuales[mision.posicion-1];
        if (!coordenadas) return; 
        
        const divPunto = document.createElement("div");
        divPunto.className = "punto-interes";
        
        // Ahora usar puntosVisitados.find() es seguro
        if (!puntosVisitados.find(function (punto) {return punto.mision_id === mision.id})) {
            divPunto.classList.add("bloqueado");
        }

        divPunto.style.position = "absolute";
        divPunto.style.top = coordenadas.top;
        divPunto.style.left = coordenadas.left;
        const imagenPunto = buscarImagenPunto(mision.imagen);
        divPunto.innerHTML = `
            <img src="${imagenPunto}" alt="punto de interés">
            <p>${mision.nombre}</p>
        `;

        divPunto.addEventListener("click", async () => {
            const exito = await manejarClickPunto(cuerpoCeleste.id, mision, vehiculoObjetos.id, coordenadas, vehiculo);
            if (exito) {
                divPunto.classList.remove("bloqueado");
            }
        });
        contenedorMapa.appendChild(divPunto);
    });
    
    vehiculo.style.transition = "none";
    vehiculo.style.top = coordenadasVisuales[posNave].top;
    vehiculo.style.left = coordenadasVisuales[posNave].left;
    vehiculo.dataset.indiceActual = posNave;

    setTimeout(() => {
        vehiculo.style.transition = "top 1s ease, left 1s ease"; 
    }, 50);
}

function rellenarApartadoIzquierda(cuerpo_celeste){
    document.getElementById("datoTipo").textContent = constantes.TIPOS_PLANETA[cuerpo_celeste.tipo];
    document.getElementById("datoDiametro").textContent = `${cuerpo_celeste.diametro} km`;
    document.getElementById("datoGravedad").textContent = `${cuerpo_celeste.gravedad} m/s²`;
    document.getElementById("datoTemperatura").textContent = `${cuerpo_celeste.temperatura} °C`;
    document.getElementById("datoTerreno").textContent = constantes.TIPOS_TERRENO[cuerpo_celeste.terreno];
    const habitable = (cuerpo_celeste.habitable === true) ? "Si" : "No";
    document.getElementById("datoHabitable").textContent = `${habitable}`;
    document.getElementById("datoDescripcion").textContent = cuerpo_celeste.descripcion;
}

async function manejarClickPunto(cuerpoCelesteId, mision, vehiculoId, coordenadasDestino, vehiculoDOM) {
    const estamosAhi = ((vehiculoDOM.style.top === coordenadasDestino.top) && (vehiculoDOM.style.left === coordenadasDestino.left));
    if (estamosAhi) {
        try {
            const resExplorar = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${vehiculoId}/explorar`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cuerpo_celeste_id: cuerpoCelesteId, mision_id: mision.id })
            });
            const data = await resExplorar.json();
            
            if (data.error === constantes.ERROR_DISPONIBLE) { 
                console.warn(data.error);
                return false;
            }
            
            document.getElementById("puntoNombre").textContent = mision.nombre;
            document.getElementById("puntoDescripcion").textContent = mision.descripcion;
            panelPunto.classList.add("visible");
            
            if (!data.error){
                mostrarNotificacion("¡Misión Completada!", `Combustible extraído: ${data.combustible}`, data.cuerpoCompletado);
            }

            return true;
        } catch (error) {
            console.error("Error de red al explorar:", error);
            return false;
        }
    } else {
        try {
            const resDesbloquear = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${vehiculoId}/desbloquear`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cuerpo_celeste_id: cuerpoCelesteId, mision_id: mision.id })
            });
            const data = await resDesbloquear.json();

            if (!resDesbloquear.ok) {
                mostrarNotificacion("Ruta Inválida", data.error || "Debe explorar el punto anterior primero.", false);
                return false;
            }

            viajarHacia(coordenadasDestino);
            const actualizacionUbicacionVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ punto_interes: mision.posicion})
            });
            return true;
        } catch (error) {
            console.error("Error de red al desbloquear:", error);
            return false;
        }
    }
}


function viajarHacia(coordenadas) {
    document.body.classList.add("bloqueado-viajando");
    vehiculo.style.top = coordenadas.top;
    vehiculo.style.left = coordenadas.left;

    setTimeout(() => {
        document.body.classList.remove("bloqueado-viajando");
    }, 1000); 
}

function dibujarCamino(puntosDeInteres){
    const camino = document.getElementById("camino-polyline");
    const puntos = [];
    puntosDeInteres.forEach(function (punto){
        puntos.push(constantes.COORDENADAS_SVG[punto.posicion-1]);
    })
    camino.setAttribute("points", puntos.join(" "));
}

document.getElementById("btnCerrarPanelPunto").addEventListener("click", () => {
    panelPunto.classList.remove("visible");
});

// Aquí está la función que dibuja a los demás jugadores en el mapa
async function pintarVehiculos(vehiculos, vehiculoUsado, planetaId) { 
    vehiculos.forEach(function (vehiculoActual) {
        
        // Si es la nave que el usuario está manejando, o la nave NO está en este planeta, la ignoramos.
        if (vehiculoActual.id === parseInt(vehiculoUsado.id) || vehiculoActual.ubicacion_id !== planetaId){
            return;
        }
        
        // Buscamos en qué punto de interés está estacionada esta nave
        const posicionNave = (vehiculoActual.punto_interes || 1) - 1;
        const coordenadas = coordenadasVisuales[posicionNave];

        if (!coordenadas) return;

        // Creamos la navecita para dibujarla en el mapa
        const divVehiculo = document.createElement("div");
        divVehiculo.className = "vehiculo-estacionado"; // Asegúrate de tener esta clase en tu CSS
        divVehiculo.style.position = "absolute";
        divVehiculo.style.top = coordenadas.top;
        divVehiculo.style.left = coordenadas.left;
        
        // Elegimos si es auto (Tierra) o nave (otros planetas)
        const tipoVehiculo = (planetaId === 1) ? 2 : 1;
        const imgSrc = (tipoVehiculo === 2) ? "../assets/img/auto1.png" : "../assets/img/nave1.png";

        divVehiculo.innerHTML = `
            <img src="${imgSrc}" style="width: 50px; opacity: 0.7; filter: grayscale(50%);">
            <p style="color: white; font-size: 12px; margin: 0; text-shadow: 1px 1px 2px black;">Nave ${vehiculoActual.id}</p>
        `;

        contenedorMapa.appendChild(divVehiculo);
    });
}

// llamamos a iniciarPlaneta cuando cargue la página
document.addEventListener("DOMContentLoaded", iniciarPlaneta);