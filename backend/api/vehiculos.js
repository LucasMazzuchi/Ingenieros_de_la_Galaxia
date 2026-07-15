import { Router } from "express";
import * as vehiculos from "../bd/vehiculos.js";
import {validarVehiculo, validarFiltrosVehiculo} from "./verificaciones_vehiculo.js";
import * as constantes from "../constantes.js";
import {validarId, manejarError} from "./validaciones_errores.js";
export const endpointsVehiculos = Router();

endpointsVehiculos.get("/", validarFiltrosVehiculo, async (req, res) => {
    try {
        const texto = "SELECT v.id, v.nombre, v.tipo, c.nombre as ubicacion, v.motor, v.estructura, v.color, v.combustible FROM Vehiculos as v, CuerposCelestes as c WHERE c.id=v.ubicacionId AND v.borrado = FALSE";
        const listaVehiculos = await vehiculos.getAllVehiculos(constantes.consulta(req.query, "vehiculo", texto));
        res.json(listaVehiculos);
    } catch(error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});

endpointsVehiculos.get("/:id", validarId, async (req, res) => {
    try {
        const vehiculo = await vehiculos.getVehiculo(req.params.id);
        if (!vehiculo){
            res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.status(200).json(vehiculo);
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});

endpointsVehiculos.post("/", validarVehiculo, async (req, res)=> {
    try{
        if (!await vehiculos.createVehiculo(req.body)){
            res.status(500).json({error: constantes.ERROR_CONSULTA("vehiculo", "creada")});
        } else {
            res.status(201).json({exito : constantes.EXITO_CONSULTA("vehiculo", "creada")});
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});

endpointsVehiculos.patch("/:id", validarId, validarVehiculo, async (req, res) => {
    try{
        if (!await vehiculos.updateVehiculo(req.params.id, req.body)){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.sendStatus(204);
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});

endpointsVehiculos.delete("/:id", validarId, async (req, res) => {
    try{
        const {ok, vehiculo} = await vehiculos.removeVehiculo(req.params.id);
        if (!ok){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.status(200).json({exito : constantes.EXITO_CONSULTA("vehiculo", "eliminada"), entidad : vehiculo});
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});