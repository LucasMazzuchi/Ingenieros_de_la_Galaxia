import { getVehiculo, updateVehiculo } from "../bd/vehiculos";
export const mejorarVehiculo = (req, res) => {
    const vehiculoDatos = getVehiculo(req.params.id);
    const campos = ["motor", "estructura", "resistencia"]
    let campoMejora = campos[0];
    campos.forEach(function (campo){
        if (vehiculoDatos[campo]<vehiculoDatos[campoMejora]){
            campoMejora = campo;
        }
    });
    const mejora = vehiculoDatos[campoMejora]+1;
    if (vehiculoDatos[campoMejora] < 3) {
        await updateVehiculo(req.params.id, {campoMejora : 1})
        next()
    }
};