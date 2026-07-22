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
('Tierra', 'Planeta rocoso que soporta vida. Tercer planeta desde el Sol, con agua líquida y una atmósfera rica en oxígeno.', 1, 12742, 9.8, 15, TRUE, 1, 1, 10, 8),
('Marte', 'El planeta rojo, desértico y frío. Su color se debe al óxido de hierro en su superficie, y alguna vez tuvo agua líquida.', 1, 6779, 3.7, -60, FALSE, 2, 4, 3, 3),
('Luna', 'Único satélite natural de la Tierra. Su gravedad influye directamente en las mareas oceánicas y su superficie está marcada por innumerables cráteres de impacto.', 2, 3474, 1.6, -53, FALSE, 2, 3, 2, 2),
('Júpiter', 'El gigante gaseoso, masivo y turbulento. Es el planeta más grande del sistema solar, compuesto principalmente por hidrógeno y helio. Su Gran Mancha Roja es una tormenta anticiclónica gigante que lleva activa durante siglos.', 3, 139820, 24.7, -110, FALSE, 3, 5, 8, 5),
('Mercurio', 'El planeta más pequeño y cercano al Sol. Debido a su cercanía a la estrella, experimenta las temperaturas más extremas del sistema solar, con variaciones de cientos de grados entre el día y la noche.', 1, 4879, 3.7, 167, FALSE, 2, 7, 4, 4);

-- ==========================================
INSERT INTO vehiculos (nombre, tipo, motor, estructura, combustible, ubicacion_id)
VALUES 
('Rover Explorador Alpha', 1, 1, 1, 100, 1);

INSERT INTO misiones (nombre, descripcion, relevancia, porcentaje, cuerpo_celeste_id, disponible)
VALUES 
--Tierra
('Base de Control', 'Centro de mando y comunicaciones orbitales desde donde se coordinan todas las misiones y se monitorea el estado de las naves en tiempo real', 5, 100, 1, TRUE),
('Estación Orbital', 'Punto de ensamblaje en órbita baja utilizado para construir y reparar naves antes de emprender misiones de largo alcance', 4, 50, 1, TRUE),
('Fosa Submarina', 'Exploración de biomas extremos en las profundidades oceánicas, donde la presión y la oscuridad ponen a prueba los sistemas de las sondas', 3, 0, 1, TRUE),

-- Marte
('Monte Olimpo', 'Escaneo del volcán más grande del sistema solar, cuya altura triplica la del Everest y revela capas geológicas de millones de años', 5, 0, 2, TRUE),
('Valle Marineris', 'Análisis geológico del cañón masivo que se extiende miles de kilómetros y ofrece pistas sobre la actividad tectónica del planeta', 4, 15, 2, TRUE),
('Casquetes Polares', 'Extracción de muestras de hielo subterráneo compuesto por agua y dióxido de carbono congelado, clave para futuras misiones tripuladas', 5, 25, 2, TRUE),

--Luna
('Mar de la Tranquilidad', 'Revisión de la zona del primer alunizaje humano, un sitio histórico donde aún se conservan huellas y equipo de la misión Apolo 11', 4, 100, 3, TRUE),
('Cráter Tycho', 'Análisis de impacto y eyección de material en uno de los cráteres más jóvenes y prominentes visibles desde la Tierra', 3, 40, 3, TRUE),
('Polo Sur Lunar', 'Búsqueda de depósitos de hielo en la sombra permanente de cráteres profundos, esenciales para sostener una futura base lunar', 5, 5, 3, TRUE),

-- Júpiter
('Gran Mancha Roja', 'Sondeo de la tormenta anticiclónica más grande del sistema solar, activa desde hace siglos y con vientos de cientos de km/h', 5, 0, 4, TRUE),
('Órbita Ecuatorial', 'Medición de anillos invisibles y radiación intensa generada por el poderoso campo magnético del gigante gaseoso', 4, 0, 4, TRUE),
('Sobrevuelo Europa', 'Alineación para observar la luna helada que oculta un océano subterráneo con posibles condiciones para albergar vida', 5, 0, 4, FALSE),

--Mercurio
('Cuenca Caloris', 'Investigación de impacto masivo antiguo que dejó una cicatriz de más de 1500 kilómetros de diámetro en la superficie', 4, 0, 5, TRUE),
('Terminador Solar', 'Medición del contraste térmico extremo en la línea que separa el día abrasador de la noche gélida del planeta', 3, 10, 5, TRUE),
('Cráteres Norte', 'Comprobación de hielo en zona oscura permanente, protegida de la radiación solar directa pese a la cercanía del Sol', 4, 0, 5, FALSE);