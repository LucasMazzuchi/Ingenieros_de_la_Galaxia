// La función se ocupa de determinar si el vehículo cumple los requisitos para poder viajar.
export const puedeViajar = (vehiculo, planeta) => {
    // Si no hay vehículo, devuelve
    if (!vehiculo) {
        return false;
    }
    //Tipo 1: Rocoso
    //Tipo 2: Gaseoso
    //Tipo 3: Helado
    // Cuerpo tipo 3 necesita la resistencia 3, sino devuelve false.
    if ((planeta.tipo == 3 && vehiculo.resistencia < 3) ||
        (planeta.tipo == 2 && vehiculo.resistencia < 2)) {
        return false;
    }
    // Si el cuerpo tiene diametro mayor a 50000, el motor tiene que ser nivel 3.
    if (planeta.diametro > 50000 && vehiculo.motor < 3) {
        return false;
    }
    // Terreno 1: Desértico
    // Terreno 2: Rocoso
    // Terreno 3: Helado
    if (!(planeta.terreno == 1 && (vehiculo.resistencia >= 1 )) &&
        !(planeta.terreno == 2 && vehiculo.resistencia >= 2) &&
        !(planeta.terreno == 3 && (vehiculo.resistencia == 3 && vehiculo.estructura == 3))){
            return false;
        }
    
    // Si el planeta es habitable, se lo saltea.
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