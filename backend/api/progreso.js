import { Router } from "express";
import {validarIds, verificarEstadoMision} from "./verificaciones_progreso.js";
import { validarId } from "./validaciones_errores.js";
import * as progreso from "../bd/progreso.js";
import { completarMision } from "../logica/misiones.js";
import {mejorarVehiculo} from "../logica/vehiculos.js";

export const endpointsProgreso = Router();

endpointsProgreso.get("/:id/:cuerpo_celeste_id", validarIds, async (req, res) => {
    try {
        const resPuntosInteres = await progreso.getAllMisiones(req.params.id, req.params.cuerpo_celeste_id); // Busca misiones
        const puntosVisitados = resPuntosInteres.filter(punto => punto.completado === true);
        const resPlaneta = await progreso.getPlaneta(req.params.id, req.params.cuerpo_celeste_id);
        const planetaCompletado = resPlaneta ? resPlaneta.completado : false;
        res.status(200).json({puntosVisitados, planetaCompletado});
    } catch (error) {
        console.error("Error en get progreso:", error);
        res.status(500).json({ error: "Error al obtener el progreso del vehículo." });
    }
});
endpointsProgreso.patch("/:id/desbloquear", validarId, validarIds, async (req, res) => {
    try {
        // 1. Buscamos la misión anterior
        const misionAnterior = await progreso.getMisionAnteriorEnPlaneta(req.body.cuerpo_celeste_id, req.body.mision_id);
        if (misionAnterior) {
            const estaDesbloqueada = await progreso.getMision(req.params.id, misionAnterior.id);
            if (!estaDesbloqueada) {
                return res.status(403).json({ error: "No podés desbloquear este punto porque el anterior está bloqueado." });
            }
        }
        const resMision = await progreso.desbloquearMision(req.params.id, req.body.mision_id, req.cuerpo_celeste_id);
        res.status(200).json({ mensaje: "¡Nuevo punto de interés descubierto!" });
    } catch (error) {
        console.log("Error al desbloquear:", error);
        res.status(500).json({ error: "Error interno al intentar desbloquear la misión." });
    }
});

endpointsProgreso.patch("/:id/explorar", validarId, validarIds, verificarEstadoMision, completarMision, mejorarVehiculo, async (req, res) => {
    try {
        const ok = await progreso.completarPlaneta(req.params.id, req.body.cuerpo_celeste_id);
        res.status(200).json({ mensaje: "¡Punto explorado con éxito!", combustible: req.body.nafta, cuerpoCompletado: ok });
    } catch (error) {
        console.log("Error en explorar:", error);
        res.status(500).json({ error: "Error interno al explorar el punto." });
    }
});