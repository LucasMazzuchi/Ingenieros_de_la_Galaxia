import { getVehiculo, updateVehiculo } from "../bd/vehiculos.js";
export const mejorarVehiculo = async (req, res, next) => {
    const vehiculoDatos = await getVehiculo(req.params.id);
    const campos = ["motor", "estructura", "resistencia"]
    let campoMejora = campos[0];
    campos.forEach(function (campo){
        if (vehiculoDatos[campo]<vehiculoDatos[campoMejora]){
            campoMejora = campo;
        }
    });
    const mejora = vehiculoDatos[campoMejora]+1;
    console.log(mejora);
    if (vehiculoDatos[campoMejora] < 3) {
        const resMejora = await updateVehiculo(req.params.id, {[campoMejora] : mejora});
    }
    next()
};