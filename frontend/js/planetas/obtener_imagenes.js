
// La función devuelve la imagen de la nave correspondiente según sus atributos.
export function obtenerImagenNave(vehiculoDatos) {
    const { motor, estructura, resistencia } = vehiculoDatos;
    if (motor >= 3 && estructura >= 3 && resistencia >= 3) {
        return "../assets/img/nivel3.png";
    }
    if (motor >= 2 && estructura >= 2 && resistencia >= 2) {
        return "../assets/img/nivel2.png";
    }
    return "../assets/img/nave1.png";
}


// Devuelve la ruta a la imagen que está asociada con imagenId.
export function buscarImagenFondo(imagenId) {
    const imagenes_fondo = {
    1 : "../assets/img/fondo-agujero_negro.jpg",
    2 : "../assets/img/fondo-luna.jpg",
    3 : "../assets/img/fondo-marte.jpg",
    4 : "../assets/img/fondo-mercurio.jpg",
    5 : "../assets/img/fondo-neptuno.jpg",
    6 : "../assets/img/fondo-saturno.jpg",
    7 : "../assets/img/fondo-sol.jpg",
    8 : "../assets/img/fondo-tierra.jpg",
    9 : "../assets/img/fondo-verde.jpg",
    10 : "../assets/img/fondo-violeta.jpg"
  };
  return imagenes_fondo[imagenId];
}

// Devuelve la ruta a la imagen que está asociada con imagenId.
export function buscarImagenPunto(imagenId){
    const imagenes_punto = {
        1: "../assets/img/marcador1.png",
        2: "../assets/img/marcador2.png",
        3: "../assets/img/marcador3.png",
        4: "../assets/img/marcador4.png",
        5: "../assets/img/marcador5.webp"
    }
    return imagenes_punto[imagenId];
}