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
const botonInfo = document.getElementById('botonInfo');
const panelPlaneta = document.getElementById('panelPlaneta');

// La función verifica que el usuario pueda acceder al planeta y muestra por pantalla todos los datos que contiene el planeta (puntos de interés, fondo, datos
// nave).
async function iniciarPlaneta() {
    const parametros = new URLSearchParams(window.location.search);
    const planetaId = parseInt(parametros.get("id"));
    const naveId = localStorage.getItem("vehiculoSeleccionadoId");
    // Arrancan verificaciones, tiene que devolver el texto de la noti.
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
            console.error("El backend no devolvió ningún planeta con ese ID."); //Sacar
            return;
        }
        if (!planetas[0].disponible) {
            window.location.href = "galaxia.html";// Lo devolvemos al mapa
            await mostrarNotificacion("Planeta no dsiponible", "Recorra los demás planetas disponibles para desbloquearlo.");
            return;
        }
        // Terminan verificaciones
        const resVehiculos = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}?ubicacion_id=${planetaId}`);
        const vehiculos = await resVehiculos.json();
        const resPuntosInteres = await fetch(`${constantes.API_URL}/${constantes.PUNTOS_URL}?cuerpo_celeste_id=${planetaId}&order_by=posicion&order=ASC`);
        const puntosInteres = await resPuntosInteres.json();
        const resEstado = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/${planetaId}`);
        const estado = await resEstado.json();
        if (!estado.planetaCompletado && vehiculoDatos.combustible<100 && !estado.enProgreso){
            return window.location.href = "galaxia.html";
        }
        // Verificación completado
        const puntosCompletados = estado.puntosVisitados.filter(function (puntoInteres){ return puntoInteres.completado});
        if (!estado.planetaCompletado && puntosInteres.length === puntosCompletados.length){
            if (puntosInteres.length === 0){
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
            await mostrarNotificacion("¡Planeta Explorado!",
                `Visitaste todos los puntos de interés ${texto}. Podés volver a la galaxia para continuar tu viaje o mejorar tu nave.`
            )
        }
        // Termina verificación completado

        // Inicializar ubicación
        let puntoActual = vehiculoDatos.punto_interes;
        if (vehiculoDatos.ubicacion_id !== planetaId){
            puntoActual = puntosInteres.length !== 0 ? puntosInteres[0].posicion : 1;
            vehiculoDatos.punto_interes = puntoActual;
        }
        if (puntosInteres.length >= 1 && puntosInteres.filter(function (puntoInteres) {return puntoInteres.posicion === puntoActual}).length === 0){
            vehiculoDatos.punto_interes = puntosInteres[0].posicion;
        }
        const actualizarVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ubicacion_id : planetaId,
                punto_interes: vehiculoDatos.punto_interes
            })
        });
        // Termina inicializar ubicación

        if (puntosInteres.length !== 0 && estado.puntosVisitados.length === 0){
            const primerPuntoInteres = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/desbloquear`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cuerpo_celeste_id: planetaId, punto_interes_id: puntosInteres[0].id})
            });
        }
        const resDibujado = await dibujarDatosDelPlaneta(planetas[0], puntosInteres, vehiculoDatos, vehiculos); // Esto arma la página
        if (puntosInteres.length !==0 && estado.puntosVisitados.length === 0){ // Gasta combustible si es la primera vez que visita el planeta
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

// La función se encarga de mostrar todos los datos del planeta por pantalla
async function dibujarDatosDelPlaneta(planeta, puntosInteres, vehiculoObjeto, vehiculos){
  if(!planeta) return;
  try{
    document.getElementById("nombre-planeta").textContent = planeta.nombre; 
    const ruta = buscarImagenFondo(planeta.imagen_fondo);
    contenedorMapa.style.backgroundImage = `url('${ruta}')`;
    contenedorMapa.style.backgroundSize = "cover"; 
    contenedorMapa.style.backgroundPosition = "center"; 
    contenedorMapa.style.backgroundRepeat = "no-repeat"; 
    rellenarApartadoIzquierda(planeta);
    if (puntosInteres.length !== 0){
        dibujarCamino(puntosInteres);
        pintarPuntosDeInteres(planeta, puntosInteres, vehiculoObjeto);
        pintarVehiculos(vehiculos, vehiculoObjeto);
    }
  } catch (error){
    console.error("Error En la consulta de puntos de interés: ", error);
  }
}

// Devuelve la ruta a la imagen que está asociada con imagenId.
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

// Devuelve la ruta a la imagen que está asociada con imagenId.
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

// La función se encarga de posicionar, mostrar por pantalla e inicializar los los puntos de interés como botón para que muestren la información correspondiente
// y que otorgen recompensas.
async function pintarPuntosDeInteres(cuerpoCeleste, puntosInteres, vehiculoObjetos) {
    if (puntosInteres.length < 1){
        return;
    }

    const resProgreso = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${vehiculoObjetos.id}/${cuerpoCeleste.id}`);
    const { puntosVisitados } = await resProgreso.json();
    let posNave = vehiculoObjetos.punto_interes-1;
    
    puntosInteres.forEach((puntoInteres) => {
        const coordenadas = coordenadasVisuales[puntoInteres.posicion-1];
        if (!coordenadas) return; 
        
        const divPunto = document.createElement("div");
        divPunto.className = "punto-interes";
        
        if (!puntosVisitados.find(function (punto) {return punto.punto_interes_id === puntoInteres.id})) {
            divPunto.classList.add("bloqueado");
        }
        divPunto.style.position = "absolute";
        divPunto.style.top = coordenadas.top;
        divPunto.style.left = coordenadas.left;
        const imagenPunto = buscarImagenPunto(puntoInteres.imagen);
        divPunto.innerHTML = `
            <img src="${imagenPunto}" alt="punto de interés">
            <p>${puntoInteres.nombre}</p>
        `;

        divPunto.addEventListener("click", async () => {
            const exito = await manejarClickPunto(cuerpoCeleste.id, puntoInteres, vehiculoObjetos.id, coordenadas, vehiculo);
            if (exito) {
                divPunto.classList.remove("bloqueado");
            }
        });
        contenedorMapa.appendChild(divPunto);
    });
    // Ver si esto puede ir a otro lado
    vehiculo.style.display = "block";
    vehiculo.style.transition = "none";
    vehiculo.style.top = coordenadasVisuales[posNave].top;
    vehiculo.style.left = coordenadasVisuales[posNave].left;
    vehiculo.dataset.indiceActual = posNave;

    setTimeout(() => {vehiculo.style.transition = "top 1s ease, left 1s ease"}, 50);
    // Hasta acá
}

// La función devuelve la imagen de la nave correspondiente según sus atributos.
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

// La función inicializa los valores dentro del apartado con información del cuerpo celeste utilizando cuerpo_celeste.
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

async function manejarClickPunto(cuerpoCelesteId, puntoInteres, vehiculoId, coordenadasDestino, vehiculoDOM) {
    const estamosAhi = ((vehiculoDOM.style.top === coordenadasDestino.top) && (vehiculoDOM.style.left === coordenadasDestino.left));
    if (estamosAhi) {
        try {
            const estadoPlanetaAntes = await planetaCompletado(cuerpoCelesteId);
            const resExplorar = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${vehiculoId}/explorar`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cuerpo_celeste_id: cuerpoCelesteId, punto_interes_id: puntoInteres.id })
            });
            const data = await resExplorar.json();
            
            if (data.error === constantes.ERROR_DISPONIBLE) { 
                console.warn(data.error);
                return false;
            }
            
            document.getElementById("puntoNombre").textContent = puntoInteres.nombre;
            document.getElementById("puntoDescripcion").textContent = puntoInteres.descripcion;
            panelPunto.classList.add("visible");
            if (!data.error) {
                let texto = `Combustible extraído: ${data.combustible}`
                if (estadoPlanetaAntes){
                    texto = "No obtuviste recompensas, el planeta ya estaba completado.";
                }
                if (data.combustible === 0){
                    texto = "Se encontró combustible pero no se pudo aprovechar porque el tanque está lleno.";
                }
                const desbloqueaPuntoMejora = !(await okPunto(vehiculoId));
                const completado = estadoPlanetaAntes ? false : data.cuerpoCompletado;
                await mostrarNotificacion("Punto Completado!", texto);
                if (data.cuerpoCompletado){
                    let textoMejora;
                    if (cuerpoCelesteId !== 1){
                        textoMejora = desbloqueaPuntoMejora ? constantes.PUNTO_DESBLOQUEADO : constantes.ERROR_PUNTO_MAX;
                    }
                    if (cuerpoCelesteId === 1){
                        textoMejora = "y fuiste recompensado con una nave";
                    }
                    await mostrarNotificacion(
                        "¡Planeta Explorado!", 
                        `Visitaste todos los puntos de interés ${textoMejora}. Podés volver a la galaxia para continuar tu viaje o mejorar tu nave.`
                    );
                }
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
                body: JSON.stringify({ cuerpo_celeste_id: cuerpoCelesteId, punto_interes_id: puntoInteres.id })
            });
            const data = await resDesbloquear.json();

            if (!resDesbloquear.ok) {
                await mostrarNotificacion("Ruta Inválida", data.error || "Debe explorar el punto anterior primero.");
                return false;
            }

            viajarHacia(coordenadasDestino);
            const actualizacionUbicacionVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ punto_interes: puntoInteres.posicion})
            });
            return true;
        } catch (error) {
            console.error("Error de red al desbloquear:", error);
            return false;
        }
    }
}

// La función mueve a la nave de un punto de interés a otro a otro. Bloquea las interacciones mientras la nave se mueve.
function viajarHacia(coordenadas) {
    document.body.classList.add("bloqueado-viajando");
    vehiculo.style.top = coordenadas.top;
    vehiculo.style.left = coordenadas.left;

    setTimeout(() => {
        document.body.classList.remove("bloqueado-viajando");
    }, 1000); 
}

// La función dibuja el camino entre los puntos de interés pasados por parámetro.
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

botonInfo.addEventListener('click', () => {
    panelPlaneta.classList.toggle('abierto');
    botonInfo.classList.toggle('abierto');
    botonInfo.querySelector('.flecha').textContent = panelPlaneta.classList.contains('abierto') ? '‹' : '›';
});

// La función crea el div y ubica cada nave excepto la del usuario. 
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
                <img src="../assets/img/auto1.png">
                <p>${vehiculoActual.nombre}</p>
            `;
        } else {
            const imagen = obtenerImagenNave(vehiculoActual);
            nave.innerHTML = `
                <img src= ${imagen}>
                <p>${vehiculoActual.nombre}</p>
            `;
        }
        contenedorMapa.appendChild(nave);
    });
};

// La función trae del backend el estado del punto de interés y si está completado devuelve true, sino false.
async function okPunto (naveId){
    const resPostMejora = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`);
    const postMejora = await resPostMejora.json();
    return (postMejora["motor"]+postMejora["estructura"]+postMejora["resistencia"]+postMejora.puntos >= 9);
};

// La función trae del backend el estado del cuerpo celeste respectoy si está completado devuelve true, sino false.
async function planetaCompletado(cuerpoCelesteId){ // Pedir por parámetro vehiculoId también
    const resCuerpoCeleste = await fetch(`${constantes.API_URL}/${constantes.CUERPOS_URL}/${cuerpoCelesteId}`); // CAmbiar el endpoint a progreso
    const cuerpoCeleste = await resCuerpoCeleste.json();
    return cuerpoCeleste.completado;
};

document.addEventListener("DOMContentLoaded", iniciarPlaneta);