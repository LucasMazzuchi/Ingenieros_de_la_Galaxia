import * as constantes from "./constantes.js";
// Listas de imágenes reales (todas sueltas en assets/img, sin subcarpetas)
const imagenesPlanetas = [
  "../assets/img/agujero_negro.png",
  "../assets/img/luna.png",
  "../assets/img/marte.png",
  "../assets/img/mercurio.png",
  "../assets/img/neptuno.png",
  "../assets/img/planeta_verde.png",
  "../assets/img/planeta_violata.png",
  "../assets/img/saturno.png",
  "../assets/img/sol.png",
  "../assets/img/tierra.png"
];

const imagenesFondos = [
  "../assets/img/fondo-agujero_negro.jpg",
  "../assets/img/fondo-luna.jpg",
  "../assets/img/fondo-marte.jpg",
  "../assets/img/fondo-mercurio.jpg",
  "../assets/img/fondo-neptuno.jpg",
  "../assets/img/fondo-saturno.jpg",
  "../assets/img/fondo-sol.jpg",
  "../assets/img/fondo-tierra.jpg",
  "../assets/img/fondo-verde.jpg",
  "../assets/img/fondo-violeta.jpg"
];



// Crea una galería clickeable dentro de un contenedor, y guarda la elegida en un input hidden
function crearSelectorImagenes(contenedorId, imagenes, inputHiddenId) {
  const contenedor = document.getElementById(contenedorId);
  const inputHidden = document.getElementById(inputHiddenId);
  contenedor.innerHTML = "";

  imagenes.forEach((url, index) => {
    const img = document.createElement("img");
    img.src = url;
    img.addEventListener("click", () => {
      contenedor.querySelectorAll("img").forEach(i => i.classList.remove("seleccionada"));
      img.classList.add("seleccionada");

      inputHidden.value = index + 1; 
    });
    contenedor.appendChild(img);
  });
}

crearSelectorImagenes("galeriaPlanetas", imagenesPlanetas, "inputImagen");
crearSelectorImagenes("galeriaFondoPlaneta", imagenesFondos, "inputImagenFondo");
// Galería del planeta: imagen del planeta + imagen de fondo (ambas fijas)


// Galería de vehículo: cambia entre naves/autos según el tipo elegido
const selectTipoVehiculo = document.getElementById("inputTipoVehiculo");


// Tabs: switching entre Planeta / Punto de interés / Vehículo
const botonesTab = document.querySelectorAll(".tab-btn");
const seccionesTab = document.querySelectorAll(".seccion-tab");

botonesTab.forEach(boton => {
  boton.addEventListener("click", () => {
    botonesTab.forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");

    const tabElegido = boton.dataset.tab; // "planeta" | "punto" | "vehiculo"
    let seccionElegida = null;

    seccionesTab.forEach(seccion => {
      const esVisible = seccion.id === `tab-${tabElegido}`;
      seccion.hidden = !esVisible;
      seccion.dataset.visible = esVisible ? "true" : "false";
      if (esVisible) seccion.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});


// FUNCIONES DE LA API 



async function obtenerDatos(recurso) {
  try {
    const res = await fetch(`${constantes.API_URL}/${recurso}`);
    if (!res.ok) throw new Error(`Error al obtener ${recurso}`);
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function crearRegistro(recurso, datos) {
  try {
    const res = await fetch(`${constantes.API_URL}/${recurso}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    return res.ok;
  } catch (error) {
    console.error("Error grave en el Fetch:", error);
    return false;
  }
}

async function modificarRegistro(recurso, id, datos) {
  try {
    const res = await fetch(`${constantes.API_URL}/${recurso}/${id}`, {
      method: "PATCH",
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
    const res = await fetch(`${constantes.API_URL}/${recurso}/${id}`, {
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
  // Limpiar y poblar selects de planetas
  [selectPlaneta, selectPlanetaPunto].forEach(sel => {
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
    document.getElementById("inputImagen").value = p.imagen;
    document.getElementById("inputImagenFondo").value = p.imagen_fondo;
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
    posicion: parseInt(document.getElementById("inputPosicion").value),
    
    imagen: parseInt(document.getElementById("inputImagen").value),
    imagen_fondo: parseInt(document.getElementById("inputImagenFondo").value)
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
// FORMULARIO VEHÍCULO 
const formVehiculo = document.getElementById("tab-vehiculo");
const selectVehiculo = document.getElementById("selectVehiculo");
const btnBorrarVehiculo = document.getElementById("btnBorrarVehiculo");

// Cargar datos en el form si selecciona un vehículo existente
selectVehiculo.addEventListener("change", async () => {
  const id = selectVehiculo.value;
  if (!id) {
    formVehiculo.reset();
    actualizarGaleriaVehiculo();
    return;
  }
  const vehiculos = await obtenerDatos("vehiculos");
  const v = vehiculos.find(item => item.id == id);
  if (v) {
    document.getElementById("inputNombreVehiculo").value = v.nombre;
    document.getElementById("inputTipoVehiculo").value = v.tipo;
    document.getElementById("inputMotor").value = v.motor;
    document.getElementById("inputEstructura").value = v.estructura;
    document.getElementById("inputCombustible").value = v.combustible;
    document.getElementById("inputResistencia").value = v.resistencia;
  }
});

// Guardar (Alta o Modificación) Vehículo
formVehiculo.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = selectVehiculo.value;

  const vehiculosActuales = await obtenerDatos("vehiculos");

    
  const datos = {
    nombre: document.getElementById("inputNombreVehiculo").value,
    tipo: parseInt(document.getElementById("inputTipoVehiculo").value),
    motor: parseInt(document.getElementById("inputMotor").value),
    estructura: parseInt(document.getElementById("inputEstructura").value),
    combustible: parseInt(document.getElementById("inputCombustible").value),
    resistencia: parseInt(document.getElementById("inputResistencia").value),
    punto_interes: 1
  };
  
  if (id) {
        const existeOtroIgual = vehiculosActuales.find(v => v.tipo === datos.tipo && v.id != id);
        if (existeOtroIgual) {
            alert("Ya existe otro vehículo con este tipo. Solo puede haber uno de Tipo 1 y uno de Tipo 2.");
            return; 
        }
    } else {
        
        if (vehiculosActuales.length >= 2) {
            alert("El hangar está lleno. Ya existen 2 vehículos en total y no se pueden crear más.");
            return;
        }
      
        const existeTipo = vehiculosActuales.find(v => v.tipo === datos.tipo);
        if (existeTipo) {
            alert(`Ya existe un vehículo registrado para el tipo seleccionado. Debes elegir el otro.`);
            return;
        }
      }

  let exito = false;
   
  if (id) {
    exito = await modificarRegistro("vehiculos", id, datos);
  } else {
    exito = await crearRegistro("vehiculos", datos);
  }

  if (exito) {
    alert("¡Vehículo guardado con éxito!");
    formVehiculo.reset();
    inicializarSelects();
  } else {
    alert("Ocurrió un error al guardar el vehículo.");
  }
});

// Borrar Vehículo
btnBorrarVehiculo.addEventListener("click", async () => {
  const id = selectVehiculo.value;
  if (!id) {
    alert("Selecciona un vehículo existente para borrar.");
    return;
  }
  if (confirm("¿Estás seguro de borrar este vehículo?")) {
    const exito = await eliminarRegistro("vehiculos", id);
    if (exito) {
      alert("Vehículo eliminado.");
      formVehiculo.reset();
      inicializarSelects();
    } else {
      alert("No se pudo eliminar el vehículo.");
    }
  }
});
// FORMULARIO PUNTO DE INTERÉS (Misiones)
const formPunto = document.getElementById("tab-punto");
const selectPunto = document.getElementById("selectPunto");
const btnBorrarPunto = document.getElementById("btnBorrarPunto");

// Cargar datos en el form si selecciona una misión existente
selectPunto.addEventListener("change", async () => {
  const id = selectPunto.value;
  if (!id) {
    formPunto.reset();
    return;
  }
  const misiones = await obtenerDatos("misiones");
  const m = misiones.find(item => item.id == id);
  if (m) {
    document.getElementById("selectPlanetaPunto").value = m.cuerpo_celeste_id;
    document.getElementById("inputTituloPunto").value = m.nombre;
    document.getElementById("inputDescripcionPunto").value = m.descripcion;
    document.getElementById("inputPorcentaje").value = m.porcentaje;
    document.getElementById("inputDisponible").value = m.disponible.toString();
  }
});

// Guardar (Alta o Modificación) Punto de Interés
formPunto.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = selectPunto.value;

  const datos = {
    cuerpo_celeste_id: parseInt(document.getElementById("selectPlanetaPunto").value),
    nombre: document.getElementById("inputTituloPunto").value,
    descripcion: document.getElementById("inputDescripcionPunto").value,
    porcentaje: parseInt(document.getElementById("inputPorcentaje").value),
    disponible: document.getElementById("inputDisponible").value === "true"
  };

  let exito = false;
  if (id) {
    exito = await modificarRegistro("misiones", id, datos);
  } else {
    exito = await crearRegistro("misiones", datos);
  }

  if (exito) {
    alert("¡Punto de interés guardado con éxito!");
    formPunto.reset();
    inicializarSelects();
  } else {
    alert("Ocurrió un error al guardar el punto de interés.");
  }
});

// Borrar Punto de Interés
btnBorrarPunto.addEventListener("click", async () => {
  const id = selectPunto.value;
  if (!id) {
    alert("Selecciona un punto de interés existente para borrar.");
    return;
  }
  if (confirm("¿Estás seguro de borrar este punto de interés?")) {
    const exito = await eliminarRegistro("misiones", id);
    if (exito) {
      alert("Punto de interés eliminado.");
      formPunto.reset();
      inicializarSelects();
    } else {
      alert("No se pudo eliminar el punto de interés.");
    }
  }
});