import { Router } from "express";
import * as misiones from "../bd/misiones.js";
import {validarMision, validarFiltrosMision } from "./verificaciones_mision.js";
import * as constantes from "../constantes.js";
import {validarId, manejarError} from "./validaciones_errores.js";
export const endpointsMisiones = Router();
 
// El endpoint responde con un código 200 y todos los puntos de interés que cumplen con los filtros
// dentro de req.body. En caso de ocurrir un error, responde con un estado y un mensaje determinado por manejarError.
endpointsMisiones.get("/", validarFiltrosMision, async (req, res) => {
    try {
        const listaMisiones = await misiones.getAllMisiones(req.query);
        res.status(200).json(listaMisiones);
    } catch(error) {
        console.log(error);
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});

// El endpoint responde con un código 200 y el punto de interés que está asociado al id pasado
// por req.params. En caso de no exisitir, responde con un código 404 y el mensaje de error.
// Si ocurre un error, responde con un estado y un mensaje determinado por manejarError.
endpointsMisiones.get("/:id", validarId, async (req, res) => {
    try {
        const mision = await misiones.getMision(req.params.id);
        if (!mision){
            res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.status(200).json(mision);
        }
    } catch (error) {
        console.log(error);
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});

// El endpoint crea un punto de interés con los campos pasados por req.body y responde
// con un código 201 junto con el id de la entidad creada. Si no se pueden crear más 
// puntos de interés en un cuerpo celeste porque ya se llego al máximo, responde con un 403 y el error.
// En caso de no haberse podido crear el punto de interés, responde con un 500 y el mensaje de error.
// Si ocurre un error, responde con un estado y un mensaje determinado por manejarError.
endpointsMisiones.post("/", validarMision, async (req, res)=> {
    try{
        const {mision, id, max} = await misiones.createMision(req.body);
        if (max){
            return res.status(403).json({error: constantes.ERROR_ENTIDAD_LLENA("mision", constantes.MISIONES_MAX, "por planeta.")});
        }
        const resId = id;
        if (!mision){
            res.status(500).json({error: constantes.ERROR_CONSULTA("mision", "creada")});
        } else {
            res.status(201).json({exito : constantes.EXITO_CONSULTA("mision", "creada"), id : resId});
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
endpointsMisiones.patch("/:id", validarId, validarMision, async (req, res) => { // Agregar validación para no poder modificar puntos en la Tierra.
    try{
        if (req.body.cuerpo_celeste_id === 1) {
            return res.status(403).json({error: "No se pueden modificar misiones asociadas a la Tierra."})
        }
        if (!await misiones.updateMision(req.params.id, req.body)){
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
endpointsMisiones.delete("/:id", validarId, async (req, res) => {
    try {
        //Buscamos la misión en la base de datos para chequear el id del cuerpo_celeste_id.
        const misionGuardada = await misiones.getMision(req.params.id);
        console.log("Datos de la misión:", misionGuardada); // sacar
        if (!misionGuardada) {
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        }

        if (misionGuardada.cuerpo_celeste_id === 1) {
            return res.status(403).json({error: "No se pueden eliminar misiones asociadas a la Tierra."});
        }

        //Si no es de la Tierra, se borra
        const {ok, mision} = await misiones.removeMision(parseInt(misionGuardada.posicion), parseInt(misionGuardada.cuerpo_celeste_id), req.params.id);
        
        if (!ok){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.status(200).json({exito : constantes.EXITO_CONSULTA("mision", "eliminada"), entidad : mision});
        }
    } catch (error) {
        console.log(error); // Sacar
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});