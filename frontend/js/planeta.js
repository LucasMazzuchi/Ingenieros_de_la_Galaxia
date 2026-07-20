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