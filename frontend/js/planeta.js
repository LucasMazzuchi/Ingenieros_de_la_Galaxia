import * as constantes from "./constantes.js";

const contenedorMapa = document.getElementById("mapa-planeta");
const panelPunto = document.getElementById("panelPunto");
const vehiculo = document.getElementById("vehiculo");

//Chequea que pueda ingresar al planeta.
async function iniciarPlaneta() {
    // 1. Leemos a qué planeta intentó entrar desde la URL
    const parametros = new URLSearchParams(window.location.search);
    const planetaId = parseInt(parametros.get("id"));
    const naveId = localStorage.getItem("vehiculoSeleccionadoId");
    if (!naveId) {
        window.location.href = "usuario.html";
        return;
    }


    if (!planetaId) {
        window.location.href = "galaxia.html"; // si no hay ID, retorna
        return;
    }

    const tipoVehiculo = (planetaId === 1) ? 2 : 1;
    vehiculo.src = (tipoVehiculo === 2) ? "../assets/img/auto1.png" : "../assets/img/nave1.png";
    try {
        const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`); //Acá hay que traerse al id del vehículo.
        const vehiculoDatos = await resVehiculo.json();
        const resPlaneta = await fetch(`${constantes.API_URL}/${constantes.CUERPOS_URL}/?id=${planetaId}&vehiculo_id=${naveId}`);
        const planetas = await resPlaneta.json();

        if (!planetas || planetas.length === 0) {
            console.error("El backend no devolvió ningún planeta con ese ID.");
            return;
        }
        console.log("planeta actual: " ,planetas[0]);
        if (!planetas[0].disponible) {
            alert("Planeta no dsiponible, recorre los demás planetas disponibles para desbloquearlo.");
            window.location.href = "galaxia.html"; // Lo devolvemos al mapa
            return;
        }
        const resMisiones = await fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}?cuerpo_celeste_id=${planetaId}&order_by=posicion&order=ASC`);
        const misiones = await resMisiones.json();
        const resEstado = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/${planetaId}`);
        const estado = await resEstado.json();
        console.log("Ver si esta en Progreso",estado);
        if (!estado.planetaCompletado && vehiculoDatos.combustible<100 && !estado.enProgreso){
            alert("Combustible insuficiente, completa todos los puntos de interés del planeta donde está la nave para poder viajar a otro.")
            return window.location.href = "galaxia.html";
        }


        console.log("Estado actual: ",estado);
        console.log("Está vacío", estado.puntosVisitados.length === 0);
        console.log("punto_interes viejo", vehiculoDatos.punto_interes);
        console.log("if: ", vehiculoDatos.ubicacion_id !== planetaId);
        let puntoActual = vehiculoDatos.punto_interes;
        if (vehiculoDatos.ubicacion_id !== planetaId){
            puntoActual = 1;
            vehiculoDatos.punto_interes = puntoActual;
        }
        console.log("Pos nueva:",vehiculoDatos.punto_interes);
        const actualizarVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ubicacion_id : planetaId,
                punto_interes: puntoActual
            })
        });
        
        if (estado.puntosVisitados.length === 0){
            const primerMision = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/desbloquear`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cuerpo_celeste_id: planetaId, mision_id: misiones[0].id})
                });
            console.log("estado Actulización misión 1", primerMision);
        }

        const resDibujado = await dibujarDatosDelPlaneta(planetas[0], misiones, vehiculoDatos); // Esto arma la página
        console.log("Puntos Visitados",estado.puntosVisitados.length);
        if (estado.puntosVisitados.length === 0){ // Gasta combustible si es la primera vez que visita el planeta
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
        console.log(error)
    }
}

async function dibujarDatosDelPlaneta(planeta, misiones, vehiculoObjeto){
  try{
    document.getElementById("nombre-planeta").textContent = planeta.nombre; // Cambia el nombre
    const ruta = buscarImagen(planeta.imagen_fondo);
    contenedorMapa.style.backgroundImage = `url('${ruta}')`;
    contenedorMapa.style.backgroundSize = "cover"; // acomoda el tamaño de la imagen al del fondo.
    contenedorMapa.style.backgroundPosition = "center"; // centrado.
    contenedorMapa.style.backgroundRepeat = "no-repeat"; // No se duplica el mosaico.
    pintarPuntosDeInteres(planeta, misiones, vehiculoObjeto);
    dibujarCamino(misiones);
    rellenarApartadoIzquierda(planeta);
  } catch (error){
    console.error("Error En la consulta de misiones: ", error);
  }
}

function buscarImagen(imagenId) {
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

async function pintarPuntosDeInteres(cuerpoCeleste, misiones, vehiculoObjetos) {
        if (misiones.length < 1){
        return;
    }
    const coordenadasVisuales = [
        { top: constantes.PUNTO1_TOP, left: constantes.PUNTO1_LEFT },
        { top: constantes.PUNTO2_TOP, left: constantes.PUNTO2_LEFT },
        { top: constantes.PUNTO3_TOP, left: constantes.PUNTO3_LEFT }
    ];

    const resProgreso = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${vehiculoObjetos.id}/${cuerpoCeleste.id}`);
    const { puntosVisitados } = await resProgreso.json();
    console.log("Primer posición", vehiculoObjetos.punto_interes);
    let posNave= vehiculoObjetos.punto_interes-1;
    const resMisionesEstado = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${vehiculoObjetos.id}/${cuerpoCeleste.id}`);
    const misionesEstado = await resMisionesEstado.json();
    console.log(misionesEstado);
    misiones.forEach((mision, indice) => {
        const coordenadas = coordenadasVisuales[indice];
        if (!coordenadas) return; 
        const divPunto = document.createElement("div");
        divPunto.className = "punto-interes";
        if (!puntosVisitados.find(function (punto) {return punto.mision_id === mision.id})) {
            divPunto.classList.add("bloqueado");
        }

        divPunto.style.position = "absolute";
        divPunto.style.top = coordenadas.top;
        divPunto.style.left = coordenadas.left;

        divPunto.innerHTML = `
            <img src="../assets/img/marcador.png" alt="punto de interés">
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
    console.log("posicion", posNave)
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

            if (resExplorar.error === constantes.ERROR_DISPONIBLE) {
                console.warn(data.error);
                return false;
            }
            document.getElementById("puntoNombre").textContent = mision.nombre;
            document.getElementById("puntoDescripcion").textContent = mision.descripcion;
            panelPunto.classList.add("visible");
            if (!data.error){
                mostrarNotificacion("¡Misión Completada!", `Combustible extraído: ${data.combustible}`);
            }
            if (data.cuerpoCompletado) {
                mostrarNotificacion("¡Planeta Superado!", "Has completado todas las misiones aquí.");
            }

            return true;
        } catch (error) {
            console.error("Error de red al explorar:", error);
            return false;
        }
// Falta debuggear endpoint resDesbloquear
    } else {
        try {
            const resDesbloquear = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${vehiculoId}/desbloquear`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cuerpo_celeste_id: cuerpoCelesteId, mision_id: mision.id })
            });
            const data = await resDesbloquear.json();

            if (!resDesbloquear.ok) {
                mostrarNotificacion("Ruta Inválida", data.error || "Debe explorar el punto anterior primero.");
                return false;
            }

            viajarHacia(coordenadasDestino);
            const actualizacionUbicacionVehiculo= await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoId}`, {
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
    // Bloqueamos los clicks
    document.body.classList.add("bloqueado-viajando");


    vehiculo.style.top = coordenadas.top;
    vehiculo.style.left = coordenadas.left;

    // Desbloqueamos cuando termina de moverse
    setTimeout(() => {
        document.body.classList.remove("bloqueado-viajando");
    }, 1000); 
}

function dibujarCamino(puntosDeInteres){
    const camino = document.getElementById("camino-polyline");
    if (puntosDeInteres.length ===2) {
        camino.setAttribute("points", constantes.COORDENADAS_SVG.slice(0,2).join(" "));
    } else if (puntosDeInteres.length === 3){
        camino.setAttribute("points", constantes.COORDENADAS_SVG.join(" "));
    } else {
        camino.setAttribute("points", " ");
    }
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

// Función reutilizable para mostrar notificaciones en pantalla
function mostrarNotificacion(titulo, texto) {
    // Evita duplicar el cartel si ya hay uno abierto
    if (document.getElementById("cartelNotificacion")) return;

    const modal = document.createElement("div");
    modal.id = "cartelNotificacion";
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.7);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000; backdrop-filter: blur(4px);
    `;

    modal.innerHTML = `
        <div style="background: linear-gradient(145deg, #0f172a, #1e293b); border: 2px solid #0ea5e9; border-radius: 12px; padding: 40px; text-align: center; color: white; max-width: 450px; box-shadow: 0 0 20px rgba(14, 165, 233, 0.4);">
            <h2 style="color: #38bdf8; margin-bottom: 15px; font-size: 1.8rem; text-transform: uppercase; letter-spacing: 1px;">${titulo}</h2>
            <p style="font-size: 1.1rem; margin-bottom: 25px; line-height: 1.5; color: #cbd5e1;">${texto}</p>
            <button id="btnCerrarNotificacion" style="background: #0ea5e9; color: #fff; border: none; padding: 12px 25px; font-size: 1rem; font-weight: bold; border-radius: 6px; cursor: pointer; text-transform: uppercase; transition: background 0.2s;">
                Entendido
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("btnCerrarNotificacion").addEventListener("click", () => {
        modal.remove();
    });
}
async function verificarPlanetaCompletado(planetaId) {
    try {
        const resMisiones = await fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}?cuerpo_celeste_id=${planetaId}`);
        const misiones = await resMisiones.json();
        
        // Verifica si hay misiones y si TODAS tienen porcentaje 100
        const todasCompletadas = misiones.length > 0 && misiones.every(m => m.porcentaje === 100);
        
        if (todasCompletadas) {
            mostrarNotificacion(
                "¡Planeta Explorado!", 
                "Has recolectado todos los datos de este sector. Ya puedes volver a la galaxia para continuar tu viaje o mejorar tu nave."
            );
        }
    } catch (error) {
        console.error("Error al verificar el estado del planeta:", error);
    }
}