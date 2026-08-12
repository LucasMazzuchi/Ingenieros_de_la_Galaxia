import { API_URL, VEHICULOS_URL, PUNTOS_URL, PROGRESO_URL } from "./constantes.js";

const listaVehiculos = document.getElementById("listaVehiculos");
const btnMostrarForm = document.getElementById("btnMostrarForm");
const formNuevoVehiculo = document.getElementById("formNuevoVehiculo");
const btnCancelarNuevoVehiculo = document.getElementById("btnCancelarNuevoVehiculo");
const inputNombreNuevoVehiculo = document.getElementById("inputNombreNuevoVehiculo");

// Carga todos los vehículos dentro del menú de naves e inicializa el formulario de crear vehículo.
async function iniciarVehiculos() {
  try {
    const res = await fetch(`${API_URL}/${VEHICULOS_URL}`);
    const vehiculos = await res.json();
    pintarVehiculos(vehiculos);
    // Guarda en la base de datos a la nave con el nombre elegido por el usuario, guarda el id en localStorage con seleccionarVehiculo y lo redirecciona a la página
    // correspondiente.
    formNuevoVehiculo.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = inputNombreNuevoVehiculo.value.trim();
    // Acpa cortar la interacción con la página.
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
      const vehiculo = guardarVehiculo(datosVehiculoNuevo);
      if (!vehiculo){
        alert("No se pudo crear la nave. Intentalo de nuevo.");
      }
      await seleccionarVehiculo(vehiculo.id);
    } catch (error) {
      console.error("Error al crear el vehículo:", error);
      alert("Ocurrió un error al crear el nave.");
    }
});
  } catch (error) {
    console.error("Error al obtener los vehículos:", error);
    listaVehiculos.innerHTML = `<p class="mensaje-vacio">No se pudo conectar con el servidor.</p>`;
  }
}

// Hace visbles todos los vehículos pasados por parámetro en forma de lista.
function pintarVehiculos(vehiculos) {
  listaVehiculos.innerHTML = "";

  if (!vehiculos || vehiculos.length === 0) {
    listaVehiculos.innerHTML = `<p class="mensaje-vacio">Todavía no tenés ninguna Nave. ¡Creá una!</p>`;
    mostrarFormularioNombre();
    return;
  }

  vehiculos.forEach(vehiculo => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-vehiculo";
    tarjeta.innerHTML = `
      <div class="info-vehiculo">
        <span class="numero-vehiculo">Nave ${vehiculo.id}</span>
        <span class="nombre-vehiculo">${vehiculo.nombre}</span>
      </div>
    `;
    tarjeta.addEventListener("click", () => seleccionarVehiculo(vehiculo.id));
    listaVehiculos.appendChild(tarjeta);
  });
}

// Resalta el formulario para el nombre de la nave.
function mostrarFormularioNombre() {
  formNuevoVehiculo.hidden = false;
  btnMostrarForm.hidden = true;
  inputNombreNuevoVehiculo.focus();
}

// Saca el resaltado del formulario para el nombre de la nave.
function ocultarFormularioNombre() {
  formNuevoVehiculo.hidden = true;
  btnMostrarForm.hidden = false;
  formNuevoVehiculo.reset();
}

// Guarda en localStorage el id del vehículo seleccionado y redirige al usuario a la tierra si no está completada, sino a la galaxia. Si ocurre un error
// redirige a galaxia.
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

async function guardarVehiculo(vehiculo) {
  const res = await fetch(`${API_URL}/${VEHICULOS_URL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosVehiculoNuevo)
  });
  if (!res.ok) {
    return;
  }
  const resultado = await res.json();
  return resultado;
}

btnMostrarForm.addEventListener("click", mostrarFormularioNombre);
btnCancelarNuevoVehiculo.addEventListener("click", ocultarFormularioNombre);
document.addEventListener("DOMContentLoaded", iniciarVehiculos);
