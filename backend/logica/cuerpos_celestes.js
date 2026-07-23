export const puedeViajar = (vehiculo, planeta) => {
    // Si no hay vehículo, devuelve
    if (!vehiculo) {
        return false;
    }

    // Cuerpo tipo 3 (estrella) necesita la resistencia máxima, sino devuelve false.
    if ((planeta.tipo == 3 && vehiculo.resistencia < 3) ||
        (planeta.tipo == 2 && vehiculo.resistencia < 2)) {
        return false;
    }

    if (planeta.diametro > 50000 && vehiculo.motor < 3) {
        return false;
    }


    if (!(planeta.terreno == 1 && (vehiculo.resistencia >= 1 )) &&// terreno llano
        !(planeta.terreno == 2 && vehiculo.resistencia >= 2) && // terreno rocoso
        !(planeta.terreno == 3 && (vehiculo.resistencia == 3 && vehiculo.estructura == 3))){ // terreno líquido
            return false;
        }

    if (planeta.habitable == false) {
        // gravedad.
        if ((planeta.gravedad >= 20.0 && vehiculo.motor < 3) || 
            (planeta.gravedad >= 15.0 && vehiculo.motor < 2) || 
            (planeta.gravedad >= 10.0 && vehiculo.motor < 1)) {
                return false;
        }
        // temperatura.
        if ((planeta.temperatura > 300 && vehiculo.estructura < 3 || planeta.temperatura <-200 && vehiculo.estructura < 3) ||
            (planeta.temperatura > 100 && vehiculo.estructura < 2 || planeta.temperatura <-100 && vehiculo.estructura < 2) ||
            (planeta.temperatura > 50 && vehiculo.estructura < 1 || planeta.temperatura <-50 && vehiculo.estructura < 1)) {
                return false;
        }
    }
    return true;
};