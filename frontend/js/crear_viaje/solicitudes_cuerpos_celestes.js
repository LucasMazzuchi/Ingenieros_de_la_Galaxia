// La función arma el desplegable de las posiciones disponibles para crear o modificar un planeta.
async function actualizarPosicionesPlanetas() {
  const selectPosicion = document.getElementById("inputPosicion");
  if (!selectPosicion) return;

  // Obtenemos los planetas actuales
  const planetas = await obtenerDatos("cuerpos_celestes"); // Cambiar por cte
  const planetaIdSeleccionado = document.getElementById("selectPlaneta").value;

  selectPosicion.innerHTML = '<option value="">-- Seleccione posición --</option>';

  // Filtramos las posiciones ocupadas por otros planetas y las volvemos un entero.
  const posicionesOcupadas = new Set(
    planetas
      .filter(planeta => planeta.id != planetaIdSeleccionado && planeta.posicion)
      .map(planeta => parseInt(planeta.posicion))
  );

  const MAX_POSICIONES = 9;  

  for (let i = 1; i <= MAX_POSICIONES; i++) {
    if (!posicionesOcupadas.has(i)) {
      const opcion = document.createElement("option");
      opcion.value = i;
      opcion.textContent = `${i}`;
      selectPosicion.appendChild(opcion);
    }
  }
}