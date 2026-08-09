import * as constantes from "./constantes.js";
import { mostrarNotificacion } from "./notificaciones.js";

async function iniciarEstacion() {
    const vehiculoId = localStorage.getItem("vehiculoSeleccionadoId");
    
    if (!vehiculoId) {
        window.location.href = "usuario.html";
        return;
    }
    await actualizarPantallaDesdeBD(vehiculoId);
    inicializarBotones(vehiculoId);
}

async function actualizarPantallaDesdeBD(vehiculoId) {
    try {
        const res = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoId}`);
        const vehiculoActualizado = await res.json();
        document.getElementById("porcentaje") = vehiculoActualizado.combustible;
        pintarEstado(vehiculoActualizado);
    } catch (error) {
        console.error("Error al actualizar la pantalla:", error);
    }
}

function pintarEstado(vehiculo) {
    const campos = ["motor", "estructura", "resistencia"];
    const elPuntos = document.getElementById("puntos-disponibles");
    if (elPuntos) {
        elPuntos.textContent = vehiculo.puntos; 
    }
    campos.forEach((campo) => {
        const elemento = document.getElementById(campo);
        const boton = document.getElementById(`boton-${campo}`);
        if (elemento) {
            elemento.textContent = vehiculo[campo];
        }
        if (boton) {
            const alMaximo = vehiculo[campo] >= 3;
            const sinPuntos = vehiculo.puntos <= 0;

            if (alMaximo || sinPuntos) {
                boton.disabled = true;
                boton.classList.add("bloqueado"); // Hay que poner el estilo para bloquear el botón en el css como el del planeta.
            } else {
                boton.disabled = false;
                boton.classList.remove("bloqueado");
            }
        }
    });
}

function inicializarBotones(vehiculoId) {
    const campos = ["motor", "estructura", "resistencia"];

    campos.forEach((campo) => {
        const boton = document.getElementById(`boton-${campo}`);
        if (!boton) return;

        boton.addEventListener("click", async () => {
            const resEstadoVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoId}`);
            const vehiculo = await resEstadoVehiculo.json();

            if (vehiculo[campo] >= 3) {
                mostrarNotificacion(`El atributo ${campo} está al máximo`, "Utilizá tus puntos de mejora para los demás atributos.", false);
                return;
            }
            if (vehiculo.puntos <= 0) {
                mostrarNotificacion("Sin Puntos", "La nave no tiene puntos de mejora disponibles.", false);
                return;
            }
            try {
                const actualizarVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        [campo]: vehiculo[campo] + 1,
                        puntos: vehiculo.puntos - 1
                    })
                });
                if (actualizarVehiculo.ok) {
                    await actualizarPantallaDesdeBD(vehiculoId);
                    mostrarNotificacion("¡Mejora Aplicada!", `Se ha subido el atributo ${campo} al nivel ${vehiculo[campo] + 1}.`, false);
                }
            } catch (error) {
                console.error(`Error al mejorar ${campo}:`, error);
            }
        });
    });
    const botonCargarCombustible = document.getElementById("boton-cargar-combustible");
    botonCargarCombustible.addEventListener("click", async () => {
        const resActualVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoId}`);
        const vehiculo = await resActualVehiculo.json();
        if (vehiculo.combustible >= 100) {
            mostrarNotificacion("Tanque Lleno", "El vehículo ya tiene el combustible al máximo.", false);
            return;
        }
        try {
            const resCargado = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ combustible: 100 })
            });

            if (resCargado.ok) {
                await actualizarPantallaDesdeBD(vehiculoId);
                mostrarNotificacion("¡Tanque Lleno!", "Se ha cargado el combustible al 100%.", false);
            }
        } catch (error) {
            console.error("Error al recargar combustible:", error);
        }
    });
}

document.addEventListener("DOMContentLoaded", iniciarEstacion);
