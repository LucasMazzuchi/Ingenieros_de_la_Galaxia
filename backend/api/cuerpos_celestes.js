import { Router } from "express";
import * as cuerpos from "../bd/cuerpos_celestes.js";
import { validarCuerpoCeleste, validarFiltrosCuerpoCeleste } from "./verificaciones_cuerpo_celeste.js";
import * as constantes from "../constantes.js";
import { validarId, manejarError } from "./validaciones_errores.js";
import { borrarImagen } from "./gestor_imagenes.js";
export const endpointsCuerpoCeleste = Router();
 
endpointsCuerpoCeleste.get("/", validarFiltrosCuerpoCeleste, async (req, res) => {
    try {
        const texto = "SELECT c.id, c.nombre, c.tipo, c.diametro, c.gravedad, c.temperatura, c.habitable, c.terreno FROM cuerpos_celestes as c WHERE c.borrado = FALSE";
        const listaCuerposCelestes = await cuerpos.getAllCuerposCelestes(constantes.consulta(req.query, "cuerpo_celeste", texto));
        res.status(200).json(listaCuerposCelestes);
    } catch(error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});
 
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
 
endpointsCuerpoCeleste.post("/", validarCuerpoCeleste, async (req, res)=> {
    try{
        if (await cuerpos.cantidadCuerposCelestes() >= constantes.CUERPOS_CELESTES_MAX){
            return res.status(403).json({error: constantes.ERROR_ENTIDAD_LLENA("cuerpo celeste", constantes.CUERPOS_CELESTES_MAX)});
        }
        const {cuerpo, id} = await cuerpos.createCuerpoCeleste(req.body)
        if (!cuerpo){
            res.status(500).json({error: constantes.ERROR_CONSULTA("cuerpo celeste", "creada")});
        } else {
            res.status(201).json({exito : constantes.EXITO_CONSULTA("cuerpo celeste", "creada"), id : id});
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});
 
endpointsCuerpoCeleste.patch("/:id", validarId, validarCuerpoCeleste, async (req, res) => {
    try{
        const cuerpoCeleste = await cuerpos.getCuerpoCeleste(req.params.id)
        if (!cuerpoCeleste) {
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        }
        if (!await cuerpos.updateCuerpoCeleste(req.params.id, req.body)){
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            if (req.body.imagen_url !== undefined && req.body.imagen_url !== cuerpoCeleste.imagen_url) { // Borra la imagen anterior.
                const {msjError, error} = await borrarImagen(cuerpoCeleste.imagen_url);
                if (msjError !== ""){
                    return res.status(500).json({msjError: msjError, error: error});
                }
            }
        }
            res.sendStatus(204);
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});
 
endpointsCuerpoCeleste.delete("/:id", validarId, async (req, res) => {
    try{
        const {ok, cuerpoCeleste, tieneDependientes} = await cuerpos.removeCuerpoCeleste(req.params.id);
        if (!ok){
            if (tieneDependientes) {
                return res.status(409).json({error: constantes.ERROR_DEPENDENCIAS, entidad : cuerpoCeleste, tieneDependientes : tieneDependientes});
            }
            return res.status(404).json({error: constantes.ERROR_INEXISTENTE});
        } else {
            if (cuerpoCeleste && cuerpoCeleste.imagen_url) {
                const {msjError, error} = await borrarImagen(cuerpoCeleste.imagen_url);
                if (msjError !== ""){
                    return res.status(500).json({msjError: msjError, error: error});
                }
            }
            res.status(200).json({exito : constantes.EXITO_CONSULTA("cuerpo celeste", "eliminada"), entidad : cuerpoCeleste, tieneDependientes : tieneDependientes});
        }
    } catch (error) {
        const {estado, msjError} = manejarError(error);
        res.status(estado).json({error : msjError});
    }
});
 