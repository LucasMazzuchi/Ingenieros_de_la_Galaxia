import express from "express";
import cors from "cors";
import {endpointsVehiculos} from "./api/vehiculos.js";
import {endpointsCuerpoCeleste} from "./api/cuerpos_celestes.js";
import {endpointsMisiones} from "./api/misiones.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());
app.use("/api/vehiculos", endpointsVehiculos);
app.use("/api/cuerpos_celestes", endpointsCuerpoCeleste);
app.use("/api/misiones", endpointsMisiones);
app.get('/health', (req, res) => {
    res.status(200).send("OK");
});
await inicializarBD();
app.get('/', (req, res) => {
  res.send('¡Servidor de Ingenieros de la Galaxia funcionando!');
});

const server = app.listen(port, () => {
    console.log(`API escuchando en el puerto ${port}`);
  });
export default app;