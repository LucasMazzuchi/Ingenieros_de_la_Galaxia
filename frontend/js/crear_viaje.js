// CONFIGURACIÓN DE GALERÍAS Y TABS 
const imagenesPlanetas = Array.from({length: 10}, (_, i) => `../assets/img/planetas/planeta-${i + 1}.png`);
const imagenesFondos = Array.from({length: 15}, (_, i) => `../assets/img/fondos/fondo-${i + 1}.png`);
const imagenesNaves = Array.from({length: 4}, (_, i) => `../assets/img/vehiculos/nave-${i + 1}.png`);
const imagenesAutos = Array.from({length: 4}, (_, i) => `../assets/img/vehiculos/auto-${i + 1}.png`);

function crearSelectorImagenes(contenedorId, imagenes, inputHiddenId) {
  const contenedor = document.getElementById(contenedorId);
  const inputHidden = document.getElementById(inputHiddenId);
  if (!contenedor || !inputHidden) return;
  contenedor.innerHTML = "";

  imagenes.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.addEventListener("click", () => {
      contenedor.querySelectorAll("img").forEach(i => i.classList.remove("seleccionada"));
      img.classList.add("seleccionada");
      inputHidden.value = url;
    });
    contenedor.appendChild(img);
  });
}

crearSelectorImagenes("galeriaPlanetas", imagenesPlanetas, "inputImagen");
crearSelectorImagenes("galeriaFondoPlaneta", imagenesFondos, "inputImagenFondo");

const selectTipoVehiculo = document.getElementById("inputTipoVehiculo");
function actualizarGaleriaVehiculo() {
  const esNave = selectTipoVehiculo.value === "1";
  crearSelectorImagenes("galeriaVehiculo", esNave ? imagenesNaves : imagenesAutos, "inputImagenVehiculo");
}
selectTipoVehiculo.addEventListener("change", actualizarGaleriaVehiculo);
actualizarGaleriaVehiculo();

// Cambio de pestañas (Tabs)
const botonesTab = document.querySelectorAll(".tab-btn");
const seccionesTab = document.querySelectorAll(".seccion-tab");

botonesTab.forEach(boton => {
  boton.addEventListener("click", () => {
    botonesTab.forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");
    const tabElegido = boton.dataset.tab;
    seccionesTab.forEach(seccion => {
      const esVisible = seccion.id === `tab-${tabElegido}`;
      seccion.hidden = !esVisible;
      seccion.dataset.visible = esVisible ? "true" : "false";
      if (esVisible) seccion.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});


// FUNCIONES DE LA API 
const API_URL = "http://localhost:5000/api";

async function obtenerDatos(recurso) {
  try {
    const res = await fetch(`${API_URL}/${recurso}`);
    if (!res.ok) throw new Error(`Error al obtener ${recurso}`);
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function crearRegistro(recurso, datos) {
  try {
    const res = await fetch(`${API_URL}/${recurso}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    return res.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function modificarRegistro(recurso, id, datos) {
  try {
    const res = await fetch(`${API_URL}/${recurso}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    return res.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function eliminarRegistro(recurso, id) {
  try {
    const res = await fetch(`${API_URL}/${recurso}/${id}`, {
      method: "DELETE"
    });
    return res.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}


// LOGICA DE CONSULTA Y LLENADO DE SELECTS (Al cargar la página) 
async function inicializarSelects() {
  const planetas = await obtenerDatos("cuerpos_celestes");
  
  const selectPlaneta = document.getElementById("selectPlaneta");
  const selectPlanetaPunto = document.getElementById("selectPlanetaPunto");
  const selectUbicacionVehiculo = document.getElementById("selectUbicacionVehiculo");

  // Limpiar y poblar selects de planetas
  [selectPlaneta, selectPlanetaPunto, selectUbicacionVehiculo].forEach(sel => {
    if (!sel) return;
    if (sel === selectPlaneta) {
      sel.innerHTML = '<option value="">-- Crear nuevo --</option>';
    } else {
      sel.innerHTML = '<option value="">-- Seleccione un planeta --</option>';
    }

    planetas.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.nombre;
      sel.appendChild(opt);
    });
  });

  // Cargar vehículos existentes en su select
  const vehiculos = await obtenerDatos("vehiculos");
  const selectVehiculo = document.getElementById("selectVehiculo");
  if (selectVehiculo) {
    selectVehiculo.innerHTML = '<option value="">-- Crear nuevo --</option>';
    vehiculos.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = v.nombre;
      selectVehiculo.appendChild(opt);
    });
  }

  // Cargar misiones (puntos de interés) existentes en su select
  const misiones = await obtenerDatos("misiones");
  const selectPunto = document.getElementById("selectPunto");
  if (selectPunto) {
    selectPunto.innerHTML = '<option value="">-- Crear nuevo --</option>';
    misiones.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.nombre;
      selectPunto.appendChild(opt);
    });
  }
}

document.addEventListener("DOMContentLoaded", inicializarSelects);


//  MANEJADORES DE FORMULARIOS (Alta, Modificación y Baja) 

// FORMULARIO PLANETA 
const formPlaneta = document.getElementById("tab-planeta");
const selectPlaneta = document.getElementById("selectPlaneta");
const btnBorrarPlaneta = document.getElementById("btnBorrarPlaneta");

// Cargar datos en el form si selecciona uno existente (Modificación)
selectPlaneta.addEventListener("change", async () => {
  const id = selectPlaneta.value;
  if (!id) {
    formPlaneta.reset();
    return;
  }
  const planetas = await obtenerDatos("cuerpos_celestes");
  const p = planetas.find(item => item.id == id);
  if (p) {
    document.getElementById("inputNombre").value = p.nombre;
    document.getElementById("inputDescripcion").value = p.descripcion;
    document.getElementById("inputTipo").value = p.tipo;
    document.getElementById("inputDiametro").value = p.diametro;
    document.getElementById("inputGravedad").value = p.gravedad;
    document.getElementById("inputTemperatura").value = p.temperatura;
    document.getElementById("inputTerreno").value = p.terreno;
    document.getElementById("inputHabitable").value = p.habitable.toString();
    document.getElementById("inputPosicion").value = p.posicion;
    // imágenes guardadas en base de datos, las asignas aca
  }
});

// Guardar (Alta o Modificación) Planeta
formPlaneta.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = selectPlaneta.value;

  const datos = {
    nombre: document.getElementById("inputNombre").value,
    descripcion: document.getElementById("inputDescripcion").value,
    tipo: parseInt(document.getElementById("inputTipo").value),
    diametro: parseInt(document.getElementById("inputDiametro").value),
    gravedad: parseFloat(document.getElementById("inputGravedad").value),
    temperatura: parseInt(document.getElementById("inputTemperatura").value),
    terreno: parseInt(document.getElementById("inputTerreno").value),
    habitable: document.getElementById("inputHabitable").value === "true",
    posicion: parseInt(document.getElementById("inputPosicion").value)
  };

  let exito = false;
  if (id) {
    exito = await modificarRegistro("cuerpos_celestes", id, datos);
  } else {
    exito = await crearRegistro("cuerpos_celestes", datos);
  }

  if (exito) {
    alert("¡Guardado exitoso!");
    formPlaneta.reset();
    inicializarSelects();
  } else {
    alert("Ocurrió un error al guardar.");
  }
});

// Borrar Planeta
btnBorrarPlaneta.addEventListener("click", async () => {
  const id = selectPlaneta.value;
  if (!id) {
    alert("Selecciona un planeta existente para borrar.");
    return;
  }
  if (confirm("¿Estás seguro de borrar este planeta?")) {
    const exito = await eliminarRegistro("cuerpos_celestes", id);
    if (exito) {
      alert("Planeta eliminado.");
      formPlaneta.reset();
      inicializarSelects();
    } else {
      alert("No se pudo eliminar.");
    }
  }
});