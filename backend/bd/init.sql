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
    cuerpo_celeste_id INT REFERENCES cuerpos_celestes(id)
    completado BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (mision_id, vehiculo_id)
);

INSERT INTO cuerpos_celestes (nombre, descripcion, tipo, diametro, gravedad, temperatura, habitable, terreno, posicion, imagen, imagen_fondo)
VALUES 
('Tierra', 'Un mundo azul vibrante, marcado por vastos océanos y cicatrices geológicas. El único lugar conocido donde el agua baila entre estado líquido y gaseoso bajo un cielo denso.', 1, 12742, 9.8, 15, TRUE, 1, 1, 10, 8),
('Luna', 'Un fósil gris y silencioso en el vacío. Su superficie acribillada a impactos guarda la memoria intacta de un sistema solar caótico que alguna vez fue.', 1, 3474, 1.6, -53, FALSE, 1, 3, 2, 2),
('Marte', 'Un desierto oxidado barrido por tormentas globales. Sus cañones colosales y volcanes dormidos insinúan que hace eones, ríos tumultuosos esculpieron esta tierra ahora estéril.', 1, 6779, 16.0, -110, FALSE, 1, 4, 3, 3),
('Plutón', 'Un mundo enano en la periferia helada. Sus glaciares de nitrógeno y montañas de hielo de agua forman un paisaje pálido, congelado en un letargo eterno.', 2, 3000, 14, -30, FALSE, 1, 6, 9, 9),
('Mercurio', 'Una esfera de hierro asada por la radiación. De día es un infierno fundido; de noche, un páramo gélido. Su superficie agrietada revela que el planeta entero se está encogiendo.', 1, 4879, 3.7, 170, FALSE, 2, 7, 4, 4),
('Júpiter', 'Un coloso de nubes arremolinadas y tormentas perpetuas. Bajo su densa atmósfera de amoníaco y violentas bandas de colores, se esconde un océano de hidrógeno metálico.', 2, 139820, 24.7, -110, FALSE, 2, 5, 8, 5);

INSERT INTO vehiculos (nombre, tipo, motor, estructura, combustible, resistencia, punto_interes, ubicacion_id)
VALUES 
('Nave Exploradora intergaláctica', 1, 1, 1, 100, 1, 1, 1),
('Auto', 2,1,1,100,1,1, 1);

INSERT INTO misiones (nombre, descripcion, porcentaje, cuerpo_celeste_id, disponible)
VALUES 
('Estructura Alpha', 'Instalaciones sumergidas de origen incierto. Los paneles emiten pulsos electromagnéticos siguiendo una secuencia numérica que nadie en la superficie programó.', 100, 1, FALSE),
('Eco Orbital', 'Restos de chatarra no documentada flotando en la exósfera. Su estructura refleja ondas de radio, formando un patrón que se asemeja a un lenguaje extinto.', 50, 1, FALSE),
('Abismo Insondable', 'Una anomalía térmica en la Fosa de las Marianas. El lecho marino en estas coordenadas parece haber sido cortado con una precisión geométrica imposible.', 0, 1, FALSE),

('Sombra del Mar', 'Un cráter perfectamente circular donde el polvo lunar está cristalizado por extremo calor. Los ecosísmicos detectan enormes cavidades huecas bajo la roca basáltica.', 100, 2, FALSE),
('El Ojo de Tycho', 'El pico central del cráter no está compuesto de regolito natural, sino de una densa aleación metálica que absorbe todas las frecuencias de luz.', 40, 2, FALSE),
('Agujas del Sur', 'En el interior oscuro del polo sur hay formaciones de hielo estriado que no encajan con la geología local. Emiten una leve luminiscencia azulada al quedar en sombra.', 5, 2, FALSE),

('Conducto de Olimpo', 'Cerca de la caldera del mega-volcán, los fuertes vientos han desenterrado algo que parece un respiradero subterráneo del tamaño de una metrópolis.', 0, 3, FALSE),
('Fisura Marineris', 'El cañón masivo oculta sedimentos magnéticos ordenados en patrones fractales. Quienquiera o lo que sea que haya estado aquí, dejó un registro en la propia roca.', 15, 3, FALSE),
('Fractura Polar', 'Bajo los casquetes de hielo seco, los radares de penetración detectan formas regulares gigantescas. Parecen naves fosilizadas, congeladas para siempre en la corteza.', 25, 3, FALSE),

('Corazón de Caloris', 'El impacto no formó esta enorme cuenca; expuso lo que había debajo. Una intrincada red de conductos oscuros se extiende más allá del alcance de nuestros sensores.', 0, 5, FALSE),
('La Línea del Ocaso', 'En el terminador, la frontera entre el día abrasador y la noche helada, proyecta sombras alargadas que se desplazan de forma independiente a la rotación del planeta.', 10, 5, FALSE),
('Esferas del Norte', 'En los oscuros cráteres polares, esferas de composición desconocida descansan sobre el hielo antiguo, latiendo con un débil pulso térmico residual.', 0, 5, FALSE),

('El Ojo Inmóvil', 'La Gran Mancha Roja no es solo un ciclón constante. En su centro absoluto de rotación hay un área de vacío perfecto donde un objeto masivo está deformando la gravedad.', 0, 6, FALSE),
('Resonancia Magnética', 'Entre los intensos cinturones de radiación ecuatorial navega una señal de banda estrecha ahogada por el ruido. Repite las mismas coordenadas en bucle desde hace siglos.', 0, 6, FALSE),
('Latido de Europa', 'La corteza de hielo cruje siguiendo un patrón rítmico, casi respiratorio. Las sondas detectan enormes fuentes de calor moviéndose ágilmente bajo el océano profundo.', 0, 6, FALSE);

INSERT INTO misiones (nombre, descripcion, porcentaje, cuerpo_celeste_id, disponible)
VALUES 
('Sello de Nitrógeno', 'Bajo la inmensa llanura del glaciar con forma de corazón, los sismógrafos han detectado vibraciones rítmicas de muy baja frecuencia. Algo titánico parece latir bajo la corteza helada.', 0, 4, FALSE),
('Cumbres del Exilio', 'Las gigantescas montañas de hielo de agua no encajan con la geología local. Sus cimas convergen en ángulos matemáticos precisos, como si fueran una colosal red de antenas apuntando hacia el vacío interestelar.', 0, 4, FALSE),
('La Cicatriz Orgánica', 'La vasta región oscura del ecuador está cubierta de polvo orgánico complejo. Entre las dunas rojizas, las cámaras han capturado la silueta de pilares fracturados que, extrañamente, se niegan a proyectar sombra.', 0, 4, FALSE);