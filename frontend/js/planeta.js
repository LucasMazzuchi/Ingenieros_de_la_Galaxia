import * as constantes from "./constantes.js";

const contenedorMapa = document.getElementById("mapa-planeta");
const panelPunto = document.getElementById("panelPunto");
const vehiculo = document.getElementById("vehiculo");

//Chequea que pueda ingresar al planeta.
async function iniciarPlaneta() {
    // 1. Leemos a qué planeta intentó entrar desde la URL
    const parametros = new URLSearchParams(window.location.search);
    const planetaId = parametros.get("id");

    if (!planetaId) {
        window.location.href = "galaxia.html"; // si no hay ID, retorna
        return;
    }
    const tipoVehiculo = (planetaId === "1") ? 2 : 1;
    vehiculo.src = (tipoVehiculo === 2) ? "../assets/img/auto1.png" : "../assets/img/nave1.png";
    try {
        const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}?tipo=1`);
        const vehiculoDatos = await resVehiculo.json();

        const resPlaneta = await fetch(`${constantes.API_URL}/${constantes.CUERPOS_URL}/?id=${planetaId}&vehiculo_id=${vehiculoDatos[0].id}`);
        const planetas = await resPlaneta.json();

        if (!planetas || planetas.length === 0) {
            console.error("El backend no devolvió ningún planeta con ese ID.");
            return;
        }

        if (!planetas[0].disponible) {
            window.location.href = "galaxia.html"; // Lo devolvemos al mapa
            return;
        }
        const resMisiones = await fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}?cuerpo_celeste_id=${planetas[0].id}&order_by=id&order=ASC`);
        const misiones = await resMisiones.json();
        if (vehiculoDatos[0].combustible<100 && misiones.filter(function (mision) {return mision.disponible}).length===0){
            window.location.href = "galaxia.html";
        }
        const vehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoDatos[0].id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ubicacion_id : planetas[0].id
                })
            });
        const misionesEstadoInicial = await dibujarDatosDelPlaneta(planetas[0], misiones); // Esto arma la página
        if (misionesEstadoInicial.filter(function (mision){return mision.porcentaje===100}).length !== misionesEstadoInicial.length){
            const actualizacionCombustibleVehiculo= await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoDatos[0].id}`, { // Actualizo ubicación de la nave.
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ combustible: 0})
                });
        }
        document.getElementById("botonVolver").addEventListener("click", function () {
        logicaVolver(planetas[0].id, vehiculoDatos[0],misionesEstadoInicial);
        });
    } catch (error) {
        console.error("Error validando acceso:", error);
    }
}

async function dibujarDatosDelPlaneta(planeta, misiones){
  try{
    document.getElementById("nombre-planeta").textContent = planeta.nombre; // Cambia el nombre
    const ruta = buscarImagen(planeta.imagen_fondo);
    contenedorMapa.style.backgroundImage = `url('${ruta}')`;
    contenedorMapa.style.backgroundSize = "cover"; // acomoda el tamaño de la imagen al del fondo.
    contenedorMapa.style.backgroundPosition = "center"; // centrado.
    contenedorMapa.style.backgroundRepeat = "no-repeat"; // No se duplica el mosaico.
    pintarPuntosDeInteres(misiones);
    dibujarCamino(misiones);
    rellenarApartadoIzquierda(planeta);
    return misiones;
  } catch (error){
    console.error("Error En la consulta de misiones: ", error);
  }
}

async function logicaVolver(planetaId, vehiculoDatos, misionesEstadoInicial) {
    try {
        if (misionesEstadoInicial.filter(function (mision){return mision.porcentaje===100}).length === misionesEstadoInicial.length){
        return;
        }
        const resMisiones = await fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}?cuerpo_celeste_id=${planetaId}&order_by=id&order=ASC`);
        const misiones = await resMisiones.json();
        const misionesCompletadas = misiones.filter(function (mision){
            return mision.porcentaje===100;
            });
        if ((misiones.length === 0) || (misionesCompletadas.length !== misiones.length)) {
            return;
        }
        const campos = ["motor", "estructura", "resistencia"]
        let campoMejora = campos[0];
        campos.forEach(function (campo){
            if (vehiculoDatos[campo]<vehiculoDatos[campoMejora]){
                campoMejora = campo;
            }
        });
        if (vehiculoDatos[campoMejora] < 3) {
            await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoDatos.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    combustible: 100,
                    [campoMejora]: vehiculoDatos[campoMejora] + 1
                })
            });
        }
    } catch (error) {
        console.error("Error al mejorar la nave:", error);
    } finally { //redirige al usuario a la página con todos los planetas.
        window.location.href = "galaxia.html";
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

    async function pintarPuntosDeInteres(misiones) {
    // 1. Agrupamos tus constantes sueltas en un molde para poder iterarlas
    const coordenadasVisuales = [
        { top: constantes.PUNTO1_TOP, left: constantes.PUNTO1_LEFT },
        { top: constantes.PUNTO2_TOP, left: constantes.PUNTO2_LEFT },
        { top: constantes.PUNTO3_TOP, left: constantes.PUNTO3_LEFT }
    ];

    misiones.forEach((mision, indice) => {
        const coordenadas = coordenadasVisuales[indice];
        //Si hay más de 3 msiones, se ignoran. 
        if (!coordenadas) return; 
        if (indice === 0 && !mision.disponible){
            const resDisponible = fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}/${mision.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ disponible: true })
            });
        }
        const divPunto = document.createElement("div");
        divPunto.className = "punto-interes";
        if (indice > 0 && !(misiones[indice].disponible)) { // Si está bloqueada, la diferencia visualmente.
            divPunto.classList.add("bloqueado");
        }
        divPunto.style.position = "absolute";
        divPunto.style.top = coordenadas.top;
        divPunto.style.left = coordenadas.left;

        divPunto.innerHTML = `
            <img src="../assets/img/marcador.png" alt="punto de interés">
            <p>${mision.nombre}</p>
        `;

        divPunto.addEventListener("click", () => {
            const completado = manejarClickPunto(mision, indice, coordenadas);
            if (completado){
                divPunto.classList.remove("bloqueado"); // Le saco la capa de bloqueado
            }
        });

        contenedorMapa.appendChild(divPunto);
    
    });
    // 2. Ubicamos la nave en la Misión 0 al arrancar
    if (misiones.length > 0) {
        vehiculo.style.transition = "none";
        vehiculo.style.top = coordenadasVisuales[0].top;
        vehiculo.style.left = coordenadasVisuales[0].left;
        vehiculo.dataset.indiceActual = 0;

        setTimeout(() => {
            vehiculo.style.transition = "top 1s ease, left 1s ease"; 
        }, 50);
    }
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

    async function manejarClickPunto(mision, indiceProximo, coordenadasDestino) {
        const estamosAhi = ((vehiculo.style.top === coordenadasDestino.top) && (vehiculo.style.left === coordenadasDestino.left));
        if (estamosAhi) {
        // Si ya está parado ahí, abrimos la información
        document.getElementById("puntoNombre").textContent = mision.nombre;
        document.getElementById("puntoDescripcion").textContent = mision.descripcion;
        panelPunto.classList.add("visible");
        if (mision.porcentaje !== 100){
        const completarMision = await fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}/${mision.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ porcentaje: 100 })
            });
            if (completarMision.ok) {
                // Actualizamos el objeto local para evitar falsos negativos
                mision.porcentaje = 100; 
                
                // Obtenemos el ID del planeta actual desde la URL
                const parametros = new URLSearchParams(window.location.search);
                const planetaId = parametros.get("id");
                
                // Verificamos si completó el planeta
                await verificarPlanetaCompletado(planetaId);
            }
            }
        } else {
        const respuestaVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}?tipo=1`);
        const datosVehiculo = await respuestaVehiculo.json();
        if (Math.abs(datosVehiculo[0].punto_interes-indiceProximo) > 1){
            mostrarNotificacion("Ruta Inválida", "Debe moverse primero a la misión más cercana.");
            return;
        }
        const resMover = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${datosVehiculo[0].id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ punto_interes: indiceProximo })
        });
        if (resMover.ok && !mision.disponible){
            const completarMision = await fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}/${mision.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ disponible: true })
            });

        }
        if (resMover.ok){
            viajarHacia(coordenadasDestino);;
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