import { API_URL, VEHICULOS_URL, MISIONES_URL } from "./constantes.js";

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
    listaVehiculos.innerHTML = `<p class="mensaje-vacio">Todavía no tenés ningún Nave. ¡Creá el primero!</p>`;
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

btnMostrarForm.addEventListener("click", mostrarFormulario);
btnCancelarNuevoVehiculo.addEventListener("click", ocultarFormulario);

formNuevoVehiculo.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = inputNombreNuevoVehiculo.value.trim();
  if (!nombre) return;

  const datosVehiculoNuevo = {
    nombre: nombre,
    tipo: 1,
    motor: 1,
    estructura: 1,
    combustible: 100,
    resistencia: 1,
    punto_interes: 0
  };

  try {
    const res = await fetch(`${API_URL}/${VEHICULOS_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosVehiculoNuevo)
    });

    if (res.status === 403) {
      alert("Ya alcanzaste el máximo de naves permitidas.");
      return;
    }

    if (!res.ok) {
      alert("No se pudo crear la nave. Intentalo de nuevo.");
      return;
    }

    const resultado = await res.json();
    seleccionarVehiculo(resultado.id);
  } catch (error) {
    console.error("Error al crear el vehículo:", error);
    alert("Ocurrió un error al crear el nave.");
  }
});

async function seleccionarVehiculo(idVehiculo) {
  localStorage.setItem("vehiculoSeleccionadoId", idVehiculo);

  try {
    const resMisionesTierra = await fetch(`${API_URL}/${MISIONES_URL}?cuerpo_celeste_id=1&porcentaje=100&order_by=id&order=ASC`);
    const misionesTierra = await resMisionesTierra.json();

    if (misionesTierra.length === 3) {
      window.location.href = "galaxia.html";
    } else {
      window.location.href = "planeta.html?id=1";
    }
  } catch (error) {
    console.error("Error al validar el progreso en la Tierra:", error);
    window.location.href = "galaxia.html";
  }
}

document.addEventListener("DOMContentLoaded", cargarVehiculos);