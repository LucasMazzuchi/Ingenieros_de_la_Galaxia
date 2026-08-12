import { Router } from "express";
import { validarIdsParams, validarIdsPatchCompletar, validarIdsPatchGeneral, validarReglasDesbloqueo, verificarEstadoPunto} from "./verificaciones_progreso.js";
import { manejarError, validarId } from "./validaciones_errores.js";
import * as progreso from "../bd/progreso.js";
import { completarPunto } from "../logica/puntos_interes.js";
import {mejorarVehiculo} from "../logica/vehiculos.js";

export const endpointsProgreso = Router();

// El endpoint responde con un código 200, los puntos visitados, y el estado del planeta 
// (completado o en progreso) asociados al vehículo y cuerpo celeste pasados por req.params. 
// En caso de ocurrir un error, responde con un código 500 y el mensaje de error.
endpointsProgreso.get("/:id/:cuerpo_celeste_id", validarIdsParams, async (req, res) => {
    try {
        const puntosVisitados = await progreso.getAllPuntos(req.params.id, req.params.cuerpo_celeste_id);
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
endpointsProgreso.patch("/:id/desbloquear", validarId, validarIdsPatchGeneral, validarReglasDesbloqueo, async (req, res) => {
    try {
        if (req.primero){
            const planetaVisitando = await progreso.agregarPlaneta(req.params.id, req.body.cuerpo_celeste_id);
        }
        const resPuntoInteres = await progreso.desbloquearPunto(req.params.id, req.body.punto_interes_id, req.body.cuerpo_celeste_id);
        res.status(200).json({ mensaje: "¡Nuevo punto de interés descubierto!" });
    } catch (error) {
        console.log("Error al desbloquear:", error);
        res.status(500).json({ error: "Error interno al intentar desbloquear el punto de interés." });
    }
});

// El endpoint explora un punto de interés asociado al id del vehículo pasado por req.params 
// y responde con un código 200, un mensaje de éxito, el combustible de recompensa y si el planeta 
// fue completado. En caso de ocurrir un error, responde con un código 500 y el mensaje de error.
endpointsProgreso.patch("/:id/explorar", validarId, validarIdsPatchGeneral, verificarEstadoPunto, completarPunto, mejorarVehiculo, async (req, res) => {
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
endpointsProgreso.patch("/:id/completar", validarId, validarIdsPatchCompletar, mejorarVehiculo, async (req, res) => {
    try {
        const combustible = await progreso.sumarCombustible(req.params.id, 100);
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
endpointsProgreso.post("/:id/:cuerpo_celeste_id/agregar", validarIdsParams, async (req,res) => {
    try{
        const ok = await progreso.agregarPlaneta(req.params.id, req.params.cuerpo_celeste_id);
        res.status(200).json({mensaje: "Planeta Agregado!", cuerpoAgregado: ok});
    }   catch(err) {
        const { estado, msjError } = manejarError(err);
        res.status(estado).json({error: msjError});
    }
})