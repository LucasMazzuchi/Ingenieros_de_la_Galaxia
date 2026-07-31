import { getVehiculo, updateVehiculo } from "../bd/vehiculos.js";
export const mejorarVehiculo = async (req, res, next) => {
    const vehiculoDatos = await getVehiculo(req.params.id);
    campoMejora, mejora = logicaVehiculo(vehiculoDatos);
    const resMejora = await updateVehiculo(req.params.id, {[campoMejora] : mejora});
    next()
};

export const logicaVehiculo = (vehiculo) => {
    const campos = ["motor", "estructura", "resistencia"]
    let campoMejora = campos[0];
    campos.forEach(function (campo){
        if (vehiculo[campo]<vehiculo[campoMejora]){
            campoMejora = campo;
        }
    }); 
    const mejora = vehiculo[campoMejora]+1;
    console.log(mejora);
    if (vehiculo[campoMejora] < 3) {
        return {campoMejora : campoMejora, mejora: mejora};
    }
    return {campoMejora : undefined, mejora: undefined};
};