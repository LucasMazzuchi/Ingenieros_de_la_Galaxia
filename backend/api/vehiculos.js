import { Router } from "express";
import * as vehiculos from "../db/vehiculos.js";
import * as verificaciones from "./verificaciones.js";

export const endpointsVehiculos = Router();
const reglasVehiculo = {
    nombre:verificaciones.validarNombre,
    tipo:verificaciones.validarTipo,
    motor:verificaciones.validarMotor,
    estructura:verificaciones.validarEstructura,
    color:verificaciones.validarColor,
    combustible:verificaciones.validarCombustible,
    ubicacion:verificaciones.validarUbicacion
};

endpointsVehiculos.get("/", async (req, res) => {
    const vehiculos = await getAllVehiculos();
    res.json(vehiculos);
});

endpointsVehiculos.get("/:id", verificaciones.validarId, async (req, res) => {
    const vehiculo = await vehiculos.get(req.params.id);
    if (!vehiculo){
        res.status(404).json({error: "El vehículo no fue encontrado."});
    } else {
    res.json(vehiculo);
    }
});

endpointsVehiculos.post("/", verificaciones.validarNombre, async (req, res)=> {
    const entrada = {
    nombre:body.nombre,
    tipo:body.tipo,
    motor:body.motor,
    estructura:body.estructura,
    color:body.color,
    combustible:body.combustible,
    ubicacion:body.ubicacion
    };
    const errores = verificaciones.validarEntrada(entrada, reglasVehiculo);
    if (!await vehiculos.createVehiculo(req.body)){
        res.status(500).json({error: "El vehículo no pudo ser agregado."});
    }
});