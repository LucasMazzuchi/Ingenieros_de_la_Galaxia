import { API_URL, VEHICULOS_URL, MISIONES_URL, PROGRESO_URL } from "./constantes.js";

const listaVehiculos = document.getElementById("listaVehiculos");
const btnMostrarForm = document.getElementById("btnMostrarForm");
const formNuevoVehiculo = document.getElementById("formNuevoVehiculo");
const btnCancelarNuevoVehiculo = document.getElementById("btnCancelarNuevoVehiculo");
const inputNombreNuevoVehiculo = document.getElementById("inputNombreNuevoVehiculo");

async function cargarVehiculos() {
  try {
    const res = await fetch(`${API_URL}/${VEHICULOS_URL}`);
    const vehiculos = await res.json();
    pintarVehiculos(vehiculos);
  } catch (error) {
    console.error("Error al obtener los vehículos:", error);
    listaVehiculos.innerHTML = `<p class="mensaje-vacio">No se pudo conectar con el servidor.</p>`;
  }
}

function pintarVehiculos(vehiculos) {
  listaVehiculos.innerHTML = "";

  if (!vehiculos || vehiculos.length === 0) {
    listaVehiculos.innerHTML = `<p class="mensaje-vacio">Todavía no tenés ninguna Nave. ¡Creá una!</p>`;
    mostrarFormulario();
    return;
  }

  vehiculos.forEach(v => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-vehiculo";
    tarjeta.innerHTML = `
      <div class="info-vehiculo">
        <span class="numero-vehiculo">Nave ${v.id}</span>
        <span class="nombre-vehiculo">${v.nombre}</span>
      </div>
    `;
    tarjeta.addEventListener("click", () => seleccionarVehiculo(v.id));
    listaVehiculos.appendChild(tarjeta);
  });
}

function mostrarFormulario() {
  formNuevoVehiculo.hidden = false;
  btnMostrarForm.hidden = true;
  inputNombreNuevoVehiculo.focus();
}

function ocultarFormulario() {
  formNuevoVehiculo.hidden = true;
  btnMostrarForm.hidden = false;
  formNuevoVehiculo.reset();
}



async function seleccionarVehiculo(idVehiculo) {
  localStorage.setItem("vehiculoSeleccionadoId", idVehiculo);

  try {
    const resEstadoTierra = await fetch(`${API_URL}/${PROGRESO_URL}/${idVehiculo}/1`);
    const estadoTierra = await resEstadoTierra.json();

    if (estadoTierra.planetaCompletado) {
      window.location.href = "galaxia.html";
    } else {
      window.location.href = "planeta.html?id=1";
    }
  } catch (error) {
    console.error("Error al validar el progreso en la Tierra:", error);
    window.location.href = "galaxia.html";
  }
}
formNuevoVehiculo.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = inputNombreNuevoVehiculo.value.trim();
  if (!nombre) return;

  const datosVehiculoNuevo = {
    nombre: nombre,
    motor: 1,
    estructura: 1,
    combustible: 100,
    resistencia: 1,
    ubicacion_id: 1,
    punto_interes: 1,
    puntos: 0
  };

  try {
    const res = await fetch(`${API_URL}/${VEHICULOS_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosVehiculoNuevo)
    });

    if (!res.ok) {
      alert("No se pudo crear la nave. Intentalo de nuevo.");
      return;
    }
    const resultado = await res.json();
    const resVehiculo = await seleccionarVehiculo(resultado.id);
  } catch (error) {
    console.error("Error al crear el vehículo:", error);
    alert("Ocurrió un error al crear el nave.");
  }
});
btnMostrarForm.addEventListener("click", mostrarFormulario);
btnCancelarNuevoVehiculo.addEventListener("click", ocultarFormulario);
document.addEventListener("DOMContentLoaded", cargarVehiculos);
