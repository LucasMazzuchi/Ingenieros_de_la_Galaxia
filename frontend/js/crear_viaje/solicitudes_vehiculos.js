import * as constantes from "../constantes.js";
import * as viaje from "../crear_viaje/solicitudes_crear_viaje.js";

/**
 * Carga la información de un vehículo en los campos del formulario según la opción seleccionada.
 * Si no hay vehículo seleccionado, reinicia los campos del formulario.
 * 
 * selectVehiculo - Elemento <select> con el ID del vehículo.
 * formVehiculo - Formulario HTML que contiene los campos del vehículo.
 */
export async function cargarVehiculos(selectVehiculo, formVehiculo) {
    const id = selectVehiculo.value;

    // Si no se selecciona un vehículo, se limpian los campos del formulario
    if (!id) {
        formVehiculo.reset();
        return;
    }

    // Obtiene los datos del vehículo desde la API utilizando su ID
    const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${id}`);
    const vehiculo = await resVehiculo.json();

    // Completa los inputs del formulario con los datos recuperados
    if (vehiculo) {
        document.getElementById("inputNombreVehiculo").value = vehiculo.nombre;
        document.getElementById("inputMotor").value = vehiculo.motor;
        document.getElementById("inputEstructura").value = vehiculo.estructura;
        document.getElementById("inputCombustible").value = vehiculo.combustible;
        document.getElementById("inputResistencia").value = vehiculo.resistencia;
        document.getElementById("inputPuntos").value = vehiculo.puntos;
    }
}

/**
 * Registra un nuevo vehículo o actualiza uno existente previa validación del límite de puntos de mejora.
 * 
 * selectVehiculo - Elemento <select> con el ID del vehículo.
 * formVehiculo - Formulario HTML a reiniciar tras el guardado.
 * inicializarSelects - Callback asíncrono para recargar los desplegables de la interfaz.
 * returns - Objeto con el estado del proceso para notificar al usuario.
 */
export async function agregarVehiculos(selectVehiculo, formVehiculo, inicializarSelects) {
    const id = selectVehiculo.value;
    let vehiculo;

    // Si se está editando, valida el límite de puntos de mejora disponibles
    if (id) {
        const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${id}`);
        vehiculo = await resVehiculo.json();
        
        const puntosDisponibles = 9 - parseInt(document.getElementById("inputEstructura").value) 
                                    - parseInt(document.getElementById("inputResistencia").value) 
                                    - parseInt(document.getElementById("inputMotor").value);

        if (puntosDisponibles < parseInt(document.getElementById("inputPuntos").value)) {
            return { 
                titulo: "Puntos disponibles excedidos", 
                textoEstado: `Podés elegir tener como máximo ${puntosDisponibles} puntos de mejora.` 
            };
        }
    }

    // Estructura el objeto con los datos extraídos del formulario
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

    // Envía los datos para creación o modificación según corresponda
    if (id) {
        exito = await viaje.modificarRegistro("vehiculos", id, datos);
    } else {
        exito = await viaje.crearRegistro("vehiculos", datos);
    }

    // Reinicia el formulario y actualiza la interfaz si la operación fue exitosa
    if (exito) {
        formVehiculo.reset();
        await inicializarSelects();
        return { titulo: "¡Operación Exitosa!", textoEstado: "¡Vehículo guardado con éxito!" };
    } else {
        return { titulo: "Operación Fallida", textoEstado: "Ocurrió un error al guardar el vehículo." };
    }
}

/**
 * Elimina el vehículo seleccionado de la base de datos.
 * 
 * selectVehiculo - Elemento <select> que contiene el ID del vehículo a borrar.
 * formVehiculo - Formulario HTML que se reiniciará tras eliminar.
 * inicializarSelects - Callback asíncrono para refrescar los desplegables.
 * returns - Objeto con el resultado para mostrar en la notificación.
 */
export async function borrarVehiculo(selectVehiculo, formVehiculo, inicializarSelects) {
    const id = selectVehiculo.value;

    // Verifica que se haya seleccionado un vehículo existente
    if (!id) {
        return { titulo: "Operación Fallida", textoEstado: "Seleccioná un vehículo existente para borrar." };
    }

    const exito = await viaje.eliminarRegistro("vehiculos", id);

    // Si la eliminación fue exitosa, limpia el formulario y actualiza los desplegables
    if (exito) {
        formVehiculo.reset();
        await inicializarSelects();
        return { titulo: "¡Operación Exitosa!", textoEstado: "Vehículo eliminado." };
    } else {
        return { titulo: "Operación Fallida", textoEstado: "No se pudo eliminar el vehículo." };
    }
}