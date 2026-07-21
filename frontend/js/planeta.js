document.addEventListener("DOMContentLoaded", async () => {
  // Leer el ID del planeta desde la URL
  const params = new URLSearchParams(window.location.search);
  const planetaId = params.get("id");
});

const vehiculo = document.getElementById("vehiculo");

const puntos = [
  { el: document.getElementById("punto-1"), top: "15%", left: "12%" },
  { el: document.getElementById("punto-2"), top: "50%", left: "78%" },
  { el: document.getElementById("punto-3"), top: "85%", left: "20%" }
];


const datosPuntos = [
  {
    nombre: "Cráter Rojo",
    descripcion: "Una vasta depresión de suelo rojizo, formada hace millones de años por el impacto de un meteorito. El óxido de hierro tiñe cada roca con tonos carmesí, y en sus profundidades aún quedan restos de antiguas expediciones perdidas."
  },
  {
    nombre: "Valle Seco",
    descripcion: "Un cauce que alguna vez transportó agua líquida, hoy convertido en un laberinto de piedra reseca. Las formaciones talladas por el viento dibujan siluetas fantasmales bajo el cielo anaranjado del atardecer marciano."
  },
  {
    nombre: "Base Antigua",
    descripcion: "Los restos oxidados de una estación de investigación abandonada. Nadie sabe qué ocurrió con su tripulación, pero los paneles solares aún giran lentamente, como esperando el regreso de alguien que nunca volvió."
  }
];

let actual = 0;
let viajando = false;

function guardarEstado() {
  const estado = {
    actual: actual,
    desbloqueados: puntos.map(p => !p.el.classList.contains("bloqueado"))
  };
  sessionStorage.setItem("estadoMarte", JSON.stringify(estado));
}

function cargarEstado() {
  const guardado = sessionStorage.getItem("estadoMarte");
  if (!guardado) return;

  const estado = JSON.parse(guardado);
  actual = estado.actual;

  vehiculo.style.transition = "none";
  vehiculo.style.top = puntos[actual].top;
  vehiculo.style.left = puntos[actual].left;

  estado.desbloqueados.forEach((desbloqueado, indice) => {
    if (desbloqueado) puntos[indice].el.classList.remove("bloqueado");
  });

  requestAnimationFrame(() => {
    vehiculo.style.transition = "";
  });
}

function moverA(indice) {
  viajando = true;
  vehiculo.dataset.destino = indice;
  vehiculo.style.top = puntos[indice].top;
  vehiculo.style.left = puntos[indice].left;
}

function abrirPanelPunto(indice) {
  const datos = datosPuntos[indice];
  document.getElementById("puntoNombre").textContent = datos.nombre;
  document.getElementById("puntoDescripcion").textContent = datos.descripcion;
  document.getElementById("panelPunto").classList.add("visible");
}

document.getElementById("btnCerrarPanelPunto").addEventListener("click", () => {
  document.getElementById("panelPunto").classList.remove("visible");
});

vehiculo.addEventListener("transitionend", () => {
  actual = Number(vehiculo.dataset.destino);
  viajando = false;
  puntos[actual].el.classList.remove("bloqueado");
  guardarEstado();
});

puntos.forEach((punto, indice) => {
  punto.el.addEventListener("click", () => {
    if (viajando) return;

    if (indice === actual) {
      abrirPanelPunto(indice);
    } else if (indice === actual + 1 || indice === actual - 1) {
      moverA(indice);
    }
  });
});

const botonInfo = document.getElementById('botonInfo');
const panel = document.getElementById('panelPlaneta');

botonInfo.addEventListener('click', () => {
  panel.classList.toggle('abierto');
  botonInfo.classList.toggle('abierto');
  botonInfo.querySelector('.flecha').textContent =
    panel.classList.contains('abierto') ? '‹' : '›';
});



cargarEstado();
/*

  if (!planetaId) {
    window.location.href = "galaxia.html";
    return;
  }

  const vehiculo = document.getElementById("vehiculo");
  const nombrePlanetaEl = document.getElementById("nombre-planeta");
  const fondoPlanetaEl = document.getElementById("fondo-planeta");
  const contenedorPuntos = document.getElementById("contenedor-puntos");
  const caminoPolyline = document.getElementById("camino-polyline");

  let puntos = [];
  let actual = 0;       
  let viajando = false; 

  function moverA(indice) {
    viajando = true;
    vehiculo.dataset.destino = indice;
    vehiculo.style.top = puntos[indice].top;
    vehiculo.style.left = puntos[indice].left;
  }

  vehiculo.addEventListener("transitionend", () => {
    actual = Number(vehiculo.dataset.destino);
    viajando = false;
    if (puntos[actual]) {
      puntos[actual].el.classList.remove("bloqueado");
    }
  });

  try {
    // FETCH AL BACKEND: Datos del Cuerpo Celeste
    const resPlaneta = await fetch(`http://localhost:5000/api/cuerpos_celestes/${planetaId}`);
    if (!resPlaneta.ok) throw new Error("Error al obtener planeta");
    const planeta = await resPlaneta.json();

    // Actualizamos la UI con los datos reales del planeta
    nombrePlanetaEl.textContent = planeta.nombre;
    if (planeta.imagen_url) {
      fondoPlanetaEl.src = planeta.imagen_url;
    }

    // FETCH AL BACKEND: Misiones asociadas al planeta
    const resMisiones = await fetch(`http://localhost:5000/api/misiones?cuerpo_celeste_id=${planetaId}`);
    if (!resMisiones.ok) throw new Error("Error al obtener misiones");
    const misiones = await resMisiones.json();

    // Limpiamos los puntos hardcodeados
    contenedorPuntos.innerHTML = "";
    
    // Coordenadas base predefinidas para trazar el camino (Top%, Left%)
    const posicionesBase = [
      { top: "15%", left: "12%", x: 12, y: 15 },
      { top: "50%", left: "78%", x: 78, y: 50 },
      { top: "85%", left: "20%", x: 20, y: 85 }
    ];

    let puntosSVG = [];

    // Inyectar dinámicamente cada misión de la base de datos
    misiones.forEach((mision, index) => {
      // Usar coordenadas fijas del mapa si existen, o calcular dinámicas
      const pos = posicionesBase[index] || {
        top: `${20 + index * 25}%`,
        left: `${20 + (index % 2) * 50}%`,
        x: 20 + (index % 2) * 50,
        y: 20 + index * 25
      };

      const divPunto = document.createElement("div");
      divPunto.classList.add("punto-interes");
      if (index !== 0) divPunto.classList.add("bloqueado"); // El primero empieza desbloqueado
      divPunto.id = `punto-${mision.id}`;
      divPunto.style.top = pos.top;
      divPunto.style.left = pos.left;

      divPunto.innerHTML = `
        <img src="../assets/img/marcador.png" alt="punto de interés">
        <p>${mision.nombre}</p>
      `;

      contenedorPuntos.appendChild(divPunto);

      puntos.push({
        el: divPunto,
        top: pos.top,
        left: pos.left,
        id: mision.id
      });

      puntosSVG.push(`${pos.x},${pos.y}`);
    });

    // Dibujar el camino dinámico en el SVG
    caminoPolyline.setAttribute("points", puntosSVG.join(" "));

    // Posicionar el vehículo en el primer punto
    if (puntos.length > 0) {
      vehiculo.style.top = puntos[0].top;
      vehiculo.style.left = puntos[0].left;
    }

    // Mantenemos el listener original de clics para viajar entre puntos
    puntos.forEach((punto, indice) => {
      punto.el.addEventListener("click", () => {
        if (viajando) return;

        if (indice === actual) {
          // Redirigir usando el ID real de la misión/punto de interés
          window.location.href = `punto_interes.html?id=${punto.id}`;
        } else if (indice === actual + 1 || indice === actual - 1) {
          moverA(indice);
        }
      });
    });

  } catch (error) {
    console.error("❌ Error al cargar los datos dinámicos en el planeta:", error);
  }
});
*/
