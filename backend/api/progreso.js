import { Router } from "express";
import {validarIds, verificarEstadoMision} from "./verificaciones_progreso.js";
import { validarId } from "./validaciones_errores.js";
import * as progreso from "../bd/progreso.js";
import { getVehiculo } from "../bd/vehiculos.js";
import { completarMision } from "../logica/misiones.js";
import {mejorarVehiculo} from "../logica/vehiculos.js";
import { getMision, getAllMisiones } from "../bd/misiones.js";
import { ORDER, ORDER_BY } from "../constantes.js";

export const endpointsProgreso = Router();

// El endpoint responde con un código 200, los puntos visitados, y el estado del planeta 
// (completado o en progreso) asociados al vehículo y cuerpo celeste pasados por req.params. 
// En caso de ocurrir un error, responde con un código 500 y el mensaje de error.
endpointsProgreso.get("/:id/:cuerpo_celeste_id", validarIds, async (req, res) => {
    try {
        const puntosVisitados = await progreso.getAllMisiones(req.params.id, req.params.cuerpo_celeste_id);
        const resPlaneta = await progreso.getPlaneta(req.params.id, req.params.cuerpo_celeste_id);
        const planetaCompletado = resPlaneta !== undefined ? resPlaneta.completado : false;
        const enProgreso = (resPlaneta !== undefined);
        res.status(200).json({puntosVisitados, planetaCompletado, enProgreso});
    } catch (error) {
        console.error("Error en get progreso:", error);
        res.status(500).json({ error: "Error al obtener el progreso del vehículo." });
    }
});
// El endpoint desbloquea un punto de interés para el vehículo asociado al id pasado por req.params 
// y responde con un código 200 y un mensaje de éxito. Si se intenta saltar a un punto que se diferencia
// en más de 1 con su posición entre la actual y la deseada, responde con un código 409 y el mensaje de error.
// Si el punto anterior está bloqueado, responde con un código 403 y el error.
// Si el punto ya estaba desbloqueado, responde con un código 200. 
// En caso de ocurrir un error interno, responde con un código 500 y el mensaje de error.
endpointsProgreso.patch("/:id/desbloquear", validarId, validarIds, async (req, res) => {
    try {
        const actual = await getMision(req.body.mision_id);
        const vehiculo = await getVehiculo(req.params.id);
        const misiones = await getAllMisiones({
            cuerpo_celeste_id : req.body.cuerpo_celeste_id,
            [ORDER_BY] : "posicion",
            [ORDER] : "ASC"
        });
        // Chequear que exista actual, vehículo y misiones, sino 404 con un msj de error dinámico.
        // Armar un middleware en lógica puntos de interés.
        if (misiones.length > 2 && Math.abs(vehiculo.punto_interes-actual.posicion)>1){
                return res.status(409).json({error : "No podés saltar a este punto, debés ir a uno más cercano para poder ir a este."});
        }
        const actualEstado = await progreso.getMision(req.params.id, req.body.mision_id);
        if (actualEstado){
            return res.status(200).json({error : ""})             
        }
        if (actual.posicion > 1 && misiones[0].id !== req.body.mision_id) {
            const misionAnterior = await progreso.getMisionAnteriorEnPlaneta(req.body.cuerpo_celeste_id, actual.posicion);
            console.log(misionAnterior); // Sacar
            const estaDesbloqueada = await progreso.getMision(req.params.id, misionAnterior.id);
            if (!estaDesbloqueada) {
                return res.status(403).json({ error: "No podés desbloquear este punto porque el anterior está bloqueado." });
            }
        }
        // Dejar afuera del middleware de acá para abajo.
        const yaVisitado = await progreso.getPlaneta(req.params.id, req.body.cuerpo_celeste_id);
        if (actual.posicion === misiones[0].posicion && !yaVisitado){ // Pasar esto por el body con la verificación ya hecha como un bool 'primero'
            const planetaVisitando = await progreso.agregarPlaneta(req.params.id, req.body.cuerpo_celeste_id);
        }
        const resMision = await progreso.desbloquearMision(req.params.id, req.body.mision_id, req.body.cuerpo_celeste_id);
        res.status(200).json({ mensaje: "¡Nuevo punto de interés descubierto!" });
    } catch (error) {
        console.log("Error al desbloquear:", error);
        res.status(500).json({ error: "Error interno al intentar desbloquear la misión." });
    }
});

// El endpoint explora un punto de interés asociado al id del vehículo pasado por req.params 
// y responde con un código 200, un mensaje de éxito, el combustible de recompensa y si el planeta 
// fue completado. En caso de ocurrir un error, responde con un código 500 y el mensaje de error.
endpointsProgreso.patch("/:id/explorar", validarId, validarIds, verificarEstadoMision, completarMision, mejorarVehiculo, async (req, res) => {
    try {
        const ok = await progreso.completarPlaneta(req.params.id, req.body.cuerpo_celeste_id);
        res.status(200).json({ mensaje: "¡Punto explorado con éxito!", combustible: req.body.recompensa, cuerpoCompletado: ok});
    } catch (error) {
        console.log("Error en explorar:", error);
        res.status(500).json({ error: "Error interno al explorar el punto." });
    }
});

// El endpoint marca un planeta como completado, otorga 100 de combustible al vehículo asociado 
// al id pasado por req.params y responde con un código 200, un mensaje de éxito y un booleano 
// de estado. En caso de ocurrir un error, responde con un código 500 y el mensaje de error.
endpointsProgreso.patch("/:id/completar", validarId, validarIds, mejorarVehiculo, async (req, res) => {
    try {
        const combustible = await progreso.sumarCombustible(req.params.id, 100); // Ver si se puede sacar sin influír en el código.
        const ok = await progreso.completarPlaneta(req.params.id, req.body.cuerpo_celeste_id); // Verificar que exista el planeta
        res.status(200).json({mensaje: "Planeta completado!", cuerpoCompletado: ok});
    } catch (error){
        console.log("Error en completar:", error);
        res.status(500).json({ error: "Error interno al querer completar el planeta." });
    }
});

// El endpoint agrega un cuerpo celeste al progreso de exploración del vehículo asociado a los 
// ids pasados por req.params y responde con un código 200 y un mensaje de éxito. 
// En caso de ocurrir un error, responde con un código 500 y el mensaje de error.
endpointsProgreso.post("/:id/:cuerpo_celeste_id/agregar", validarIds, async (req,res) => {
    try{
        const ok = await progreso.agregarPlaneta(req.params.id, req.params.cuerpo_celeste_id); // Chequear si existe el cuerpo asociado al id preguntando si está ok
        res.status(200).json({mensaje: "Planeta Agregado!", cuerpoAgregado: ok});
    }   catch(error) {
        console.log("Error en agregar: ", error); // Sacar
        res.status(500).json({error: "Error interno al querer agregar el planeta."}); // Usar manejar error para que si no existe un cuerpo o un vehículo asociado a la fk devuelva el error correcto.
    }
})