import * as constantes from "../constantes.js";
import * as verificaciones from "./verificaciones_planeta.js";
import * as busqueda from "./obtener_imagenes_textos.js";

export async function inicializarUbicacion(vehiculoDatos, puntosInteres, naveId, planetaId) {
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

export async function completarPuntoInteres(cuerpoCelesteId, vehiculoId, puntoInteres, panelPunto){
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
            return {textoCombustible: "", textoMejora: ""};
        }
        document.getElementById("puntoNombre").textContent = puntoInteres.nombre;
        document.getElementById("puntoDescripcion").textContent = puntoInteres.descripcion;
        panelPunto.classList.add("visible");
        if (!data.error){

            const textoCombustible = await busqueda.obtenerTextoCombustible(data.combustible, estadoPlanetaAntes);
            const completado = estadoPlanetaAntes ? false : data.cuerpoCompletado;
            let textoMejora = completado ? await busqueda.obtenerTextoMejora(vehiculoId, cuerpoCelesteId) : "";
            return { textoCombustible: textoCombustible, textoMejora: textoMejora };
        }
        return {textoCombustible: "", textoMejora: ""};
    } catch (error) {
        console.error("Error de red al explorar:", error);
        return { textoCombustible: "", textoMejora: "" };
    }
};

export async function desbloquearPuntoInteres(vehiculoId, cuerpoCelesteId, puntoInteres){
    try {
        const resDesbloquear = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${vehiculoId}/desbloquear`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cuerpo_celeste_id: cuerpoCelesteId, punto_interes_id: puntoInteres.id })
        });
        const data = await resDesbloquear.json();
        if (!resDesbloquear.ok) {
            const textoError = data.error || "Debe explorar el punto anterior primero.";
            return {tituloError: "Ruta Inválida", textoError: textoError};
        }
        const actualizacionUbicacionVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ punto_interes: puntoInteres.posicion})
        });
        return {tituloError: "", textoError: ""};
    } catch (error) {
        return {tituloError: "Error de red al desbloquear:", textoError: error};
    }
}