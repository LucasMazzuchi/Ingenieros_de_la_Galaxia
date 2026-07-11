import { Router } from "express";
import * as vehiculos from "../db/vehiculos.js";
import * as verificaciones from "./verificaciones.js";

export const endpointsVehiculos = Router();

endpointsVehiculos.get("/", async (req, res) => {
    const vehiculos = await getAllVehiculos();
    res.json(vehiculos);
});

endpointsVehiculos.get("/:id", verificaciones.validarId, async (req, res) => {
    const vehiculo = await vehiculos.get(req.params.id)
    if (!vehiculo){
        res.status(404).json({error: "El vehìculo no fue encontrado."})
    } else {
    res.json(vehiculo)
    }
});