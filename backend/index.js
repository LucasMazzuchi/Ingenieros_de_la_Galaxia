import express from "express";
import cors from "cors";
import {endpointsVehiculos} from "./api/vehiculos.js";
import {endpointsCuerpoCeleste} from "./api/cuerpos_celestes.js";
import {endpointsMisiones} from "./api/misiones.js";
import { endpointsProgreso } from "./api/progreso.js";
import { inicializarBd } from "./bd/pool.js";
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/vehiculos", endpointsVehiculos);
app.use("/api/cuerpos_celestes", endpointsCuerpoCeleste);
app.use("/api/misiones", endpointsMisiones);
app.use("/api/progreso", endpointsProgreso);
// Healthcheck, falta agregar el de la bd.
app.get('/health', (req, res) => {
    res.status(200).send("OK");
});
await inicializarBd();
app.get('/', (req, res) => {
  res.send('¡Servidor de Ingenieros de la Galaxia funcionando!');
});

const server = app.listen(port, () => {
    console.log(`API escuchando en el puerto ${port}`);
  });
