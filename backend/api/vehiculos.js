import { Router } from "express";
import * as vehiculos from "../bd/vehiculos.js";
import {validarVehiculo, validarFiltrosVehiculo} from "./verificaciones_vehiculo.js";
import * as constantes from "../constantes.js";
import {validarId, manejarError} from "./validaciones_errores.js";
import { logicaVehiculo } from "../logica/vehiculos.js";
export const endpointsVehiculos = Router();

endpointsVehiculos.get("/", validarFiltrosVehiculo, async (req, res) => {
    try {
        const listaVehiculos = await vehiculos.getAllVehiculos(req.query, "vehiculo");
        res.status(200).json(listaVehiculos);
    } catch(error) {
        console.log(error);
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
        const { vehiculo, id} = await vehiculos.createVehiculo(req.body);
        if (!vehiculo){    
            return res.status(500).json({error: constantes.ERROR_CONSULTA("vehiculo", "creada")});
        }
        res.status(201).json({exito : constantes.EXITO_CONSULTA("vehiculo", "creada"), id: id});
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

endpointsVehiculos.get("/:id/mejorar", validarId, async(req, res) => {
    try {
        const vehiculo = vehiculos.getVehiculo(req.params.id);
        if (!vehiculo){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        }
        const {campoMejora, mejora} = logicaVehiculo(vehiculo);
        if (!campoMejora && !mejora){
            return res.status(403).json({error: "La nave ya alcanzó el máximo nivel."});
        }
        const ok = vehiculos.updateVehiculo(req.params.id, {[campoMejora] : mejora});
        if (!ok){
            return res.status(400).json({error: constantes.ERROR_CONSULTA("vehiculo", "mejorada.")});
        }
        return res.status(200).json({campoMejora : campoMejora, mejora : mejora})
    } catch (error){
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
})