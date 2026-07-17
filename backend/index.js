import express from "express";
import cors from "cors";
import {endpointsVehiculos} from "./api/vehiculos.js";
import {endpointsCuerpoCeleste} from "./api/cuerpos_celestes.js";
import {endpointsMisiones} from "./api/misiones.js";
import {endpointsImagenes} from "./api/imagen.js";

const app = express();
const port = 3000;

app.use(cors({
    origin: 'https://url' // Hay que agregar la url del front
}));

app.use(express.json());
//Habilita la ruta para el frontend
app.use('/imagenes', express.static(path.join(process.cwd(), 'imagenes')));
app.use("/api/vehiculos", endpointsVehiculos);
app.use("/api/cuerpos_celestes", endpointsCuerpoCeleste);
app.use("/api/misiones", endpointsMisiones);
app.use("/api/imagenes", endpointsImagenes);

app.get('/', (req, res) => {
  res.send('¡Servidor de Ingenieros de la Galaxia funcionando!');
});

app.listen(port, () => {
  console.log(`API escuchando en el puerto ${port}`);
});