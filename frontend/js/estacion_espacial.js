import * as constantes from "./constantes.js";
import { mostrarNotificacion } from "./notificaciones.js";

// Función llamada para inicializar la página
async function iniciarEstacion() {
    const vehiculoId = localStorage.getItem("vehiculoSeleccionadoId");
    if (!vehiculoId) {
        window.location.href = "usuario.html";
        return;
    }
    const ok = await actualizarPantallaDesdeBD(vehiculoId);
    inicializarBotones(vehiculoId);
}

// Función que actualiza el combustible y los niveles de los atributos de la nave con el estado actual.
async function actualizarPantallaDesdeBD(vehiculoId) {
    try {
        const res = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoId}`);
        const vehiculoActualizado = await res.json();
        document.getElementById("datoCombustible").textContent = vehiculoActualizado.combustible;
        pintarEstado(vehiculoActualizado);
    } catch (error) {
        console.error("Error al actualizar la pantalla:", error);
    }
}

// Actualiza los niveles de los campos motor, estructura, vehìculos y los deshabilita en caso
// de tener al nivel 3 el campo.
function pintarEstado(vehiculo) {
    const campos = ["motor", "estructura", "resistencia"]; // Hacer cte
    const puntos = document.getElementById("datoPuntos");
    if (puntos) { // Sacar la verificación y probar con 0
        puntos.textContent = vehiculo.puntos; 
    }
    campos.forEach((campo) => {
        const elemento = document.getElementById(`nivel-${campo}`);
        const boton = document.getElementById(`boton-${campo}`);
        console.log(campo, "Encontrado:", !!boton, "Nivel:", vehiculo[campo], "Puntos:", vehiculo.puntos); // Sacar
        if (elemento) {
            elemento.textContent = vehiculo[campo];
        }
        if (boton) { // Sacar la verificación
            if (vehiculo[campo] >= 3 || vehiculo.puntos <= 0) {
                boton.disabled = true;
            }
        }
    });
}

// La funfión inicializa los botones de mejora de los campos de vehículo junto con el de cargar combustible. Cuando ocurre una mejora o se carga combustible,
// muestra una notificación detallando la acción y el resultado con la función mostrarNotificación.
function inicializarBotones(vehiculoId) {
    const campos = ["motor", "estructura", "resistencia"]; // Hacer cte

    campos.forEach((campo, index) => {
        const boton = document.getElementById(`boton-${campo}`);
        if (!boton) return; // Sacar la verificación

        boton.addEventListener("click", async () => {
            const resEstadoVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${vehiculoId}`);
            const vehiculo = await resEstadoVehiculo.json();
            // Armar func que solo devuelva el título, el texto y otrosCampos
            if (vehiculo[campo] >= 3) {
                mostrarNotificacion(`El atributo ${campo} está al máximo`, "Utilizá tus puntos de mejora para los demás atributos.", false);
                return;
            }
            if (vehiculo.puntos <= 0) {
                mostrarNotificacion("Sin Puntos", "La nave no tiene puntos de mejora disponibles.", false);
                return;
            }
            const otrosCampos = campos.filter(function (campoActual) {return campoActual !== campo});
            const campoInvalido = otrosCampos.filter(function (otroCampo){return vehiculo[otroCampo] < vehiculo[campo]});
            if (campoInvalido.length !== 0){
                mostrarNotificacion("Mejora no disponible", `Tenés que mejorar primero todos los atributos al nivel ${vehiculo[campo]} para poder desbloquearla.`, false);
                return;
            }
            // Hasta acá
            // Armar func de mejora que devuelva ok, necesita como parámetros vehiculo, otros campos
            let nivelNave = 0;
            if (vehiculo[otrosCampos[0]] === vehiculo[otrosCampos[1]] && vehiculo[campo]+1 === vehiculo[otrosCampos[0]]){
                nivelNave = vehiculo[campo]+1;
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
                    // De acá para abajo afuera
                    await actualizarPantallaDesdeBD(vehiculoId);
                    mostrarNotificacion("¡Mejora Aplicada!", `Se ha subido el atributo ${campo} al nivel ${vehiculo[campo] + 1}.`, false, 0, true, nivelNave);
                }
            } catch (error) {
                console.error(`Error al mejorar ${campo}:`, error);
            }
        });
    });
    const botonCargarCombustible = document.getElementById("btnRecargar");
    botonCargarCombustible.addEventListener("click", async () => { // Func aparte de lógica que devuelva solo título y texto.
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
    document.getElementById("botonVolver").addEventListener("click", async() => {
        window.location.href = "galaxia.html"
    });
}
document.addEventListener("DOMContentLoaded", iniciarEstacion);
