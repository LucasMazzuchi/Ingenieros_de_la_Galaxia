import * as constantes from "./constantes.js";
document.getElementById("btnIniciar").addEventListener("click", async () => {
  const resMisionesTierra = await fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}?cuerpo_celeste_id=1&porcentaje=100&order_by=id&order=ASC`);
  const misionesTierra = await resMisionesTierra.json();
  if (misionesTierra.length === 3){
    window.location.href= "page/galaxia.html";
  } else {
  window.location.href = "page/planeta.html?id=1";
  }
});

document.getElementById("btncrear").addEventListener("click", () => {
  window.location.href = "page/crear_viaje.html";
});