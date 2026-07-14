import * as constantes from "../constantes.js";
import {validarEntrada, validarString, validarEntero, validarBool, validarFloat, validarImagen} from "./validaciones_errores.js";

export const validarCuerpoCeleste = (req, res, next) => {
    const reglasCuerpoCeleste = {
    [constantes.NOMBRE]: validarString,
    [constantes.DESCRIPCION]: validarString,
    [constantes.TIPO]: validarEntero,
    [constantes.TERRENO]: validarEntero,
    [constantes.DIAMETRO]: validarEntero,
    [constantes.GRAVEDAD]: validarFloat,
    [constantes.TEMPERATURA]: validarEntero,
    [constantes.HABITABLE]: validarBool,
    [constantes.POS_X]: validarFloat,
    [constantes.POS_Y]: validarFloat,
    [constantes.IMAGEN]: validarImagen
    };
    const entrada = {
    [constantes.NOMBRE]: { campo: req.body.nombre, min: 1, max: constantes.NOMBRE_MAX, error: constantes.NOMBRE },
    [constantes.DESCRIPCION]: { campo: req.body.descripcion, min: 0, max: constantes.DESCRIPCION_MAX, error: constantes.DESCRIPCION },
    [constantes.TIPO]: { campo: req.body.tipo, min: 1, max: constantes.TIPO_MAX, error: constantes.TIPO },
    [constantes.TERRENO]: { campo: req.body.terreno, min: 1, max: constantes.TERRENO_MAX, error: constantes.TERRENO },
    [constantes.DIAMETRO]: { campo: req.body.diametro, min: 1, max: constantes.DIAMETRO_MAX, error: constantes.DIAMETRO },
    [constantes.GRAVEDAD]: { campo: req.body.gravedad, min: 1, max: constantes.GRAVEDAD_MAX, error: constantes.GRAVEDAD },
    [constantes.TEMPERATURA]: { campo: req.body.temperatura, min: constantes.TEMPERATURA_MIN, max: constantes.TEMPERATURA_MAX, error: constantes.TEMPERATURA },
    [constantes.HABITABLE]: { campo: req.body.habitable, error: constantes.HABITABLE },
    [constantes.POS_X]: { campo: req.body.pos_x, min: constantes.COORDENADA_MIN, max: constantes.COORDENADA_MAX, error: constantes.POS_X },
    [constantes.POS_Y]: { campo: req.body.pos_y, min: constantes.COORDENADA_MIN, max: constantes.COORDENADA_MAX, error: constantes.POS_Y },
    [constantes.IMAGEN]: { campo: req.body.imagenURL }
    };
    const {errores, procesados} = validarEntrada(entrada, reglasCuerpoCeleste);
        if (errores.length !== 0){
            res.status(400).json({error:errores});
            return;
        }
        req.body = procesados;
        next();
};