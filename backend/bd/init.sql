CREATE TABLE IF NOT EXISTS cuerpos_celestes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo INT NOT NULL,
    diametro INT NOT NULL,
    gravedad FLOAT NOT NULL,
    temperatura INT NOT NULL,
    habitable BOOLEAN NOT NULL,
    terreno INT NOT NULL,
    posicion INT NOT NULL,
    imagen INT NOT NULL,
    imagen_fondo INT NOT NULL,
    borrado BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    motor INT NOT NULL,
    estructura INT NOT NULL,
    combustible INT NOT NULL,
    resistencia INT NOT NULL,
    punto_interes INT NOT NULL,
    ubicacion_id INT REFERENCES cuerpos_celestes(id) NOT NULL,
    borrado BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS misiones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    posicion INT NOT NULL,
    imagen INT NOT NULL,
    cuerpo_celeste_id INT REFERENCES cuerpos_celestes(id) NOT NULL,
    borrado BOOLEAN DEFAULT FALSE
);



CREATE TABLE IF NOT EXISTS cuerpos_celestes_vehiculos (
    cuerpo_celeste_id INT REFERENCES cuerpos_celestes(id),
    vehiculo_id INT REFERENCES vehiculos(id),
    completado BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (cuerpo_celeste_id, vehiculo_id)
);

CREATE TABLE IF NOT EXISTS misiones_vehiculos (
    mision_id INT REFERENCES misiones(id),
    vehiculo_id INT REFERENCES vehiculos(id),
    cuerpo_celeste_id INT REFERENCES cuerpos_celestes(id),
    completado BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (mision_id, vehiculo_id, cuerpo_celeste_id)
);

INSERT INTO cuerpos_celestes (nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, posicion, imagen, imagen_fondo)
VALUES 
('Tierra', 'Un mundo azul vibrante...', 1, 12742, 9.8, 15, TRUE, 1, 1, 10, 8),
('Luna', 'Un fósil gris y silencioso en el vacío...', 1, 3474, 1.6, -53, FALSE, 1, 3, 2, 2),
('Marte', 'Un desierto oxidado barrido por tormentas...', 1, 6779, 16.0, -110, FALSE, 1, 4, 3, 3),
('Plutón', 'Un mundo enano en la periferia helada...', 2, 3000, 14, -30, FALSE, 1, 6, 9, 9),
('Mercurio', 'Una esfera de hierro asada por la radiación...', 1, 4879, 3.7, 170, FALSE, 2, 7, 4, 4),
('Júpiter', 'Un coloso de nubes arremolinadas y tormentas...', 2, 139820, 24.7, -110, FALSE, 2, 5, 8, 5);

INSERT INTO misiones (nombre, descripcion, posicion, imagen, cuerpo_celeste_id)
VALUES 
/*Tierra (ID 1))*/
('Estructura Alpha', 'Instalaciones sumergidas de origen incierto. Los paneles emiten pulsos...', 1, 1, 1),
('Eco Orbital', 'Restos de chatarra no documentada flotando en la exósfera...', 2, 1, 1),
('Abismo Insondable', 'Una anomalía térmica en la Fosa de las Marianas...', 3, 1, 1),
/*Luna (ID 2))*/
('Sombra del Mar', 'Un cráter perfectamente circular donde el polvo lunar está cristalizado...', 1, 1, 2),
('El Ojo de Tycho', 'El pico central del cráter no está compuesto de regolito natural...', 2, 1, 2),
('Agujas del Sur', 'En el interior oscuro del polo sur hay formaciones de hielo estriado...', 3, 1, 2),
/*Marte (ID 3))*/
('Conducto de Olimpo', 'Cerca de la caldera del mega-volcán, los fuertes vientos han desenterrado...', 1, 1, 3),
('Fisura Marineris', 'El cañón masivo oculta sedimentos magnéticos ordenados en patrones fractales...', 2, 1, 3),
('Fractura Polar', 'Bajo los casquetes de hielo seco, los radares de penetración detectan formas...', 3, 1, 3),
/*Mercurio (ID 4))*/
('Corazón de Caloris', 'El impacto no formó esta enorme cuenca; expuso lo que había debajo...', 1, 1, 5),
('La Línea del Ocaso', 'En el terminador, la frontera entre el día abrasador y la noche helada...', 2, 1, 5),
('Esferas del Norte', 'En los oscuros cráteres polares, esferas de composición desconocida...', 3, 1, 5),
/*Júpiter (ID 5))*/
('El Ojo Inmóvil', 'La Gran Mancha Roja no es solo un ciclón constante...', 1, 1, 6),
('Resonancia Magnética', 'Entre los intensos cinturones de radiación ecuatorial navega una señal...', 2, 1, 6),
('Latido de Europa', 'La corteza de hielo cruje siguiendo un patrón rítmico, casi respiratorio...', 3, 1, 6);
/*Plutón (ID 7)*/
('El Latido de Tombaugh', 'La enorme llanura de hielo de nitrógeno conocida como el "Corazón" de Plutón oculta un secreto bajo su superficie. Los sensores de profundidad han detectado una red geométrica perfecta emitiendo pulsos de calor controlados. Este sistema termodinámico parece ser el responsable de mantener el hielo en constante movimiento convectivo, borrando cualquier evidencia de impactos. Debemos perforar la corteza y escanear la fuente de energía antes de que los glaciares inicien un nuevo ciclo de congelamiento.', 1, 1, 7),
('Ecos de Caronte', 'Plutón y su luna más grande están anclados gravitacionalmente, mostrándose siempre la misma cara. Sin embargo, hemos interceptado un haz de microondas de alta frecuencia que rebota perpetuamente entre ambos cuerpos en un vacío perfecto. La señal no es ruido estático espacial; contiene secuencias matemáticas que se reescriben a sí mismas en cada transmisión. Sintonizar los receptores de la nave para decodificar esta danza binaria podría revelar un antiguo relé de comunicaciones.', 2, 1, 7),
('Cenizas de Cthulhu', 'En la oscura y rojiza extensión ecuatorial de Plutón, el análisis espectral indica una concentración anormal de tolinas. Al acercarnos, las cámaras revelan que estos compuestos orgánicos no se formaron naturalmente por radiación, sino que parecen ser los restos de una antigua mega-estructura sintética destrozada. Lo más inquietante es que, al entrar en contacto con los escudos electromagnéticos de nuestra nave, el polvo rojizo de la superficie ha comenzado a levitar y reorganizarse.', 3, 1, 7);

