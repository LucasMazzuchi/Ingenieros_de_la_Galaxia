import * as constantes from "../constantes.js";
import { mostrarNotificacion } from "../notificaciones.js";
import * as viaje from "../crear_viaje/solicitudes_crear_viaje.js";

/**
 * Carga los datos de un vehículo seleccionado desde la API y completa los campos del formulario.
 * Si no se seleccionó ningún vehículo, reinicia el formulario.
 * 
 * selectVehiculo: Elemento <select> con los vehículos.
 * formVehiculo: Formulario HTML del vehículo.
 */
export async function cargarVehiculos(selectVehiculo, formVehiculo) {
    const id = selectVehiculo.value;

    // Si no hay vehículo seleccionado (opción vacía), reinicia el formulario
    if (!id) {
        formVehiculo.reset();
        return;
    }

    // Solicita la información del vehículo específico a la API
    const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${id}`);
    const vehiculo = await resVehiculo.json();

    // Completa las entradas del formulario con las estadísticas del vehículo
    if (vehiculo) {
        document.getElementById("inputNombreVehiculo").value = vehiculo.nombre;
        document.getElementById("inputMotor").value = vehiculo.motor;
        document.getElementById("inputEstructura").value = vehiculo.estructura;
        document.getElementById("inputCombustible").value = vehiculo.combustible;
        document.getElementById("inputResistencia").value = vehiculo.resistencia;
        document.getElementById("inputPuntos").value = vehiculo.puntos;
    }
};

/**
 * Guarda o modifica un vehículo en la base de datos previa validación del límite de puntos de mejora.
 * 
 * selectVehiculo: Elemento <select> para determinar si es creación o modificación.
 * inicializarSelects: Callback para recargar los desplegables de la interfaz.
 * modificarRegistro: Función para modificar registros en el servidor.
 * crearRegistro: Función para crear nuevos registros en el servidor.
 * returns: Objeto con el resultado para mostrar en notificaciones.
 */
export async function agregarVehiculos(selectVehiculo, inicializarSelects, modificarRegistro, crearRegistro){
    const id = selectVehiculo.value;
    let vehiculo;

    // Si se trata de una modificación (existe ID)
    if (id){
        // Obtiene el vehículo actual para conservar su ubicación / punto de interés
        const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${id}`);
        vehiculo = await resVehiculo.json();

        // Calcula los puntos de mejora disponibles (máximo total de 9 distribuidos entre atributos)
        const puntosDisponibles = 9 - parseInt(document.getElementById("inputEstructura").value) 
                                   - parseInt(document.getElementById("inputResistencia").value) 
                                   - parseInt(document.getElementById("inputMotor").value);

        // Valida que los puntos asignados no superen los disponibles
        if (puntosDisponibles < parseInt(document.getElementById("inputPuntos").value)){
            await mostrarNotificacion("Puntos disponibles excedidos", `Podés elegir tener como máximo ${puntosDisponibles} puntos de mejora.`);
            return { titulo: "Puntos disponibles excedidos", textoEstado: `Podés elegir tener como máximo ${puntosDisponibles} puntos de mejora.` };
        }
    }

    // Prepara el objeto con todos los atributos parseados a sus tipos de datos numéricos
    const datos = {
        nombre: document.getElementById("inputNombreVehiculo").value,
        motor: parseInt(document.getElementById("inputMotor").value),
        estructura: parseInt(document.getElementById("inputEstructura").value),
        combustible: parseInt(document.getElementById("inputCombustible").value),
        resistencia: parseInt(document.getElementById("inputResistencia").value),
        puntos: parseInt(document.getElementById("inputPuntos").value),
        punto_interes: id ? parseInt(vehiculo.punto_interes) : 1,
        ubicacion_id: id ? parseInt(vehiculo.punto_interes) : 1
    };

    let exito = false;

    // Ejecuta modificación o creación según si existe ID
    if (id) {
        exito = await viaje.modificarRegistro("vehiculos", id, datos);
    } else {
        exito = await viaje.crearRegistro("vehiculos", datos);
    }

    // Si la operación fue exitosa, limpia el formulario y actualiza la UI
    if (exito) {
        formVehiculo.reset();
        inicializarSelects();
        return { titulo: "Operación Exitosa", textoEstado: `¡Vehículo guardado con éxito!` };
    } else {
        return { titulo: "Operación Fallida", textoEstado: `Ocurrió un error al guardar el vehículo.` };
    }
};

/**
 * Elimina de la base de datos el vehículo seleccionado tras solicitar confirmación del usuario.
 * 
 * selectVehiculo: Elemento <select> con el vehículo a borrar.
 * formVehiculo: Formulario HTML a resetear.
 * inicializarSelects: Callback para recargar los desplegables.
 */
async function borrarVehiculo(selectVehiculo, formVehiculo, inicializarSelects) {
    const id = selectVehiculo.value;

    // Valida que se haya seleccionado un vehículo existente
    if (!id) {
        alert("Selecciona un vehículo existente para borrar.");
        return;
    }

    // Pide confirmación previa al usuario antes de eliminar
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
}

