import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import {fileURLToPath} from "url";

const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });


const subirLocal = (file, nombreArchivo) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const carpetaDestino = path.join(__dirname, "..", "publico", "imagenes");
    if (!fs.existsSync(carpetaDestino)) {
        fs.mkdirSync(carpetaDestino, { recursive: true });
    }

    const rutaCompleta = path.join(carpetaDestino, nombreArchivo);
    fs.writeFileSync(rutaCompleta, file.buffer);

    return `/imagenes/${nombreArchivo}`;
};

const borrarLocal = (imagenURL) => {
    try {
        const nombreArchivo = imagenURL.replace("/imagenes/", "");
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const rutaCompleta = path.join(__dirname, "..", "publico", "imagenes", nombreArchivo);
        if (fs.existsSync(rutaCompleta)) {
            fs.unlinkSync(rutaCompleta);
        }
        return {msjError: "", error: ""};
    } catch (error) {
        return {msjError: "Error borrando imagen local:", error: error};
    }
};


const subirNube = async (file, nombreArchivo) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "ingenieros_galaxia", public_id: nombreArchivo },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        stream.end(file.buffer);
    });
};

const borrarNube = async (imagenURL) => {
    try {
        const publicId = imagenURL.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`ingenieros_galaxia/${publicId}`);
        return {msjError: "", error: ""};
    } catch (error) {
        return {msjError: "Error borrando imagen en la nube:", error : error};
    }
};


export const procesarSubida = async (file) => {
    const modo = process.env.MODO_ALMACENAMIENTO;
    const nombreArchivo = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    if (modo === "nube") {
        return await subirNube(file, nombreArchivo);
    } else {
        return subirLocal(file, nombreArchivo);
    }
};

export const borrarImagen = async (imagenURL) => {
    if (!imagenURL) return {msjError: "", error: ""};

    const modo = process.env.MODO_ALMACENAMIENTO;
    if (modo === "nube" && imagenURL.startsWith("http")) {
        return await borrarNube(imagenURL);
    } 
    else if (modo === "local" && imagenURL.startsWith("/imagenes/")) {
        return borrarLocal(imagenURL);
    }
    return {msjError: "", error: ""}
};