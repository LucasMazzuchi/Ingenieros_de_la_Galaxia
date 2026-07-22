export const puedeViajar = (vehiculo, planeta) => {
    // Si no hay vehículo o no tiene combustible, devuelve
    if (!vehiculo || vehiculo.combustible <= 0) {
        console.log("❌ RECHAZADO: Vehículo no existe o no tiene combustible.");
        return false;
    }

    // Cuerpo tipo 3 (estrella) necesita la estructura máxima, sino devuelve false.
    if (planeta.tipo === 3 && vehiculo.estructura < 3)  {
        console.log("❌ RECHAZADO: Es estrella y le falta estructura.");
        return false;
    }

    if (planeta.diametro > 50000 && vehiculo.motor < 3) {
        console.log("❌ RECHAZADO: Planeta muy grande y le falta motor.");
        return false;
    }


    if (!(planeta.terreno === 1 && (vehiculo.tipo >= 1 )) &&// terreno llano
        !(planeta.terreno === 2 && vehiculo.tipo === 3) && // terreno rocoso
        !(planeta.terreno === 3 && (vehiculo.tipo === 3 && vehiculo.estructura === 3))){ // terreno líquido
            console.log("❌ RECHAZADO: Terreno incompatible con el tipo de vehículo.");
            return false;
        }

    if (planeta.habitable === false) {
        // gravedad.
        if ((planeta.gravedad >= 20.0 && vehiculo.motor < 3) || 
            (planeta.gravedad >= 15.0 && vehiculo.motor < 2) || 
            (planeta.gravedad >= 10.0 && vehiculo.motor < 1)) {
                console.log("❌ RECHAZADO: Gravedad muy alta para el motor.");
                return false;
        }
        // temperatura.
        if ((planeta.temperatura > 300 && vehiculo.estructura < 3) ||
            (planeta.temperatura > 100 && vehiculo.estructura < 2) ||
            (planeta.temperatura > 50 && vehiculo.estructura < 1)) {
                console.log("❌ RECHAZADO: Temperatura extrema para la estructura.");
                return false;
        }
    }
    console.log("✅ APROBADO: Puede viajar.");
    return true;
};