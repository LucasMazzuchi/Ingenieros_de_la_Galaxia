import { Router } from "express";
import * as vehiculos from "../bd/vehiculos.js";
import {validarVehiculo, validarFiltrosVehiculo} from "./verificaciones_vehiculo.js";
import * as constantes from "../constantes.js";
import {validarId, manejarError} from "./validaciones_errores.js";
export const endpointsVehiculos = Router();

// El endpoint responde con un código 200 y todos los vehìculos que cumplen con los filtros
// dentro de req.body. En caso de ocurrir un error, responde con un estado y un mensaje determinado por manejarError.
endpointsVehiculos.get("/", validarFiltrosVehiculo, async (req, res) => {
    try {
        const listaVehiculos = await vehiculos.getAllVehiculos(req.query, "vehiculo");
        res.status(200).json(listaVehiculos);
    } catch(error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});

// El endpoint responde con un código 200 y el vehìculo que está asociado al id pasado
// por req.params. En caso de no exisitir, responde con un código 404 y el mensaje de error.
// Si ocurre un error, responde con un estado y un mensaje determinado por manejarError.
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

// El endpoint crea un vehículo con los campos pasados por req.body y responde
// con un código 201 junto con el id de la entidad creada.
// En caso de no haberse podido crear el vehículo, responde con un 500 y el mensaje de error.
// Si ocurre un error, responde con un estado y un mensaje determinado por manejarError.
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

// El endpoint modifica un vehículo con los campos pasados por req.body y responde con un código 204.
// En caso de no exisitir, responde con un código 404 y el mensaje de error.
// Si ocurre un error, responde con un estado y un mensaje determinado por manejarError.
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

// El endpoint elimina un vehículo asociado al id pasado por req.params y responde con un
// código 200, el mensaje de éxito y la entidad borrada. En caso de no exisitir un vehículo
// asociado al id, responde con un código 404 y el mensaje de error.
// Si ocurre un error, responde con un estado y un mensaje determinado por manejarError.
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

// El endpoint agrega un punto de mejora al vehículo asociado al id pasado por req.params y
// responde un 200 con un mensaje de éxito. Si no existe responde un 404 con el mensaje de error.
// En caso de tener todos los campos de mejora al máximo responde con un 403 y el mensaje de error.
// Si la entidad no pudo ser actualizada responde con un 400.
// Si ocurre un error, responde con un estado y un mensaje determinado por manejarError.
endpointsVehiculos.get("/:id/mejorar", validarId, async(req, res) => { // Pasar a patch
    try {
        const vehiculo = vehiculos.getVehiculo(req.params.id);
        if (!vehiculo){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        }
        if (vehiculo.motor === 3 && vehiculo.estructura === 3 && vehiculo.resistencia === 3){ // Modificar esta verificación para que tenga en cuenta los puntos de mejora
            return res.status(403).json({error: "La nave ya alcanzó el máximo nivel."}); //Hacer constante.
        }
        const ok = vehiculos.updateVehiculo(req.params.id, {puntos : vehiculo.puntos+1});
        if (!ok){
            return res.status(400).json({error: constantes.ERROR_CONSULTA("vehiculo", "mejorada.")});
        }
        return res.status(200).json({mensaje: "El vehículo fue mejorado correctamente."}) // Hacer constante.
    } catch (error){
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
})