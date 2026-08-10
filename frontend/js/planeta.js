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
    try {
        const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`);
        const vehiculoDatos = await resVehiculo.json();
        vehiculo.src = (planetaId === 1) ? "../assets/img/auto1.png" : obtenerImagenNave(vehiculoDatos);
        const resPlaneta = await fetch(`${constantes.API_URL}/${constantes.CUERPOS_URL}/?id=${planetaId}&vehiculo_id=${naveId}`);
        const planetas = await resPlaneta.json();

        if (!planetas || planetas.length === 0) {
            console.error("El backend no devolvió ningún planeta con ese ID.");
            return;
        }
        if (!planetas[0].disponible) {
            window.location.href = "galaxia.html";// Lo devolvemos al mapa
            mostrarNotificacion("Planeta no dsiponible", "Recorra los demás planetas disponibles para desbloquearlo.", false);
            return;
        }
        const resVehiculos = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}?ubicacion_id=${planetaId}`);
        const vehiculos = await resVehiculos.json();
        const resMisiones = await fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}?cuerpo_celeste_id=${planetaId}&order_by=posicion&order=ASC`);
        const misiones = await resMisiones.json();
        const resEstado = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/${planetaId}`);
        const estado = await resEstado.json();
        if (!estado.planetaCompletado && vehiculoDatos.combustible<100 && !estado.enProgreso){
            return window.location.href = "galaxia.html";
        }
        const puntosCompletados = estado.puntosVisitados.filter(function (mision){ return mision.completado});
        if (!estado.planetaCompletado && misiones.length === puntosCompletados.length){
            if (misiones.length === 0){
                const planetaAgregado = await fetch (`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/${planetaId}/agregar`, {
                    method: "POST"
                });
            }
            const completarPlaneta = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/completar`,{
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cuerpo_celeste_id : planetaId
                })
            });
            const punto = !(await okPunto(naveId));
            const texto = punto ? constantes.PUNTO_DESBLOQUEADO : constantes.ERROR_PUNTO_MAX;
            mostrarNotificacion("¡Planeta Explorado!",
                `Visitaste todos los puntos de interés ${texto}. Podés volver a la galaxia para continuar tu viaje o mejorar tu nave.`,
                false,
                0,
                punto,

            )
        }

        let puntoActual = vehiculoDatos.punto_interes;
        if (vehiculoDatos.ubicacion_id !== planetaId){
            puntoActual = misiones.length !== 0 ? misiones[0].posicion : 1;
            vehiculoDatos.punto_interes = puntoActual;
        }
        if (misiones.length >= 1 && misiones.filter(function (mision) {return mision.posicion === puntoActual}).length === 0){
            vehiculoDatos.punto_interes = misiones[0].posicion;
        }
        const actualizarVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ubicacion_id : planetaId,
                punto_interes: vehiculoDatos.punto_interes
            })
        });
        
        if (misiones.length !== 0 && estado.puntosVisitados.length === 0){
            const primerMision = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/desbloquear`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cuerpo_celeste_id: planetaId, mision_id: misiones[0].id})
            });
        }

               const resDibujado = await dibujarDatosDelPlaneta(planetas[0], misiones, vehiculoDatos, vehiculos); // Esto arma la página
        if (misiones.length !==0 && estado.puntosVisitados.length === 0){ // Gasta combustible si es la primera vez que visita el planeta
            const actualizacionCombustibleVehiculo= await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`, {
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
        pintarVehiculos(vehiculos, vehiculoObjeto);
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
    const { puntosVisitados } = await resProgreso.json();
    let posNave = vehiculoObjetos.punto_interes-1;
    
    misiones.forEach((mision) => {
        const coordenadas = coordenadasVisuales[mision.posicion-1];
        if (!coordenadas) return; 
        
        const divPunto = document.createElement("div");
        divPunto.className = "punto-interes";
        
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
    vehiculo.style.display = "block";
    vehiculo.style.transition = "none";
    vehiculo.style.top = coordenadasVisuales[posNave].top;
    vehiculo.style.left = coordenadasVisuales[posNave].left;
    vehiculo.dataset.indiceActual = posNave;

    setTimeout(() => {
        vehiculo.style.transition = "top 1s ease, left 1s ease"; 
    }, 50);
}

function obtenerImagenNave(vehiculoDatos) {
    const { motor, estructura, resistencia } = vehiculoDatos;
    if (motor >= 3 && estructura >= 3 && resistencia >= 3) {
        return "../assets/img/nivel3.png";
    }
    if (motor >= 2 && estructura >= 2 && resistencia >= 2) {
        return "../assets/img/nivel2.png";
    }
    return "../assets/img/nave1.png";
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
            const estadoPlanetaAntes = await planetaCompletado(cuerpoCelesteId);
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
            if (!data.error) {
                let texto = `Combustible extraído: ${data.combustible}`
                if (estadoPlanetaAntes){
                    texto = "No obtuviste recompensas, el planeta ya estaba completado.";
                }
                if (data.combustible === 0){
                    texto = "Se encontró combustible pero no se pudo aprovechar porque el tanque está lleno.";
                }
                const desbloqueaPunto = !(await okPunto(vehiculoId));
                const completado = estadoPlanetaAntes ? false : data.cuerpoCompletado;
                mostrarNotificacion("¡Misión Completada!", texto, completado, cuerpoCelesteId, desbloqueaPunto);
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

const botonInfo = document.getElementById('botonInfo');
const panelPlaneta = document.getElementById('panelPlaneta');
botonInfo.addEventListener('click', () => {
    panelPlaneta.classList.toggle('abierto');
    botonInfo.classList.toggle('abierto');
    botonInfo.querySelector('.flecha').textContent = panelPlaneta.classList.contains('abierto') ? '‹' : '›';
});
document.addEventListener("DOMContentLoaded", iniciarPlaneta);



async function pintarVehiculos(vehiculos, vehiculoUsado){
    vehiculos.forEach( function (vehiculoActual){
        if (vehiculoActual.id === vehiculoUsado.id){
            return;
        }
        const nave = document.createElement("div");
        nave.className = "vehiculo-desuso";
        nave.style.position = "absolute";
        nave.style.top = coordenadasVisuales[vehiculoActual.punto_interes-1].top;
        nave.style.left = coordenadasVisuales[vehiculoActual.punto_interes-1].left;

        if (vehiculoActual.ubicacion_id === 1) {
            nave.innerHTML = `
                <img src="../assets/img/auto1.png" alt="auto en desuso">
                <p>${vehiculoActual.nombre}</p>
            `;
        } else {
            const imagen = obtenerImagenNave(vehiculoActual);
            nave.innerHTML = `
                <img src= ${imagen} alt="nave en desuso">
                <p>${vehiculoActual.nombre}</p>
            `;
        }
        contenedorMapa.appendChild(nave);
    });
};

async function okPunto (naveId){
    const resPostMejora = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`);
    const postMejora = await resPostMejora.json();
    return (postMejora["motor"]+postMejora["estructura"]+postMejora["resistencia"]+postMejora.puntos >= 9);
};

async function planetaCompletado(cuerpoCelesteId){
    const resCuerpoCeleste = await fetch(`${constantes.API_URL}/${constantes.CUERPOS_URL}/${cuerpoCelesteId}`);
    const cuerpoCeleste = await resCuerpoCeleste.json();
    return cuerpoCeleste.completado;
};
document.addEventListener("DOMContentLoaded", iniciarPlaneta);