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
    resistencia INT NOT NULL,
    punto_interes INT NOT NULL,
    borrado BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS misiones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    porcentaje INT NOT NULL,
    cuerpo_celeste_id INT REFERENCES cuerpos_celestes(id) NOT NULL,
    disponible BOOLEAN NOT NULL,
    borrado BOOLEAN DEFAULT FALSE
);

INSERT INTO cuerpos_celestes (nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, posicion, imagen, imagen_fondo)
VALUES 
('Tierra', 'Planeta rocoso que soporta vida. Tercer planeta desde el Sol, con agua líquida y una atmósfera rica en oxígeno.', 1, 12742, 9.8, 15, TRUE, 1, 1, 10, 8),
('Luna', 'Único satélite natural de la Tierra. Requerimientos mínimos de motor y estructura. Ideal para el primer salto.', 1, 3474, 1.6, -53, FALSE, 1, 3, 2, 2),
('Marte', 'El planeta rojo. Requiere un motor nivel 2 para escapar de su gravedad y estructura nivel 2 para el frío.', 1, 6779, 16.0, -110, FALSE, 1, 4, 3, 3),
('Mercurio', 'Pequeño pero rocoso. Requiere resistencia nivel 3 para el terreno y estructura nivel 3 para el calor extremo.', 1, 4879, 3.7, 310, FALSE, 2, 7, 4, 4),
('Júpiter', 'Gigante gaseoso. Requiere motor máximo (nivel 3), resistencia máxima y estructura máxima para sobrevivir.', 3, 139820, 24.7, -110, FALSE, 3, 5, 8, 5);
-- ==========================================
INSERT INTO vehiculos (nombre, tipo, motor, estructura, combustible, resistencia, punto_interes)
VALUES 
('Rover Explorador Alpha', 1, 1, 1, 100, 1, 1);

INSERT INTO misiones (nombre, descripcion, porcentaje, cuerpo_celeste_id, disponible)
VALUES 
--Tierra
('Base de Control', 'Centro de mando y comunicaciones orbitales desde donde se coordinan todas las misiones y se monitorea el estado de las naves en tiempo real', 100, 1, FALSE),
('Estación Orbital', 'Punto de ensamblaje en órbita baja utilizado para construir y reparar naves antes de emprender misiones de largo alcance', 50, 1, FALSE),
('Fosa Submarina', 'Exploración de biomas extremos en las profundidades oceánicas, donde la presión y la oscuridad ponen a prueba los sistemas de las sondas', 0, 1, FALSE),

-- Marte
('Monte Olimpo', 'Escaneo del volcán más grande del sistema solar, cuya altura triplica la del Everest y revela capas geológicas de millones de años', 0, 2, FALSE),
('Valle Marineris', 'Análisis geológico del cañón masivo que se extiende miles de kilómetros y ofrece pistas sobre la actividad tectónica del planeta', 15, 2, FALSE),
('Casquetes Polares', 'Extracción de muestras de hielo subterráneo compuesto por agua y dióxido de carbono congelado, clave para futuras misiones tripuladas', 25, 2, FALSE),

--Luna
('Mar de la Tranquilidad', 'Revisión de la zona del primer alunizaje humano, un sitio histórico donde aún se conservan huellas y equipo de la misión Apolo 11', 100, 3, FALSE),
('Cráter Tycho', 'Análisis de impacto y eyección de material en uno de los cráteres más jóvenes y prominentes visibles desde la Tierra', 40, 3, FALSE),
('Polo Sur Lunar', 'Búsqueda de depósitos de hielo en la sombra permanente de cráteres profundos, esenciales para sostener una futura base lunar', 5, 3, FALSE),

-- Júpiter
('Gran Mancha Roja', 'Sondeo de la tormenta anticiclónica más grande del sistema solar, activa desde hace siglos y con vientos de cientos de km/h', 0, 4, FALSE),
('Órbita Ecuatorial', 'Medición de anillos invisibles y radiación intensa generada por el poderoso campo magnético del gigante gaseoso', 0, 4, FALSE),
('Sobrevuelo Europa', 'Alineación para observar la luna helada que oculta un océano subterráneo con posibles condiciones para albergar vida', 0, 4, FALSE),

--Mercurio
('Cuenca Caloris', 'Investigación de impacto masivo antiguo que dejó una cicatriz de más de 1500 kilómetros de diámetro en la superficie', 0, 5, FALSE),
('Terminador Solar', 'Medición del contraste térmico extremo en la línea que separa el día abrasador de la noche gélida del planeta', 10, 5, FALSE),
('Cráteres Norte', 'Comprobación de hielo en zona oscura permanente, protegida de la radiación solar directa pese a la cercanía del Sol', 0, 5, FALSE);