import * as constantes from "../constantes.js";
import { mostrarNotificacion } from "../notificaciones.js";
import * as viaje from "../crear_viaje/solicitudes_crear_viaje.js";

export async function cargarVehiculos(selectVehiculo, formVehiculo) {
    const id = selectVehiculo.value;
      if (!id) {
        formVehiculo.reset();
        return;
      }
      const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${id}`);
      const vehiculo = await resVehiculo.json();
      if (vehiculo) {
        document.getElementById("inputNombreVehiculo").value = vehiculo.nombre;
        document.getElementById("inputMotor").value = vehiculo.motor;
        document.getElementById("inputEstructura").value = vehiculo.estructura;
        document.getElementById("inputCombustible").value = vehiculo.combustible;
        document.getElementById("inputResistencia").value = vehiculo.resistencia;
        document.getElementById("inputPuntos").value = vehiculo.puntos;
      }
};

export async function agregarVehiculos(selectVehiculo, inicializarSelects, formVehiculo){
      const id = selectVehiculo.value;
      let vehiculo;
      const puntosDisponibles = 9-parseInt(document.getElementById("inputEstructura").value)- parseInt(document.getElementById("inputResistencia").value) -parseInt(document.getElementById("inputMotor").value);
        if (puntosDisponibles < parseInt(document.getElementById("inputPuntos").value)){
            return { titulo: "Puntos disponibles excedidos", textoEstado: `Podés elegir tener como máximo ${puntosDisponibles} puntos de mejora.` };
          }
      if (id){
        const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${id}`);
        vehiculo = await resVehiculo.json();
        }
      const datos = {
        nombre: document.getElementById("inputNombreVehiculo").value,
        motor: parseInt(document.getElementById("inputMotor").value),
        estructura: parseInt(document.getElementById("inputEstructura").value),
        combustible: parseInt(document.getElementById("inputCombustible").value),
        resistencia: parseInt(document.getElementById("inputResistencia").value),
        puntos: parseInt(document.getElementById("inputPuntos").value),
        punto_interes: id ? parseInt(vehiculo.punto_interes): 1,
        ubicacion_id: id ? parseInt(vehiculo.punto_interes): 1
      };
    
      let exito = false;
       
      if (id) {
        exito = await viaje.modificarRegistro("vehiculos", id, datos);
      } else {
        exito = await viaje.crearRegistro("vehiculos", datos);
      }
    
      if (exito) {
        formVehiculo.reset();
        inicializarSelects();
        return { titulo: "Operación Exitosa", textoEstado: `¡Vehículo guardado con éxito!` };
      } else {
        return { titulo: "Operación Fallida", textoEstado: `Ocurrió un error al guardar el vehículo.` };
      }
};

export async function borrarVehiculo(selectVehiculo, formVehiculo, inicializarSelects) {
  const id = selectVehiculo.value;
  if (!id) {
    alert("Selecciona un vehículo existente para borrar.");
    return;
  }
    
  if (await viaje.eliminarRegistro("vehiculos", id)) {
    formVehiculo.reset();
    inicializarSelects();
    return { titulo: "Operación Exitosa", textoEstado: `¡Vehículo borrado con éxito!` };
  } else {
    return { titulo: "Operación Fallida", textoEstado: `Ocurrió un error al borrar el vehículo.` };
  }
}

