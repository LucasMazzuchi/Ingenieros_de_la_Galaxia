import { Router } from "express";
import * as misiones from "../bd/misiones.js";
import {validarMision, validarFiltrosMision } from "./verificaciones_mision.js";
import * as constantes from "../constantes.js";
import {validarId, manejarError} from "./validaciones_errores.js";
export const endpointsMisiones = Router();
 
endpointsMisiones.get("/", validarFiltrosMision, async (req, res) => {
    try {

        const texto = `SELECT m.id, m.nombre, c.nombre AS cuerpo_celeste, m.descripcion, m.porcentaje, m.disponible FROM misiones as m, cuerpos_celestes as c WHERE c.id = m.cuerpo_celeste_id AND m.borrado = FALSE AND c.borrado = FALSE`;
        const listaMisiones = await misiones.getAllMisiones(constantes.consulta(req.query, "mision", texto));
        res.json(listaMisiones);
    } catch(error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});
 
endpointsMisiones.get("/:id", validarId, async (req, res) => {
    try {
        const mision = await misiones.getMision(req.params.id);
        if (!mision){
            res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.status(200).json(mision);
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});
 
endpointsMisiones.post("/", validarMision, async (req, res)=> {
    try{
        if (await misiones.cantidadMisiones(req.body.cuerpo_celeste_id) >= constantes.MISIONES_MAX){
            return res.status(403).json({error: constantes.ERROR_ENTIDAD_LLENA("mision", constantes.MISIONES_MAX, "por planeta.")});
        }
        const {mision, id} = await misiones.createMision(req.body);
        if (!mision){
            res.status(500).json({error: constantes.ERROR_CONSULTA("mision", "creada")});
        } else {
            res.status(201).json({exito : constantes.EXITO_CONSULTA("mision", "creada"), id : id});
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});
 
endpointsMisiones.patch("/:id", validarId, validarMision, async (req, res) => {
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
 
endpointsMisiones.delete("/:id", validarId, async (req, res) => {
    try {
        //Buscamos la misión en la base de datos para ver sus datos reales
        const misionGuardada = await misiones.getMision(req.params.id);
        
        if (!misionGuardada) {
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        }

        if (misionGuardada.cuerpo_celeste_id === 1) {
            return res.status(403).json({error: "No se pueden eliminar misiones asociadas a la Tierra."});
        }

        //Si no es de la Tierra, procedemos a borrarla
        const {ok, mision} = await misiones.removeMision(req.params.id);
        
        if (!ok){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            res.status(200).json({exito : constantes.EXITO_CONSULTA("mision", "eliminada"), entidad : mision});
        }
    } catch (error) {
        console.error("ERROR REAL AL BORRAR:", error);
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});