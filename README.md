# Este es el repo donde se sube el TP de intro del grupo Los Ingenieros de la Galaxia.

Los integrantes del grupo son:
- Lucas Mazzuchi
- Mariano Verruno
- Fernando Hugo Godoy Delgado
- Juan Daniel Condori Miranda

Módulo de Administración y Gestión(crear_viaje.js)
El archivo crear_viaje.js es el controlador principal para la interfaz que administra el sistema. Modula la navegación por tabs, la selección interactiva de recursos visuales y las operaciones CRUD(Crear, Leer, Actualizar, Eliminar) sobre tres entidades principales: Planetas(Cuerpos Celestes), Vehículos y Puntos de Interés(Misiones).

1. Componentes e Interfaz de Usuario
Galerías de Selección de Imágenes(crearSelectorImagenes)
Genera dinámicamente galerías interactiva de imágenes(.png para planetas y .jpg para fondos).

Mecanismo: Convierte el índice base 0 del array local a un índice base 1(index + 1), asignando el valor a los inputs ocultos inputImagen e inputImagenFondo.
Feedback Visual: Alterna la clase CSS .seleccionada al hacer clic sobre una miniatura.

Control de Navegación por Tabs
Maneja la visibilidad de los formularios(tab-planeta, tab-punto, tab-vehiculo).
Efecto: Muestra u oculta secciones según el atributo data-tab y realiza un desplazamiento suave(scrollIntoView) hacia el formulario activo.

2. Cliente de Red(La API)
El módulo abstrae las llamadas a la API REST centralizada en constantes.js:
Función,Método HTTP,Recurso API,Descripción
"obtenerDatos(recurso)","GET",/${recurso},"Recupera la lista completa de registros. Devuelve un array."
"crearRegistro(recurso, datos)","POST",/${recurso},"Envía una entidad en formato JSON para su creación."
"modificarRegistro(recurso, id, datos)","PATCH",/${recurso}/${id},"Actualiza parcialmente los campos de una entidad existente."
"eliminarRegistro(recurso, id)","DELETE",/${recurso}/${id},"Elimina el registro especificado por ID."

3. Lógica y Gestión de Datos(CRUD)
A. Cuerpos Celestes(cuerpos_celestes)
Permite el alta y modificación de planetas en la galaxia.

Casteo de Datos: Garantiza que los campos numéricos se parseen correctamente (parseInt para diámetros/temperaturas/terreno/imágenes y parseFloat para la gravedad) y convierte el campo habitable a un valor booleano explícito.

Mapeo de Selección: Al seleccionar un planeta existente desde el selector #selectPlaneta, puebla automáticamente todos los campos del formulario, incluyendo los IDs de las imágenes previamente asignadas.

B. Vehículos(vehiculos)
Administra el hangar de transporte espacial.

Reglas de Negocio Implementadas:

Límite de Hangar: No se pueden registrar más de 2 vehículos en total en la base de datos.

Unicidad de Tipo: Solo puede existir un vehículo de Tipo 1 y un vehículo de Tipo 2. El sistema valida que el tipo seleccionado no choque con el de ningún otro vehículo existente al crear o modificar.

C. Puntos de Interés / Misiones (misiones)
Gestiona los eventos u objetivos disponibles en los planetas.

Relación Clave Foránea: Vincula cada misión a un cuerpo celeste específico utilizando el atributo cuerpo_celeste_id.

Estado: Asigna el porcentaje de avance/completitud y el estado booleano de disponibilidad.

4. Ciclo de Vida de la Página (DOMContentLoaded)
Al cargar la vista, se ejecuta inicializarSelects().

Se realizan peticiones asincrónicas en paralelo para obtener planetas, vehículos y misiones existentes.

Se pueblan dinámicamente los elementos <select> de modificación/baja para permitir alternar entre la creación de un nuevo registro (value="") o la edición de uno existente.