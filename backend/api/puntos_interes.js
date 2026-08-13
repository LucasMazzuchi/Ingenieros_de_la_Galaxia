import { Router } from "express";
import * as puntosInteres from "../bd/puntos_interes.js";
import {validarPuntoInteres, validarFiltrosPuntoInteres } from "./verificaciones_punto_interes.js";
import * as constantes from "../constantes.js";
import {validarId, manejarError} from "./validaciones_errores.js";
export const endpointsPuntosInteres = Router();
 
// El endpoint responde con un código 200 y todos los puntos de interés que cumplen con los filtros
// dentro de req.body. En caso de ocurrir un error, responde con un estado y un mensaje determinado por manejarError.
endpointsPuntosInteres.get("/", validarFiltrosPuntoInteres, async (req, res) => {
    try {
        const listaPuntos = await puntosInteres.getAllPuntos(req.query);
        res.status(200).json(listaPuntos);
    } catch(error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});

// El endpoint responde con un código 200 y el punto de interés que está asociado al id pasado
// por req.params. En caso de no exisitir, responde con un código 404 y el mensaje de error.
// Si ocurre un error, responde con un estado y un mensaje determinado por manejarError.
endpointsPuntosInteres.get("/:id", validarId, async (req, res) => {
    try {
        const puntoInteres = await puntosInteres.getPunto(req.params.id);
        if (!puntoInteres){
            res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.status(200).json(puntoInteres);
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});

// El endpoint crea un punto de interés con los campos pasados por req.body y responde
// con un código 201 junto con el id de la entidad creada. Si no se pueden crear más 
// puntos de interés en un cuerpo celeste porque ya se llego al máximo, responde con un 403 y el error.
// En caso de no haberse podido crear el punto de interés, responde con un 500 y el mensaje de error.
// Si ocurre un error, responde con un estado y un mensaje determinado por manejarError.
endpointsPuntosInteres.post("/", validarPuntoInteres, async (req, res)=> {
    try{
        const {puntoInteres, id, max} = await puntosInteres.createPunto(req.body);
        if (max){
            return res.status(403).json({error: constantes.ERROR_ENTIDAD_LLENA("punto_interes", constantes.PUNTOS_MAX, "por planeta.")});
        }
        const resId = id;
        if (!puntoInteres){
            res.status(500).json({error: constantes.ERROR_CONSULTA("punto_interes", "creado")});
        } else {
            res.status(201).json({exito : constantes.EXITO_CONSULTA("punto_interes", "creado"), id : resId});
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});
 
// El endpoint modifica un punto de interés con los campos pasados por req.body y responde con un código 204.
// Si se trata de modificar el punto de interés con id 1 responde con un 403 y el mensaje de error.
// En caso de no exisitir, responde con un código 404 y el mensaje de error. Si ocurre un error, responde con
// un estado y un mensaje determinado por manejarError.
endpointsPuntosInteres.patch("/:id", validarId, validarPuntoInteres, async (req, res) => {
    try{
        if (req.body.cuerpo_celeste_id === 1) {
            return res.status(403).json({error: constantes.ERROR_TIERRA});
        }
        if (!await puntosInteres.updatePunto(req.params.id, req.body)){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.sendStatus(204);
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});

// El endpoint elimina un punto de interés asociado al id pasado por req.params y responde con un
// código 200, el mensaje de éxito y la entidad borrada. Si se trata de modificar el punto de interés
// con cuerpo_celeste_id 1 responde con un 403 y el mensaje de error. En caso de no exisitir un punto de interés
// asociado al id, responde con un código 404 y el mensaje de error. Si ocurre un error, responde
// con un estado y un mensaje determinado por manejarError.
endpointsPuntosInteres.delete("/:id", validarId, async (req, res) => {
    try {
        //Buscamos el punto de interés en la base de datos para chequear el id del cuerpo_celeste_id.
        const puntoInteresGuardado = await puntosInteres.getPunto(req.params.id);
        if (!puntoInteresGuardado) {
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        }

        if (puntoInteresGuardado.cuerpo_celeste_id === 1) {
            return res.status(403).json({error: constantes.ERROR_TIERRA});
        }
        //Si no es de la Tierra, se borra
        const {ok, puntoInteres} = await puntosInteres.removePunto(parseInt(puntoInteresGuardado.posicion), parseInt(puntoInteresGuardado.cuerpo_celeste_id), req.params.id);
        
        if (!ok){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.status(200).json({exito : constantes.EXITO_CONSULTA("punto_interes", "eliminada"), entidad : puntoInteres});
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});