export const puedeViajar = (vehiculo, planeta) => {
    // Si no hay vehículo o no tiene combustible, devuelve
    if (!vehiculo || vehiculo.combustible <= 0) {
        return false;
    }

    // Cuerpo tipo 3 (estrella) necesita la estructura máxima, sino devuelve false.
    if (planeta.tipo === 3 && vehiculo.estructura < 3)  {
        return false;
    }

    if (planeta.diametro > 50000 && vehiculo.motor < 3) {
        return false;
    }


    if (!(planeta.terreno === 1 && (vehiculo.tipo >= 2 )) &&// terreno llano
        !(planeta.terreno === 2 && vehiculo.tipo === 3) && // terreno rocoso
        !(planeta.terreno === 3 && (vehiculo.tipo === 3 && vehiculo.estructura === 3))){ // terreno líquido
            return false;
        }

    if (planeta.habitable === false) {
        // gravedad.
        if ((planeta.gravedad >= 20.0 && vehiculo.motor < 3) || 
            (planeta.gravedad >= 15.0 && vehiculo.motor < 2) || 
            (planeta.gravedad >= 10.0 && vehiculo.motor < 1)) {
            return false;
        }
        // temperatura.
        if ((planeta.temperatura > 300 && vehiculo.estructura < 3) ||
            (planeta.temperatura > 100 && vehiculo.estructura < 2) ||
            (planeta.temperatura > 50 && vehiculo.estructura < 1)) {
            return false;
        }
    return true;
    }
    return true;
};