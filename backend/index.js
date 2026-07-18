import express from "express";
import cors from "cors";
import path from "path";
import {fileURLToPath} from "url";
import {endpointsVehiculos} from "./api/vehiculos.js";
import {endpointsCuerpoCeleste} from "./api/cuerpos_celestes.js";
import {endpointsMisiones} from "./api/misiones.js";
import {endpointsImagenes} from "./api/imagen.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:8080' // Hay que agregar la url del front
}));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json());
app.use('/imagenes', express.static(path.join(__dirname, "publico", "imagenes")));
app.use("/api/vehiculos", endpointsVehiculos);
app.use("/api/cuerpos_celestes", endpointsCuerpoCeleste);
app.use("/api/misiones", endpointsMisiones);
app.use("/api/imagenes", endpointsImagenes);

app.get('/', (req, res) => {
  res.send('¡Servidor de Ingenieros de la Galaxia funcionando!');
});

const server = app.listen(port, () => {
    console.log(`API escuchando en el puerto ${port}`);
  });
export default app;