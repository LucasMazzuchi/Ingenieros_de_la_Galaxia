const contenedor = document.getElementById("planetas-contenedor");

fetch("http://localhost:puerto/api/cuerpos-celestes")
  .then(res => res.json())
  .then(planetas => {
    planetas.forEach(planeta => {
      const div = document.createElement("div");
      div.className = `planeta pos-${planeta.posicion}`;

      div.innerHTML = `
        <img src="${planeta.imagen_url}" alt="${planeta.nombre}">
        <p class="nombre-planeta">${planeta.nombre}</p>
      `;

      div.addEventListener("click", () => {
        window.location.href = `planeta.html?id=${planeta.id}`;
      });

      contenedor.appendChild(div);
    });
  });