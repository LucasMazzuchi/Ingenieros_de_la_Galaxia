import { Router } from "express";
import { upload, procesarSubida } from "./gestor_imagenes.js";

export const endpointsImagenes = Router();

endpointsImagenes.post("/", upload.single("imagen"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se envió ningún archivo físico." });
        }
        const ruta = await procesarSubida(req.file);
        
        res.status(201).json({ exito: "Imagen subida", imagen_url: ruta });

    } catch (error) {
        res.status(500).json({ error: "Ocurrió un error al procesar la subida de la imagen." });
    }
});