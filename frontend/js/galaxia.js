document.addEventListener("DOMContentLoaded", async () => {
    const contenedorGalaxia = document.getElementById("contenedor-galaxia"); // Asegurate de tener este ID en tu HTML
    
    if (!contenedorGalaxia) {
        console.error("No se encontró el contenedor de la galaxia en el HTML.");
        return;
    }

    try {
        // Pedir los datos de manera dinámica al Backend (CSR)
        const respuesta = await fetch("http://localhost:5000/api/cuerpos_celestes");
        if (!respuesta.ok) throw new Error("Error al traer los cuerpos celestes");
        
        const planetas = await respuesta.rows ? respuesta.rows : await respuesta.json(); // Manejo de formato según API
        
        // Limpiamos el HTML hardcodeado para inyectar los dinámicos
        contenedorGalaxia.innerHTML = "";

        // Iterar e inyectar cada planeta dinámicamente
        planetas.forEach((planeta) => {
            const divPlaneta = document.createElement("div");
            divPlaneta.classList.add("planeta");
            divPlaneta.id = `planeta-${planeta.id}`;

            // Usamos el campo 'posicion' numérico de la base de datos para calcular un top/left elíptico o lineal.
            const angulo = (planeta.posicion * 45) * (Math.PI / 180); // Distribución radial
            const radioX = 350; // Radio horizontal de la órbita
            const radioY = 150; // Radio vertical de la órbita
            
            const centroX = contenedorGalaxia.clientWidth / 2;
            const centroY = contenedorGalaxia.clientHeight / 2;

            const posX = centroX + radioX * Math.cos(angulo) - 40; // 40 es la mitad del ancho estimado del planeta
            const posY = centroY + radioY * Math.sin(angulo) - 40;

            divPlaneta.style.left = `${posX}px`;
            divPlaneta.style.top = `${posY}px`;

            // Validar si la imagen no existe en assets/img/ usar una por defecto (Placeholder espacial)
            const rutaImagen = planeta.imagen_url ? planeta.imagen_url : "assets/img/default-planet.png";

            // Inyectamos la estructura visual del planeta
            divPlaneta.innerHTML = `
                <a href="planeta.html?id=${planeta.id}">
                    <img src="${rutaImagen}" alt="${planeta.nombre}" class="img-planeta">
                    <span class="nombre-planeta">${planeta.nombre}</span>
                </a>
            `;

            contenedorGalaxia.appendChild(divPlaneta);
        });

    } catch (error) {
        console.error("❌ Falló la carga dinámica de la galaxia:", error);
        contenedorGalaxia.innerHTML = `<p class="error-msg">Error de comunicación con la base de datos central de la galaxia.</p>`;
    }
});