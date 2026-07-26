import { Router } from "express";
import * as constantes from "../constantes.js";
import {validarIds, validarRecompensa, verificarEstado, verificarEstadoMision} from "./verificaciones_progreso.js";
import { validarId } from "./validaciones_errores.js";
import * as progreso from "../bd/progreso.js";
import { completarMision } from "../logica/misiones.js";
import {mejorarVehiculo} from "../logica/vehiculos.js";

export const endpointsProgreso = Router();

endpointsProgreso.get("/:id/progreso/:cuerpo_celeste_id", validarIds, async (req, res) => {
    try {
        const { id: vehiculoId, cuerpo_celeste_id: planetaId } = req.params;

        // 1. Buscamos las misiones (¡Agregamos await!)
        const resPuntosInteres = await progreso.getAllMisiones(vehiculoId, planetaId);
        
        // Filtramos solo las que están completadas (TRUE)
        const puntosVisitados = resPuntosInteres.filter(punto => punto.completado === true);

        // 2. Chequeamos si completó el planeta (¡Agregamos await!)
        const resPlaneta = await getPlaneta(vehiculoId, planetaId);
        
        // Si no existe el registro en la tabla, significa que aún no lo completó (false)
        const planetaCompletado = resPlaneta ? resPlaneta.completado : false;

        res.status(200).json({
            puntosVisitados,
            planetaCompletado
        });
        
    } catch (error) {
        console.error("🚨 ERROR EN GET PROGRESO:", error);
        res.status(500).json({ error: "Error al obtener el progreso del vehículo." });
    }
});
endpointsProgreso.patch("/:id/desbloquear", validarId, validarIds, async (req, res) => {
    try {
        // 1. Buscamos la misión anterior
        const misionAnterior = await progreso.getMisionAnteriorEnPlaneta(req.body.cuerpo_celeste_id, req.body.mision_id);

        if (misionAnterior) {
            // 2. Verificamos si la tiene desbloqueada
            const estaDesbloqueada = await progreso.getMision(req.params.id, misionAnterior.id);
            if (!estaDesbloqueada) {
                return res.status(403).json({ error: "No podés desbloquear este punto porque el anterior está bloqueado." });
            }
        }
        // 3. La desbloqueamos
        await progreso.desbloquearMision(req.params.id, req.body.mision_id);
        res.status(200).json({ mensaje: "¡Nuevo punto de interés descubierto!" });

    } catch (error) {
        console.error("Error al desbloquear:", error);
        res.status(500).json({ error: "Error interno al intentar desbloquear la misión." });
    }
});


endpointsProgreso.patch("/:id/explorar", validarId, validarIds, verificarEstadoMision, completarMision, mejorarVehiculo, async (req, res) => {
    try {
        //Hay que hacerle la mejora desde el front. Queda así por sí hacemos que pueda mejorar el vehículo por su cuenta.
        await progreso.completarPlaneta(req.params.vehiculo_id, req.body.cuerpo_celeste_id);
        res.status(200).json({ mensaje: "¡Punto explorado con éxito!", combustibleGanado: req.body.nafta, planetaCompletado: cuerpoCompletado });

        

    } catch (error) {
        console.log("Error en explorar:", error);
        res.status(500).json({ error: "Error interno al explorar el punto." });
    }
});