import express from "express";
import cors from "cors";
import {endpointsVehiculos} from "./api/vehiculos.js";
import {endpointsCuerpoCeleste} from "./api/cuerpos_celestes.js";
import {endpointsPuntosInteres} from "./api/puntos_interes.js";
import { endpointsProgreso } from "./api/progreso.js";
import { inicializarBd, db } from "./bd/pool.js";
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/vehiculos", endpointsVehiculos);
app.use("/api/cuerpos_celestes", endpointsCuerpoCeleste);
app.use("/api/puntos_interes", endpointsPuntosInteres);
app.use("/api/progreso", endpointsProgreso);
// Healthcheck para render.
app.get('/health', async (req, res) => {
  try{
    await db.query(`SELECT 1`);
    res.status(200).send("OK");
  } catch (error) {
      console.error("Healthcheck de Base de Datos falló:", error);
      res.status(500).send("ERROR");
  }
});
await inicializarBd();
app.get('/', (req, res) => {
  res.send('¡Servidor de Ingenieros de la Galaxia funcionando!');
});

const server = app.listen(port, () => {
    console.log(`API escuchando en el puerto ${port}`);
  });
