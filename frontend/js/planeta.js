const vehiculo = document.getElementById("vehiculo");

const puntos = [
  { el: document.getElementById("punto-1"), top: "15%", left: "12%", pagina: "punto_interes1.html" },
  { el: document.getElementById("punto-2"), top: "50%", left: "78%", pagina: "punto_interes2.html" },
  { el: document.getElementById("punto-3"), top: "85%", left: "20%", pagina: "punto_interes3.html" }
];

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
  puntos[actual].el.classList.remove("bloqueado");
});

puntos.forEach((punto, indice) => {
  punto.el.addEventListener("click", () => {
    if (viajando) return;

    if (indice === actual) {
      window.location.href = punto.pagina;
    } else if (indice === actual + 1 || indice === actual - 1) {
      moverA(indice);
    }
  });
});
