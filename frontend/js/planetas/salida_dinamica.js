import * as constantes from "../constantes.js";
import * as imagenes from "./obtener_imagenes.js";
// La función inicializa los valores dentro del apartado con información del cuerpo celeste utilizando cuerpo_celeste.
export function rellenarApartadoIzquierda(cuerpo_celeste){
    document.getElementById("datoTipo").textContent = constantes.TIPOS_PLANETA[cuerpo_celeste.tipo];
    document.getElementById("datoDiametro").textContent = `${cuerpo_celeste.diametro} km`;
    document.getElementById("datoGravedad").textContent = `${cuerpo_celeste.gravedad} m/s²`;
    document.getElementById("datoTemperatura").textContent = `${cuerpo_celeste.temperatura} °C`;
    document.getElementById("datoTerreno").textContent = constantes.TIPOS_TERRENO[cuerpo_celeste.terreno];
    const habitable = (cuerpo_celeste.habitable === true) ? "Si" : "No";
    document.getElementById("datoHabitable").textContent = `${habitable}`;
    document.getElementById("datoDescripcion").textContent = cuerpo_celeste.descripcion;
}


// La función mueve a la nave de un punto de interés a otro a otro. Bloquea las interacciones mientras la nave se mueve.
export function viajarHacia(coordenadas, vehiculo) {
    document.body.classList.add("bloqueado-viajando");
    vehiculo.style.top = coordenadas.top;
    vehiculo.style.left = coordenadas.left;
    setTimeout(() => {
        document.body.classList.remove("bloqueado-viajando");
    }, 1000); 
}

// La función dibuja el camino entre los puntos de interés pasados por parámetro.
export function dibujarCamino(puntosDeInteres){
    const camino = document.getElementById("camino-polyline");
    const puntos = [];
    puntosDeInteres.forEach(function (punto){
        puntos.push(constantes.COORDENADAS_SVG[punto.posicion-1]);
    })
    camino.setAttribute("points", puntos.join(" "));
}

// La función crea el div y ubica cada nave excepto la del usuario. 
export async function pintarVehiculos(vehiculos, vehiculoUsado){
    vehiculos.forEach( function (vehiculoActual){
        if (vehiculoActual.id === vehiculoUsado.id){
            return;
        }
        const nave = document.createElement("div");
        nave.className = "vehiculo-desuso";
        nave.style.position = "absolute";
        nave.style.top = coordenadasVisuales[vehiculoActual.punto_interes-1].top;
        nave.style.left = coordenadasVisuales[vehiculoActual.punto_interes-1].left;

        if (vehiculoActual.ubicacion_id === 1) {
            nave.innerHTML = `
                <img src="../assets/img/auto1.png">
                <p>${vehiculoActual.nombre}</p>
            `;
        } else {
            const imagen = imagenes.obtenerImagenNave(vehiculoActual);
            nave.innerHTML = `
                <img src= ${imagen}>
                <p>${vehiculoActual.nombre}</p>
            `;
        }
        contenedorMapa.appendChild(nave);
    });
};

export function crearTransicion(posNave, vehiculo, coordenadasVisuales) {
    vehiculo.style.display = "block";
    vehiculo.style.transition = "none";
    vehiculo.style.top = coordenadasVisuales[posNave].top;
    vehiculo.style.left = coordenadasVisuales[posNave].left;
    vehiculo.dataset.indiceActual = posNave;
    setTimeout(() => {vehiculo.style.transition = "top 1s ease, left 1s ease"}, 50);
};

export function crearDivPunto(puntosVisitados, cuerpoCeleste, vehiculoObjetos, puntoInteres, coordenadas){
    const divPunto = document.createElement("div");
    divPunto.className = "punto-interes";
    if (!puntosVisitados.find(function (punto) {return punto.punto_interes_id === puntoInteres.id})) {
        divPunto.classList.add("bloqueado");
    }
    divPunto.style.position = "absolute";
    divPunto.style.top = coordenadas.top;
    divPunto.style.left = coordenadas.left;
    const imagenPunto = imagenes.buscarImagenPunto(puntoInteres.imagen);
    divPunto.innerHTML = `
        <img src="${imagenPunto}" alt="punto de interés">
        <p>${puntoInteres.nombre}</p>
    `;
    return divPunto;
}