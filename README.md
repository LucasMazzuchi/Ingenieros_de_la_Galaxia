# Ingenieros de la Galaxia - TP integrador para la materia introducción al desarrollo de software.


Los integrantes del grupo son:
- Lucas Mazzuchi
- Mariano Verruno
- Fernando Hugo Godoy Delgado
- Juan Daniel Condori Miranda

## Frontend
El frontend utiliza HTML para estructurar el contenido de la página. CSS se emplea para diseñar la interfaz que se presenta al usuario, agregandole el estilo espacial que predomina en la plataforma. Es importante mencionar que se utiliza el framework Bulma para CSS. Por último, JavaScript se utiliza para manejar la lógica del lado del cliente y la integración con el backend, haciendo que se modifique de forma dinámica los datos y la representación gráfica de los planetas,
el mapa y el sistema de guardado de datos.

## Backend
En el backend, hacemos uso de CORS para gestionar las solicitudes entre el frontend y el backend. Utilizamos PostgreSQL como base de datos para crear y gestionar tablas que almacenan el estado del juego, es decir, información acerca de los cuerpos celestes, los vehiculos y los puntos de interés. Los métodos HTTP utilizados son: GET, POST, PATCH, DELETE.

## Requisitos
Para ejecutar el proyecto, tenés que tener instalado:
- Git: https://git-scm.com/
- Docker: https://docs.docker.com/engine/install/


## Instalación
```bash
    git clone git@github.com:LucasMazzuchi/Ingenieros_de_la_Galaxia.git
    cd Ingenieros_de_la_Galaxia
```

## Ejecución
``` bash
    docker compose up
```
Una vez que la terminal indique que los contenedores están corriendo, abrí tu navegador en http://localhost:8080 para acceder a la página inicial.

## Apagado
```bash
    docker compose down
```
