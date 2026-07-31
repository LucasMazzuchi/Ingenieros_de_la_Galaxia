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
    PRIMARY KEY (mision_id, vehiculo_id)
);

-- 1. Insertar Cuerpos Celestes
INSERT INTO cuerpos_celestes (nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, posicion, imagen, imagen_fondo)
VALUES 
('Tierra', 'Un mundo azul vibrante...', 1, 12742, 9.8, 15, TRUE, 1, 1, 10, 8),
('Luna', 'Un fósil gris y silencioso en el vacío...', 1, 3474, 1.6, -53, FALSE, 1, 3, 2, 2),
('Marte', 'Un desierto oxidado barrido por tormentas...', 1, 6779, 16.0, -110, FALSE, 1, 4, 3, 3),
('Plutón', 'Un mundo enano en la periferia helada...', 2, 3000, 14, -30, FALSE, 1, 6, 9, 9),
('Mercurio', 'Una esfera de hierro asada por la radiación...', 1, 4879, 3.7, 170, FALSE, 2, 7, 4, 4),
('Júpiter', 'Un coloso de nubes arremolinadas y tormentas...', 2, 139820, 24.7, -110, FALSE, 2, 5, 8, 5);

-- 2. Insertar Vehículos (Corregido el final con ;)
INSERT INTO vehiculos (nombre, motor, estructura, combustible, resistencia, punto_interes, ubicacion_id)
VALUES 
('Nave Exploradora intergaláctica', 1, 1, 100, 1, 1, 1);

-- 3. Insertar Misiones (Corregida la sintaxis y asignados los IDs de planetas)
INSERT INTO misiones (nombre, descripcion, cuerpo_celeste_id)
VALUES 
-- Tierra (ID 1)
('Estructura Alpha', 'Instalaciones sumergidas de origen incierto. Los paneles emiten pulsos...', 1),
('Eco Orbital', 'Restos de chatarra no documentada flotando en la exósfera...', 1),
('Abismo Insondable', 'Una anomalía térmica en la Fosa de las Marianas...', 1),
-- Luna (ID 2)
('Sombra del Mar', 'Un cráter perfectamente circular donde el polvo lunar está cristalizado...', 2),
('El Ojo de Tycho', 'El pico central del cráter no está compuesto de regolito natural...', 2),
('Agujas del Sur', 'En el interior oscuro del polo sur hay formaciones de hielo estriado...', 2),
-- Marte (ID 3)
('Conducto de Olimpo', 'Cerca de la caldera del mega-volcán, los fuertes vientos han desenterrado...', 3),
('Fisura Marineris', 'El cañón masivo oculta sedimentos magnéticos ordenados en patrones fractales...', 3),
('Fractura Polar', 'Bajo los casquetes de hielo seco, los radares de penetración detectan formas...', 3),
-- Mercurio (ID 5)
('Corazón de Caloris', 'El impacto no formó esta enorme cuenca; expuso lo que había debajo...', 5),
('La Línea del Ocaso', 'En el terminador, la frontera entre el día abrasador y la noche helada...', 5),
('Esferas del Norte', 'En los oscuros cráteres polares, esferas de composición desconocida...', 5),
-- Júpiter (ID 6)
('El Ojo Inmóvil', 'La Gran Mancha Roja no es solo un ciclón constante...', 6),
('Resonancia Magnética', 'Entre los intensos cinturones de radiación ecuatorial navega una señal...', 6),
('Latido de Europa', 'La corteza de hielo cruje siguiendo un patrón rítmico, casi respiratorio...', 6);

-- ==========================================
-- 4. INSERTS DE TABLAS INTERMEDIAS (PROGRESO)
-- ==========================================

-- Registramos qué cuerpos celestes visitó el vehículo 1
INSERT INTO cuerpos_celestes_vehiculos (cuerpo_celeste_id, vehiculo_id, completado)
VALUES 
(1, 1, TRUE);

-- Registramos el progreso de las misiones para el vehículo 1
INSERT INTO misiones_vehiculos (mision_id, vehiculo_id, cuerpo_celeste_id, completado)
VALUES 
(1, 1, 1, FALSE);