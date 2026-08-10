import {PUNTO_DESBLOQUEADO, ERROR_PUNTO_MAX} from "./constantes.js";
export function mostrarNotificacion(titulo, texto, cuerpoCompletado, cuerpoCelesteId = 0, punto = true, naveMejorada = 0) {
    // Evita duplicar el cartel si ya hay uno abierto
    if (document.getElementById("cartelNotificacion")) return;

    const modal = document.createElement("div");
    modal.id = "cartelNotificacion";
    
    modal.innerHTML = `
        <div class="notificacion-caja">
            <h2 class="notificacion-titulo">${titulo}</h2>
            <p class="notificacion-texto">${texto}</p>
            <button id="btnCerrarNotificacion" class="notificacion-boton">
                Entendido
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("btnCerrarNotificacion").addEventListener("click", () => {
        modal.remove();
        if (cuerpoCompletado && cuerpoCelesteId !== 1){
            const texto = punto ? PUNTO_DESBLOQUEADO : ERROR_PUNTO_MAX;
            mostrarNotificacion(
                "¡Planeta Explorado!", 
                `Visitaste todos los puntos de interés ${texto}. Podés volver a la galaxia para continuar tu viaje o mejorar tu nave.`,
                false
            );
        } else if (cuerpoCompletado && cuerpoCelesteId === 1){
            mostrarNotificacion("¡Planeta Explorado!", 
                "Visitaste todos los puntos de interés de este sector y desbloqueaste una nave. Podés volver a la galaxia para continuar tu viaje con tu nueva nave.",
                false
            );
        } else if (naveMejorada){
            mostrarNotificacion("¡La nave subió de nivel!", 
                `Alcanzaste el nivel ${naveMejorada} en todos los componentes de la nave. Desbloquaste un nuevo aspecto.`,
                false
            );
        }
    });
}