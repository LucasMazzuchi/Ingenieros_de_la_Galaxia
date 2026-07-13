import { Router } from "express";
import * as vehiculos from "../db/vehiculos.js";
import * as verificaciones from "./verificaciones.js";
import * as constantes from "../constantes.js";
import * as validaciones from "./validaciones_errores.js"
export const endpointsVehiculos = Router();

endpointsVehiculos.get("/", async (req, res) => {
    const listaVehiculos = await vehiculos.getAllVehiculos();
    res.json(listaVehiculos);
});

endpointsVehiculos.get("/:id", validaciones.validarId, async (req, res) => {
    try {
        const vehiculo = await vehiculos.getVehiculo(req.params.id);
        if (!vehiculo){
            res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.status(200).json(vehiculo);
        }
    } catch (error) {
        const {estado, msjError} = validaciones.manejarError(error);
        res.status(estado).json(msjError);
    }
});

endpointsVehiculos.post("/", verificaciones.validarVehiculo, async (req, res)=> {
    try{
        if (!await vehiculos.createVehiculo(req.body)){
            res.status(500).json({error: constantes.ERROR_CONSULTA("vehiculo", "creada")});
        } else {
            res.status(201).json({exito : constantes.EXITO_CONSULTA("vehiculo", "creada")})
        }
    } catch (error) {
        const {estado, msjError} = validaciones.manejarError(error);
        res.status(estado).json(msjError);
    }
});

endpointsVehiculos.patch("/:id", validaciones.validarId, verificaciones.validarVehiculo, async (req, res) => {
    try{
        if (!await vehiculos.updateVehiculo(req.params.id, req.body)){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.sendStatus(204)
        }
    } catch (error) {
        const {estado, msjError} = validaciones.manejarError(error);
        res.status(estado).json(msjError);
    }
});

endpointsVehiculos.delete("/:id", validaciones.validarId, async (req, res) => {
    try{
        const {ok, vehiculo} = await vehiculos.removeVehiculo(req.params.id);
        if (!ok){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.status(200).json({exito : constantes.EXITO_CONSULTA, entidad : vehiculo});
        }
    } catch (error) {
        const {estado, msjError} = validaciones.manejarError(error);
        res.status(estado).json(msjError);
    }
});