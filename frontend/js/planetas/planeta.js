import * as constantes from "../constantes.js";
import { mostrarNotificacion } from "../notificaciones.js";
import * as busqueda from "./obtener_imagenes_textos.js";
import * as salida from "./salida_dinamica.js";
import * as verificaciones from "./verificaciones_planeta.js";
import * as logica from "./logica.js";
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
        const {planetas, vehiculoDatos, vehiculos, puntosInteres, estado} = await logica.obtenerDatos(naveId, planetaId, vehiculo);
        if (!estado.planetaCompletado && vehiculoDatos.combustible<100 && !estado.enProgreso){
            return window.location.href = "galaxia.html";
        }
        const {tituloCompletado, textoCompletado} = await verificaciones.estaCompletado(estado, puntosInteres, naveId, planetaId);
        if (tituloCompletado.length !== 0){
            await mostrarNotificacion(tituloCompletado, textoCompletado);
        }
        vehiculoDatos.punto_interes = await logica.inicializarUbicacion(vehiculoDatos, puntosInteres, naveId, planetaId);
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
        document.getElementById("btnCerrarPanelPunto").addEventListener("click", () => {
            panelPunto.classList.remove("visible");
        });
        botonInfo.addEventListener('click', () => {
            panelPlaneta.classList.toggle('abierto');
            botonInfo.classList.toggle('abierto');
            botonInfo.querySelector('.flecha').textContent = panelPlaneta.classList.contains('abierto') ? '‹' : '›';
        });

        
    } catch (error) {
        console.error("Error en iniciarPlaneta:", error);
    }
};

// La función se encarga de mostrar todos los datos del planeta por pantalla
async function dibujarDatosDelPlaneta(planeta, puntosInteres, vehiculoObjeto, vehiculos){
  try{
    document.getElementById("nombre-planeta").textContent = planeta.nombre; 
    const ruta = busqueda.buscarImagenFondo(planeta.imagen_fondo);
    contenedorMapa.style.backgroundImage = `url('${ruta}')`;
    contenedorMapa.style.backgroundSize = "cover";
    contenedorMapa.style.backgroundPosition = "center";
    contenedorMapa.style.backgroundRepeat = "no-repeat";
    salida.rellenarApartadoIzquierda(planeta);
    if (puntosInteres.length !== 0){
        salida.dibujarCamino(puntosInteres);
        pintarPuntosDeInteres(planeta, puntosInteres, vehiculoObjeto);
        salida.pintarVehiculos(vehiculos, vehiculoObjeto, coordenadasVisuales, contenedorMapa);
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
        const {textoCombustible, textoMejora} = await logica.completarPuntoInteres(cuerpoCelesteId, vehiculoId, puntoInteres, panelPunto)
        if (textoCombustible.length !== 0){
            await mostrarNotificacion("Punto Completado!", textoCombustible);
        }
        if (textoMejora.length !== 0){
            await mostrarNotificacion(
                "¡Planeta Explorado!", 
                `Visitaste todos los puntos de interés ${textoMejora}. Podés volver a la galaxia para continuar tu viaje o mejorar tu nave.`
            );
        }
        return false;
    } else {
        const {tituloError, textoError} = await logica.desbloquearPuntoInteres(vehiculoId, cuerpoCelesteId, puntoInteres);
        if (tituloError.length !== 0){
            await mostrarNotificacion(tituloError, textoError);
            return false;
        }
        salida.viajarHacia(coordenadasDestino, vehiculo);
        return true;
    }
};
document.addEventListener("DOMContentLoaded", iniciarPlaneta);