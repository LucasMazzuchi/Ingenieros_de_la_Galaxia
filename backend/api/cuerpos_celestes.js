import { Router } from "express";
import * as cuerpos from "../bd/cuerpos_celestes.js";
import { validarCuerpoCeleste, validarFiltrosCuerpoCeleste, validarTierra } from "./verificaciones_cuerpo_celeste.js";
import * as constantes from "../constantes.js";
import { validarId, manejarError } from "./validaciones_errores.js";
import * as logica from "../logica/cuerpos_celestes.js";
import { getVehiculo } from "../bd/vehiculos.js";

export const endpointsCuerpoCeleste = Router();

// El endpoint responde con un código 200 y todos los cuerpos celestes que cumplen con los filtros
// dentro de req.body. En caso de tener vehiculo_id en req.body, también responde con el campo
// disponible, determinado por la función puedeViajar. En caso de ocurrir un error, responde
// con un estado y un mensaje determinado por manejarError.
endpointsCuerpoCeleste.get("/", validarFiltrosCuerpoCeleste, async (req, res) => {
    try {        
        const { vehiculo_id, ...sinVehiculo } = req.query;
        let listaCuerposCelestes = await cuerpos.getAllCuerposCelestes(sinVehiculo, "cuerpo_celeste");
        if (vehiculo_id) { 
            const vehiculoUsuario = await getVehiculo(vehiculo_id);
            listaCuerposCelestes = listaCuerposCelestes.map(planeta => {
                return {
                    ...planeta, // Desempaqueta todas las propiedades originales del planeta
                    disponible: logica.puedeViajar(vehiculoUsuario, planeta) // Agrega la nueva
                };
            });
        }
        res.status(200).json(listaCuerposCelestes);
    } catch(error) {
        const { estado, msjError } = manejarError(error);
        res.status(estado).json({ error: msjError });
    }
});
 
// El endpoint responde con un código 200 y el cuerpo celeste que está asociado al id pasado
// por req.params. En caso de no exisitir, responde con un código 404 y el mensaje de error.
// Si ocurre un error, responde con un estado y un mensaje determinado por manejarError.
endpointsCuerpoCeleste.get("/:id", validarId, async (req, res) => {
    try {
        const cuerpoCeleste = await cuerpos.getCuerpoCeleste(req.params.id);
        if (!cuerpoCeleste){
            res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.status(200).json(cuerpoCeleste);
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});

// El endpoint crea un cuerpo celeste con los campos pasados por req.body y responde con un código 201
// junto con el id de la entidad creada. Si no se pueden crear más cuerpos celestes porque ya
// se llego al máximo, responde con un 403 y el error. En caso de no haberse podido crear el
// cuerpo celeste, responde con un 500 y el mensaje de error. Si ocurre un error, responde con
// un estado y un mensaje determinado por manejarError.
endpointsCuerpoCeleste.post("/", validarCuerpoCeleste, async (req, res)=> {
    try{
        const {cuerpo, id, max} = await cuerpos.createCuerpoCeleste(req.body)
        if (max){
            return res.status(403).json({error: constantes.ERROR_ENTIDAD_LLENA("cuerpo celeste", constantes.CUERPOS_CELESTES_MAX)});
        }
        if (!cuerpo){
            return res.status(500).json({error: constantes.ERROR_CONSULTA("cuerpo celeste", "creada")});
        }
        res.status(201).json({exito : constantes.EXITO_CONSULTA("cuerpo celeste", "creada"), id : id});
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});
// El endpoint modifica un cuerpo celeste con los campos pasados por req.body y responde con un código 204.
// Si se trata de modificar el cuerpo celeste con id 1 responde con un 403 y el mensaje de error.
// En caso de no exisitir, responde con un código 404 y el mensaje de error. Si ocurre un error, responde con
// un estado y un mensaje determinado por manejarError.
endpointsCuerpoCeleste.patch("/:id", validarId, validarCuerpoCeleste, validarTierra, async (req, res) => {
    try{
        if (!await cuerpos.updateCuerpoCeleste(req.params.id, req.body)){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        }
        res.sendStatus(204);
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});
 
// El endpoint elimina un cuerpo celeste asociado al id pasado por req.params y responde con un
// código 200, el mensaje de éxito y la entidad borrada. Si se trata de modificar el cuerpo celeste
// con id 1 responde con un 403 y el mensaje de error. En caso de no exisitir, responde con un código 404
// y el mensaje de error. Si ocurre un error, responde con un estado y un mensaje determinado por manejarError.
endpointsCuerpoCeleste.delete("/:id", validarId, validarTierra, async (req, res) => {
    try{
        const {cuerpo, puntosInteres, vehiculos} = await cuerpos.removeCuerpoCeleste(req.params.id);
        if (!cuerpo && puntosInteres.length === 0  && vehiculos.length === 0){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        }
        res.status(200).json({exito : constantes.EXITO_CONSULTA("cuerpo celeste", "eliminada"), entidad : cuerpo});
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});
 