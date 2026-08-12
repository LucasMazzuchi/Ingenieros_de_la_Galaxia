function actualizarPuntosInteres (selectPunto, puntosInteres, planetaId) { // Pasar por params selectPunto, puntosInteres, planetaId
    selectPunto.innerHTML = '<option value="">-- Crear nuevo --</option>'; // Este hay que sacarlo afuera de la función
    const planetaId = parseInt(selectPlanetaPunto.value);
    const puntosInteresFiltrados = !planetaId ? puntosInteres : puntosInteres.filter(function (puntoInteres) {
    return puntoInteres.cuerpo_celeste_id == planetaId;
    });
    puntosInteresFiltrados.forEach(puntoInteres => {
    const opcion = document.createElement("option");
    opcion.value = puntoInteres.id;
    opcion.textContent = puntoInteres.nombre;
    selectPunto.appendChild(opcion);
    });
};


function actualizarPosiciones(selectPosicion, planetaId, puntoInteresId, puntosInteres) {// Pasar selectPosicion, planetaId, puntoInteresId, puntosInteres
    selectPosicion.innerHTML = '<option value="">-- Seleccione posición --</option>';
    const puntosInteresDelPlaneta = new Set(puntosInteres.filter(function (puntoInteres) {
    return (puntoInteres.cuerpo_celeste_id === planetaId && puntoInteres.id !== puntoInteresId);
    }).map(function (puntoInteres) {return parseInt(puntoInteres.posicion)})); 
    for (let i = 1; i <= 3; i++) { 
    if (!puntosInteresDelPlaneta.has(i)) {
        const opcion = document.createElement("option");
        opcion.value = i;
        opcion.textContent = `${i}`;
        selectPosicion.appendChild(opcion);
    }
    }
};

