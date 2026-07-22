// Listas de imágenes reales (todas sueltas en assets/img, sin subcarpetas)
const imagenesPlanetas = [
  "../assets/img/aujero_negro.png",
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
  "../assets/img/fondo-aujero_negro.jpg",
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

const imagenesAutos = [
  "../assets/img/auto1.png",
  "../assets/img/auto2.png",
  "../assets/img/auto3.png",
  "../assets/img/auto4.png"
];

const imagenesNaves = [
  "../assets/img/nave1.png",
  "../assets/img/nave2.png",
  "../assets/img/nave3.png",
  "../assets/img/nave4.png"
];

// Crea una galería clickeable dentro de un contenedor, y guarda la elegida en un input hidden
function crearSelectorImagenes(contenedorId, imagenes, inputHiddenId) {
  const contenedor = document.getElementById(contenedorId);
  const inputHidden = document.getElementById(inputHiddenId);
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

// Galería del planeta: imagen del planeta + imagen de fondo (ambas fijas)
crearSelectorImagenes("galeriaPlanetas", imagenesPlanetas, "inputImagen");
crearSelectorImagenes("galeriaFondoPlaneta", imagenesFondos, "inputImagenFondo");

// Galería de vehículo: cambia entre naves/autos según el tipo elegido
const selectTipoVehiculo = document.getElementById("inputTipoVehiculo");

function actualizarGaleriaVehiculo() {
  const esNave = selectTipoVehiculo.value === "1";
  crearSelectorImagenes("galeriaVehiculo", esNave ? imagenesNaves : imagenesAutos, "inputImagenVehiculo");
}

selectTipoVehiculo.addEventListener("change", actualizarGaleriaVehiculo);
actualizarGaleriaVehiculo(); // se ejecuta apenas carga, para mostrar la galería inicial

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
      if (esVisible) seccionElegida = seccion;
    });

    if (seccionElegida) {
      seccionElegida.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
