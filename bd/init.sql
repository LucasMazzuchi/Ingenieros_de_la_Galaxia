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
    tipo INT NOT NULL,
    motor INT NOT NULL,
    estructura INT NOT NULL,
    combustible INT NOT NULL,
    ubicacion_id INT REFERENCES cuerpos_celestes(id) NOT NULL,
    punto_interes INT NOT NULL,
    borrado BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS misiones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    relevancia INT NOT NULL,
    porcentaje INT NOT NULL,
    cuerpo_celeste_id INT REFERENCES cuerpos_celestes(id) NOT NULL,
    disponible BOOLEAN NOT NULL,
    borrado BOOLEAN DEFAULT FALSE
);

INSERT INTO cuerpos_celestes (nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, posicion, imagen, imagen_fondo)
VALUES 
('Tierra', 'Planeta rocoso que soporta vida', 1, 12742, 9.8, 15, TRUE, 1, 1, 10, 8),
('Marte', 'El planeta rojo, desértico y frío', 1, 6779, 3.7, -60, FALSE, 2, 4, 3, 3),
('Luna', 'Único satélite natural de la Tierra', 2, 3474, 1.6, -53, FALSE, 2, 3, 2, 2),
('Júpiter', 'El gigante gaseoso, masivo y turbulento', 3, 139820, 24.7, -110, FALSE, 3, 5, 8, 5),
('Mercurio', 'El planeta más pequeño y cercano al Sol', 1, 4879, 3.7, 167, FALSE, 2, 7, 4, 4);

-- ==========================================
INSERT INTO vehiculos (nombre, tipo, motor, estructura, combustible, ubicacion_id, punto_interes)
VALUES 
('Rover Explorador Alpha', 1, 1, 1, 100, 1, 1);

INSERT INTO misiones (nombre, descripcion, relevancia, porcentaje, cuerpo_celeste_id, disponible)
VALUES 
--Tierra
('Base de Control', 'Centro de mando y comunicaciones orbitales', 5, 100, 1, TRUE),
('Estación Orbital', 'Punto de ensamblaje en órbita baja', 4, 50, 1, TRUE),
('Fosa Submarina', 'Exploración de biomas extremos', 3, 0, 1, TRUE),

-- Marte
('Monte Olimpo', 'Escaneo del volcán más grande del sistema solar', 5, 0, 2, TRUE),
('Valle Marineris', 'Análisis geológico del cañón masivo', 4, 15, 2, TRUE),
('Casquetes Polares', 'Extracción de muestras de hielo subterráneo', 5, 25, 2, TRUE),

--Luna
('Mar de la Tranquilidad', 'Revisión de la zona del primer alunizaje', 4, 100, 3, TRUE),
('Cráter Tycho', 'Análisis de impacto y eyección de material', 3, 40, 3, TRUE),
('Polo Sur Lunar', 'Búsqueda de depósitos de hielo en la sombra', 5, 5, 3, TRUE),

-- Júpiter
('Gran Mancha Roja', 'Sondeo de la tormenta anticiclónica', 5, 0, 4, TRUE),
('Órbita Ecuatorial', 'Medición de anillos invisibles y radiación', 4, 0, 4, TRUE),
('Sobrevuelo Europa', 'Alineación para observar la luna helada', 5, 0, 4, FALSE),

--Mercurio
('Cuenca Caloris', 'Investigación de impacto masivo antiguo', 4, 0, 5, TRUE),
('Terminador Solar', 'Medición del contraste térmico extremo', 3, 10, 5, TRUE),
('Cráteres Norte', 'Comprobación de hielo en zona oscura permanente', 4, 0, 5, FALSE);