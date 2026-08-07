export function mostrarNotificacion(titulo, texto, cuerpoCompletado, curepoCelesteId = 0, punto = true) {
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
        if (cuerpoCompletado && cuerpoCelesteid !== 1){
            const texto = punto ? constantes.PUNTO_DESBLOQUEADO : constantes.ERROR_PUNTO_MAX;
            mostrarNotificacion(
                "¡Planeta Explorado!", 
                `Visitaste todos los puntos de interés ${texto}. Podés volver a la galaxia para continuar tu viaje o mejorar tu nave.`,
                false
            );
        } else if (cuerpoCelesteId === 1){
            mostrarNotificacion("¡Planeta Explorado!", 
                "Visitaste todos los puntos de interés de este sector y desbloqueaste una nave. Podés volver a la galaxia para continuar tu viaje con tu nueva nave.",
                false
                );
        }
    });
}
