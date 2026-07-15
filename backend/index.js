import express from "express";
import {endpointsVehiculos} from "./backend/vehiculos.js"
import {endpointsCuerposCelestes} from "./backend/cuerpos_celestes.js"
import {endpointsMisiones} from "./backend/misiones.js"

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
app.use(cors({
    origin: 'https://url' // Hay que agregar la url del front
}));