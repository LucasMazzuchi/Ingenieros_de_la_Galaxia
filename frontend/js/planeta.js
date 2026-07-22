document.addEventListener("DOMContentLoaded", async () => {

  // Leer el ID del planeta desde la URL
  const params = new URLSearchParams(window.location.search);
  const planetaId = params.get("id");

//Chequea que pueda ingresar al planeta.
async function iniciarPlaneta() {
    // 1. Leemos a qué planeta intentó entrar desde la URL
    const parametros = new URLSearchParams(window.location.search);
    const planetaId = parametros.get("id");

    if (!planetaId) {
        window.location.href = "galaxia.html"; // si no hay ID, retorna
        return;
    }

    try {
        const resVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}?tipo=1`);
        const vehiculoDatos = await resVehiculo.json();

        const resPlaneta = await fetch(`${constantes.API_URL}/${constantes.CUERPOS_URL}/?id=${planetaId}&vehiculo_id=${vehiculoDatos[0].id}`);
        const planetas = await resPlaneta.json();

        if (!planetas[0].disponible) {
            window.location.href = "galaxia.html"; // Lo devolvemos al mapa
            return;
        }
        dibujarDatosDelPlaneta(planetas[0]); // Esto arma la página
    } catch (error) {
        console.error("Error validando acceso:", error);
    }
}

async function dibujarDatosDelPlaneta(planeta){
  try{
    document.getElementById("nombre-planeta").textContent = planeta.nombre; // Cambia el nombre
    const ruta = buscarImagen(planeta.imagen_fondo);
    contenedorMapa.style.backgroundImage = `url('${ruta}')`;
    contenedorMapa.style.backgroundSize = "cover"; // acomoda el tamaño de la imagen al del fondo.
    contenedorMapa.style.backgroundPosition = "center"; // centrado.
    contenedorMapa.style.backgroundRepeat = "no-repeat"; // No se duplica el mosaico.
    contenedorMapa.style.backgroundAttachment = "fixed"; // No scrollea el fondo. Ver si el mapa scrollea.
    const resMisiones = await fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}?cuerpo_celeste_id=${planeta.id}&order_by=id&order=ASC`);
    const misiones = await resMisiones.json();
    pintarPuntosDeInteres(misiones);
    rellenarApartadoIzquierda(planeta);
  } catch (error){
    console.error("Error En la consulta de misiones: ", error);
  }

function buscarImagen(imagenId) {
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

    async function pintarPuntosDeInteres(misiones) {
    // 1. Agrupamos tus constantes sueltas en un molde para poder iterarlas
    const coordenadasVisuales = [
        { top: constantes.PUNTO1_TOP, left: constantes.PUNTO1_LEFT },
        { top: constantes.PUNTO2_TOP, left: constantes.PUNTO2_LEFT },
        { top: constantes.PUNTO3_TOP, left: constantes.PUNTO3_LEFT }
    ];

    misiones.forEach((mision, indice) => {
        const coordenadas = coordenadasVisuales[indice];
        
        //Si hay más de 3 msiones, se ignoran. 
        if (!coordenadas) return; 
        if (indice === 0 && !mision.disponible){
            const resDisponible = fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}/${mision.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ disponible: true })
            });
        }
        const divPunto = document.createElement("div");
        divPunto.className = "punto-interes";
        if (indice > 0 && !(misiones[indice].disponible)) { // Si está bloqueada, la diferencia visualmente.
            divPunto.classList.add("bloqueado");
        }
        divPunto.style.position = "absolute";
        divPunto.style.top = coordenadas.top;
        divPunto.style.left = coordenadas.left;

        divPunto.innerHTML = `
            <img src="../assets/img/marcador.png" alt="punto de interés">
            <p>${mision.nombre}</p>
        `;

        divPunto.addEventListener("click", () => {
            const completado = manejarClickPunto(mision, indice, coordenadas);
            if (completado){
                divPunto.classList.remove("bloqueado"); // Le saco la capa de bloqueado
            }
        });

        contenedorMapa.appendChild(divPunto);
    

    // 2. Ubicamos la nave en la Misión 0 al arrancar
    if (misiones.length > 0) {
        vehiculo.style.transition = "none";
        vehiculo.style.top = coordenadasVisuales[0].top;
        vehiculo.style.left = coordenadasVisuales[0].left;
        vehiculo.dataset.indiceActual = 0;
        
        setTimeout(() => {
            vehiculo.style.transition = "top 1s ease, left 1s ease"; 
        }, 50);
    }
    });
  
  try {
    // FETCH AL BACKEND: Datos del Cuerpo Celeste
    const resPlaneta = await fetch(`http://localhost:5000/api/cuerpos_celestes`);
    if (!resPlaneta.ok) throw new Error("Error al obtener planeta");
    const planeta = await resPlaneta.json();

    // Actualizamos la UI con los datos reales del planeta
   // nombrePlanetaEl.textContent = planeta.nombre;
    //if (planeta.imagen_url) {
    //  fondoPlanetaEl.src = planeta.imagen_url;
   // }

    async function manejarClickPunto(mision, indiceProximo, coordenadasDestino) {
        const estamosAhi = ((vehiculo.style.top === coordenadasDestino.top) && (vehiculo.style.left === coordenadasDestino.left));
        if (estamosAhi) {
        // Si ya está parado ahí, abrimos la información
        document.getElementById("puntoNombre").textContent = mision.nombre;
        document.getElementById("puntoDescripcion").textContent = mision.descripcion;
        panelPunto.classList.add("visible");
        if (mision.porcentaje !== 100){
        const completarMision = await fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}/${mision.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ porcentaje: 100 })
            });
            }
        } else {
        const respuestaVehiculo = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}?tipo=1`);
        const datosVehiculo = await respuestaVehiculo.json();
        if (Math.abs(datosVehiculo[0].punto_interes-indiceProximo) > 1){
            console.error("Debe moverse primero a la misión más cercana.");
            return;
        }
        const resMover = await fetch(`${constantes.API_URL}/${constantes.VEHICULOS_URL}/${datosVehiculo[0].id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ punto_interes: indiceProximo })
        });
        if (resMover.ok && !mision.disponible){
            const completarMision = await fetch(`${constantes.API_URL}/${constantes.MISIONES_URL}/${mision.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ disponible: true })
            });

        }
        if (resMover.ok){
            viajarHacia(coordenadasDestino);;
        }
    }
}

    // Limpiamos los puntos hardcodeados
    contenedorPuntos.innerHTML = "";
    
    // Coordenadas base predefinidas para trazar el camino (Top%, Left%)
    //const posicionesBase = [
   //   { top: "15%", left: "12%", x: 12, y: 15 },
   //   { top: "50%", left: "78%", x: 78, y: 50 },
   //   { top: "85%", left: "20%", x: 20, y: 85 }
   // ];

    //let puntosSVG = [];

    // Inyectar dinámicamente cada misión de la base de datos
    //misiones.forEach((mision, index) => {
      // Usar coordenadas fijas del mapa si existen, o calcular dinámicas
     // const pos = posicionesBase[index] || {
      //  top: `${20 + index * 25}%`,
      //  left: `${20 + (index % 2) * 50}%`,
      //  x: 20 + (index % 2) * 50,
       // y: 20 + index * 25
    //  };

     // const divPunto = document.createElement("div");
    //  divPunto.classList.add("punto-interes");
     // if (index !== 0) divPunto.classList.add("bloqueado"); // El primero empieza desbloqueado
     // divPunto.id = `punto-${mision.id}`;
     // divPunto.style.top = pos.top;
     // divPunto.style.left = pos.left;

     // divPunto.innerHTML = `
     //   <img src="../assets/img/marcador.png" alt="punto de interés">
     //   <p>${mision.nombre}</p>
    //  `;

    //  contenedorPuntos.appendChild(divPunto);

    //  puntos.push({
    //    el: divPunto,
    //    top: pos.top,
    //    left: pos.left,
     //   id: mision.id
    //  });

     // puntosSVG.push(`${pos.x},${pos.y}`);
  //  });

    // Dibujar el camino dinámico en el SVG
   // caminoPolyline.setAttribute("points", puntosSVG.join(" "));

    // Posicionar el vehículo en el primer punto
   // if (puntos.length > 0) {
   //   vehiculo.style.top = puntos[0].top;
   //   vehiculo.style.left = puntos[0].left;
   // }

    // Mantenemos el listener original de clics para viajar entre puntos
   // puntos.forEach((punto, indice) => {
   //   punto.el.addEventListener("click", () => {
    //    if (viajando) return;
//
    //    if (indice === actual) {
          // Redirigir usando el ID real de la misión/punto de interés
    //      window.location.href = `punto_interes.html?id=${punto.id}`;
    //    } else if (indice === actual + 1 || indice === actual - 1) {
   //       moverA(indice);
    //    }
    //  });
   // });

  } catch (error) {
    console.error(" Error al cargar los datos dinámicos en el planeta:", error);
  }
}}});
