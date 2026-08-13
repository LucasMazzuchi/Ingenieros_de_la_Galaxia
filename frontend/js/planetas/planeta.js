import * as constantes from "../constantes.js";
import { mostrarNotificacion } from "../notificaciones.js";
import * as imagenes from "./obtener_imagenes.js";
import * as salida from "./salida_dinamica.js";
import * as verificaciones from "./verificaciones_planeta.js";

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
    try {
        const planetas = await verificaciones.verificarDisponiblidad(naveId, planetaId);
        const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`);
        const vehiculoDatos = await resVehiculo.json();
        vehiculo.src = (planetaId === 1) ? "../assets/img/auto1.png" : imagenes.obtenerImagenNave(vehiculoDatos);
        const resVehiculos = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}?ubicacion_id=${planetaId}`);
        const vehiculos = await resVehiculos.json();
        const resPuntosInteres = await fetch(`${constantes.API_URL}/${constantes.PUNTOS_URL}?cuerpo_celeste_id=${planetaId}&order_by=posicion&order=ASC`);
        const puntosInteres = await resPuntosInteres.json();
        const resEstado = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${naveId}/${planetaId}`);
        const estado = await resEstado.json();
        if (!estado.planetaCompletado && vehiculoDatos.combustible<100 && !estado.enProgreso){
            return window.location.href = "galaxia.html";
        }
        const {tituloCompletado, textoCompletado} = await verificaciones.estaCompletado(estado, puntosInteres, naveId, planetaId);
        if (tituloCompletado.length !== 0){
            await mostrarNotificacion(tituloCompletado, textoCompletado);
        }
        vehiculoDatos.punto_interes = await inicializarUbicacion(vehiculoDatos, puntosInteres, naveId, planetaId);
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
};

// La función se encarga de mostrar todos los datos del planeta por pantalla
async function dibujarDatosDelPlaneta(planeta, puntosInteres, vehiculoObjeto, vehiculos){
  try{
    document.getElementById("nombre-planeta").textContent = planeta.nombre; 
    const ruta = imagenes.buscarImagenFondo(planeta.imagen_fondo);
    contenedorMapa.style.backgroundImage = `url('${ruta}')`;
    contenedorMapa.style.backgroundSize = "cover";
    contenedorMapa.style.backgroundPosition = "center";
    contenedorMapa.style.backgroundRepeat = "no-repeat";
    salida.rellenarApartadoIzquierda(planeta);
    if (puntosInteres.length !== 0){
        salida.dibujarCamino(puntosInteres);
        pintarPuntosDeInteres(planeta, puntosInteres, vehiculoObjeto);
        salida.pintarVehiculos(vehiculos, vehiculoObjeto);
    }
  } catch (error){
    console.error("Error En la consulta de puntos de interés: ", error);
  }
};

// La función se encarga de posicionar, mostrar por pantalla e inicializar los los puntos de interés como botón para que muestren la información correspondiente
// y que otorgen recompensas.
async function pintarPuntosDeInteres(cuerpoCeleste, puntosInteres, vehiculoObjetos) {
    const resProgreso = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${vehiculoObjetos.id}/${cuerpoCeleste.id}`);
    const { puntosVisitados } = await resProgreso.json();
    let posNave = vehiculoObjetos.punto_interes-1;
    puntosInteres.forEach((puntoInteres) => { 
        const coordenadas = coordenadasVisuales[puntoInteres.posicion-1];
        const divPunto = salida.crearDivPunto(puntosVisitados, cuerpoCeleste, vehiculoObjetos, puntoInteres, coordenadas);
        divPunto.addEventListener("click", async () => {
        const exito = await manejarClickPunto(cuerpoCeleste.id, puntoInteres, vehiculoObjetos.id, coordenadas, vehiculo);
        if (exito) {
            divPunto.classList.remove("bloqueado");
        }
        });
        contenedorMapa.appendChild(divPunto);
    });
    salida.crearTransicion(posNave, vehiculo, coordenadasVisuales);
};

async function manejarClickPunto(cuerpoCelesteId, puntoInteres, vehiculoId, coordenadasDestino, vehiculoDOM) {
    const estamosAhi = ((vehiculoDOM.style.top === coordenadasDestino.top) && (vehiculoDOM.style.left === coordenadasDestino.left));
    if (estamosAhi) {
        try {
            const estadoPlanetaAntes = await verificaciones.planetaCompletado(cuerpoCelesteId, vehiculoId);
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
                console.log("estadoPlanetaAntes", estadoPlanetaAntes);
                if (estadoPlanetaAntes){
                    texto = "No obtuviste recompensas, el planeta ya estaba completado.";
                } else if (data.combustible === 0){
                    texto = "Se encontró combustible pero no se pudo aprovechar porque el tanque está lleno.";
                }
                const desbloqueaPuntoMejora = !(await verificaciones.okPunto(vehiculoId));
                const completado = estadoPlanetaAntes ? false : data.cuerpoCompletado;
                await mostrarNotificacion("Punto Completado!", texto);
                if (completado){
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

            salida.viajarHacia(coordenadasDestino, vehiculo);
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
};
// Probar de meter en iniciar a lo último
document.getElementById("btnCerrarPanelPunto").addEventListener("click", () => {
    panelPunto.classList.remove("visible");
});

// Probar de meter en iniciar a lo último
botonInfo.addEventListener('click', () => {
    panelPlaneta.classList.toggle('abierto');
    botonInfo.classList.toggle('abierto');
    botonInfo.querySelector('.flecha').textContent = panelPlaneta.classList.contains('abierto') ? '‹' : '›';
});

async function inicializarUbicacion(vehiculoDatos, puntosInteres, naveId, planetaId) {
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
    return vehiculoDatos.punto_interes;
};
document.addEventListener("DOMContentLoaded", iniciarPlaneta);