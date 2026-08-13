import * as constantes from "../constantes.js";

// La función verifica que naveId, planetaId y planetas existan. Si es correcto, retorna planetas, sino
// redirige al usuario a galaxia.html. 
export async function verificarDisponiblidad(naveId, planetaId){
        if (!naveId) {
        window.location.href = "usuario.html";
        return;
    }
    if (!planetaId) {
        window.location.href = "galaxia.html"; 
        return;
    }
        const resPlaneta = await fetch(`${constantes.API_URL}/${constantes.CUERPOS_URL}/?id=${planetaId}&vehiculo_id=${naveId}`);
        const planetas = await resPlaneta.json();

    if (!planetas || planetas.length === 0 || !planetas[0].disponible) {
        window.location.href = "galaxia.html"; 
        return;
    }
    return planetas;
}

// La función trae del backend el estado del punto de interés y si está completado devuelve true, sino false.
export async function okPunto (naveId){
    const resPostMejora = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${naveId}`);
    const postMejora = await resPostMejora.json();
    return (postMejora["motor"]+postMejora["estructura"]+postMejora["resistencia"]+postMejora.puntos >= 9);
};

// La función trae del backend el estado del cuerpo celeste respecto al vehículo asociado a vehiculoId
// y si está completado devuelve true, sino false.
export async function planetaCompletado(cuerpoCelesteId, vehiculoId){ // Pedir por parámetro vehiculoId también
    const resCuerpoCeleste = await fetch(`${constantes.API_URL}/${constantes.PROGRESO_URL}/${vehiculoId}/${cuerpoCelesteId}`);
    const cuerpoCeleste = await resCuerpoCeleste.json();
    return cuerpoCeleste.planetaCompletado;
};



// La función agrega y completa el planeta relacionado a planetaId en relación al vehíulo asociado a naveId si no
// estaba completo y debía estarlo previamente. Retorna tituloCompletado y textoCompletado con cadenas vacías en
// caso de estar completo, sino retorna los mensajes a imprimir por pantalla.
export async function estaCompletado(estado, puntosInteres, naveId, planetaId){
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
        return {tituloCompletado: "¡Planeta Explorado!", textoCompletado: `Visitaste todos los puntos de interés ${texto}. Podés volver a la galaxia para continuar tu viaje o mejorar tu nave.`};
    }
    return {tituloCompletado: "", textoCompletado: ""};
}
