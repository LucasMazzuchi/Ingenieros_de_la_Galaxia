export function mostrarNotificacion(titulo, texto, cuerpoCompletado) {
    // Evita duplicar el cartel si ya hay uno abierto
    if (document.getElementById("cartelNotificacion")) return;

    const modal = document.createElement("div");
    modal.id = "cartelNotificacion";
    
    // Aquí usamos las clases CSS en lugar de los estilos en línea
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
        if (cuerpoCompletado){
            mostrarNotificacion(
                "¡Planeta Explorado!", 
                "Has recolectado todos los datos de este sector. Ya puedes volver a la galaxia para continuar tu viaje o mejorar tu nave.",
                false
            );
        }
    });
}