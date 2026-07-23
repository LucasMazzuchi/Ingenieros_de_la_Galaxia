import {API_URL, MISIONES_URL } from "./constantes.js";
document.getElementById("btnIniciar").addEventListener("click", async (e) => {
  e.preventDefault();
  try{
    const resMisionesTierra = await fetch(`${API_URL}/${MISIONES_URL}?cuerpo_celeste_id=1&porcentaje=100&order_by=id&order=ASC`);
    const misionesTierra = await resMisionesTierra.json();
    if (misionesTierra.length === 3){
      window.location.href= "page/galaxia.html";
    } else {
      window.location.href = "page/planeta.html?id=1";
  } 
  }catch (error) {
    console.error("Error al hacer el fetch de misiones:", error);
  }
});

document.getElementById("btncrear").addEventListener("click", () => {
  window.location.href = "page/crear_viaje.html";
});