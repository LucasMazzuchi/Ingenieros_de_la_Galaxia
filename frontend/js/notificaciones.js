// La función arma un cartel de notificación para mostrar por pantalla con el título y el texto.
// Devuelve una promesa que se resuelve cuando el cartel es cerrado por el usuario.
export function mostrarNotificacion(titulo, texto) {
    // Evita duplicar el cartel si ya hay uno abierto
    return new Promise((resolve) => {
        if (document.getElementById("cartelNotificacion")) return resolve();

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
            resolve();
        });
    });
};