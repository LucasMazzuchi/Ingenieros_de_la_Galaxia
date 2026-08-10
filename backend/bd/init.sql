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
    puntos INT DEFAULT 0,
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
('Tierra', 'Un mundo azul vibrante que ahora yace en un silencio absoluto. Desde la órbita se ven las antiguas megalópolis devoradas por la vegetación y el océano, pero no quedó nadie. Cero señales de vida; una atmósfera que te hiela la sangre.', 1, 12742, 9.8, 15, TRUE, 1, 1, 10, 8),
/*Nivel 1*/
('Luna', 'Un fósil gris y silencioso en el vacío. A simple vista parece una roca inerte, pero si prestás atención, los cráteres tienen cortes demasiado geométricos. Como si una civilización entera hubiera minado la superficie para luego desaparecer sin dejar rastro.', 1, 3474, 1.6, -53, FALSE, 1, 3, 2, 2),
('Marte', 'Un desierto oxidado barrido por tormentas. Es un riesgo constante descender ahí. Los vientos huracanados de vez en cuando desentierran ruinas que no pertenecen a la humanidad. Alguien construyó un imperio ahí abajo y quedó sepultado bajo el polvo.', 1, 6779, 16.0, -110, FALSE, 1, 4, 3, 3),
('C-48', 'Un infierno tóxico envuelto en densas nubes de ácido sulfúrico. La presión te aplasta si intentás bajar, pero las sondas marcan que hay siluetas flotando en la atmósfera superior, como si fueran plataformas fantasma.', 1, 24000, 16.0, 40, FALSE, 1, 2, 9, 7),
('Vesta', 'Un asteroide colosal a la deriva. Su superficie está plagada de grietas artificiales y bases de extracción abandonadas. Caminar por estos valles es tropezarse con maquinaria pesada de hace siglos, intacta pero muerta.', 1, 940, 0.3, 120, FALSE, 1, 5, 7, 10),
/*Nivel 2*/
('Neptuno', 'Un planeta situado en la periferia helada. Totalmente abandonado en los confines del sistema. Las temperaturas son extremas y la superficie está llena de cicatrices sintéticas que no encajan con impactos de asteroides. Es como el cementerio de la galaxia.', 2, 3000, 14, -30, FALSE, 1, 6, 5, 5),
('Mercurio', 'Una esfera de hierro asada por la radiación. Un auténtico horno solar. Pero lo inquietante es que detectamos estructuras metálicas intactas. Quien haya construido eso poseía tecnología capaz de resistir el calor más extremo del sistema.', 1, 4879, 3.7, 170, FALSE, 2, 7, 4, 4),
/*Nivel 3*/
('Saturno', 'Un coloso de nubes arremolinadas y tormentas. Un caos gigante de alta presión. Te acercás y los escáneres pierden la calibración, arrojando falsos positivos, como si dentro de esas tormentas colosales hubiera estructuras sólidas en movimiento.', 2, 139820, 24.7, -110, FALSE, 2, 8, 8, 6);


INSERT INTO misiones (nombre, descripcion, posicion, imagen, cuerpo_celeste_id)
VALUES 
/*Tierra (ID 1)*/
('Estructura Alpha', 'Instalaciones sumergidas de origen incierto. Los paneles emiten pulsos como si estuvieran en modo de hibernación, esperando una secuencia de inicio. Fuimos a revisar y descubrimos que las compuertas fueron selladas desde adentro. Algo querían dejar encerrado.', 1, 1, 1),
('Eco Orbital', 'Restos de chatarra no documentada flotando en la exósfera. Al principio creímos que era nuestra propia basura espacial, pero los análisis muestran aleaciones desconocidas. Es como si una flota entera hubiera sido destruida en nuestra órbita en un pasado remoto.', 2, 1, 1),
('Abismo Insondable', 'Una anomalía térmica en la Fosa de las Marianas. El agua está hirviendo en un punto muy específico sin actividad volcánica. Los sonares rebotan contra algo colosal, de superficie lisa y metálica, que yace enterrado bajo kilómetros de sedimento.', 3, 1, 1),

/*Luna (ID 2)*/
('Sombra del Mar', 'Un cráter perfectamente circular donde el polvo lunar está cristalizado. Se necesita una temperatura descomunal para vitrificar el regolito de esa forma. Definitivamente no fue un meteorito; parece el rastro de un arma orbital que calcinó la superficie.', 1, 1, 2),
('El Ojo de Tycho', 'El pico central del cráter no está compuesto de regolito natural. Es una aguja de transmisión destrozada. Está camuflada por milenios de polvo estelar, pero los escáneres revelan que es hueca y desciende miles de metros hacia la corteza. Va a ser peligroso entrar ahí.', 2, 1, 2),
('Agujas del Sur', 'En el interior oscuro del polo sur hay formaciones de hielo estriado que se asemejan a los picos de una catedral oscura. Están dispuestas en un patrón demasiado simétrico para ser natural. Alguien las talló y las abandonó al frío perpetuo del espacio.', 3, 1, 2),

/*Marte (ID 3)*/
('Conducto de Olimpo', 'Cerca de la caldera del mega-volcán, los fuertes vientos han desenterrado unas esclusas metálicas colosales. Las compuertas quedaron atascadas a la mitad y los sismógrafos captan un zumbido denso de fondo, como si los generadores internos nunca se hubieran apagado.', 1, 1, 3),
('Fisura Marineris', 'El cañón masivo oculta sedimentos magnéticos ordenados en patrones fractales. Esto no tiene nada de geología natural. Son inmensas placas de datos fracturadas y dispersas por el valle. Es imposible calcular la cantidad de información que se perdió acá.', 2, 1, 3),
('Fractura Polar', 'Bajo los casquetes de hielo seco, los radares de penetración detectan formas de geometría perfecta. Son ruinas urbanas inmensas. Ciudades enteras congeladas a las que el tiempo y el hielo terminaron por sepultar. Es abrumador.', 3, 1, 3),

/*C-48 (ID 4)*/
('Ciudades en la Bruma', 'Las sondas atmosféricas fueron destruidas por la presión, pero antes de apagarse transmitieron sombras estructurales. No están en la superficie, sino flotando estáticamente en la capa alta de nubes de ácido sulfúrico, desafiando la gravedad del planeta.', 1, 1, 4),
('El Faro de Maxwell', 'Maxwell Montes, la montaña más alta de Venus, no es solo roca volcánica. Su cumbre metálica funciona como un pararrayos gigantesco, absorbiendo la energía estática de la atmósfera para alimentar un pulso electromagnético que se dispara sin cesar hacia el espacio profundo.', 2, 1, 4),
('Tectónica Sintética', 'Venus no debería tener placas tectónicas, sin embargo, los radares muestran grietas perfectamente rectas formándose en las llanuras de lava. Estas fisuras se abren y cierran siguiendo un patrón lógico, como si el núcleo del planeta fuera en realidad un inmenso mecanismo recalentado.', 3, 1, 4),

/*Vesta (ID 5)*/
('Cantera de los Antiguos', 'El asteroide está perforado por minas a cielo abierto colosales. Los drones detectaron maquinaria de extracción gigantesca que quedó congelada en medio de su ciclo de trabajo. Tenemos que descender y recuperar los núcleos de energía antes de que las fallas tectónicas se traguen todo el yacimiento.', 1, 1, 5),
('Señal en el Polvo', 'Captamos una baliza de emergencia rebotando entre las paredes de un cañón metálico. No utiliza ninguna de nuestras frecuencias estándar. Alguien, o algo, quedó atrapado bajo toneladas de escombros hace siglos y la señal indica que sus sistemas de soporte vital siguen intentando arrancar.', 2, 1, 5),
('El Núcleo Expuesto', 'Las grietas artificiales de Vesta son tan profundas que llegan casi hasta su centro. En el fondo, los sensores térmicos marcan un reactor de fisión que lleva cientos de años operando en el vacío. Si logramos acceder a esa bóveda sellada, podríamos descargar los registros de la IA que lo controla.', 3, 1, 5),

/*Neptuno (ID 6)*/
('El Latido de Tombaugh', 'La enorme llanura de hielo de nitrógeno conocida como el "Corazón" de Plutón oculta un secreto bajo su superficie. Los sensores de profundidad detectaron una red geométrica perfecta emitiendo pulsos de calor controlados. Este sistema termodinámico parece ser el responsable de mantener el hielo en constante movimiento convectivo, borrando cualquier evidencia de impactos. Tenemos que perforar la corteza y escanear la fuente de energía antes de que los glaciares inicien un nuevo ciclo de congelamiento.', 1, 1, 6),
('Cenizas de Cthulhu', 'En la oscura y rojiza extensión ecuatorial de Plutón, el análisis espectral indica una concentración anormal de tolinas. Cuando nos acercamos, las cámaras revelaron que estos compuestos orgánicos no se formaron naturalmente por radiación; parecen ser los restos de una antigua mega-estructura sintética destrozada. Lo más inquietante es que, al entrar en contacto con los escudos electromagnéticos de nuestra nave, el polvo de la superficie comenzó a levitar y reorganizarse.', 2, 1, 6),
('Ecos de Caronte', 'Plutón y su luna más grande están anclados gravitacionalmente, mostrándose siempre la misma cara. Sin embargo, interceptamos un haz de microondas de alta frecuencia que rebota perpetuamente entre ambos cuerpos en un vacío perfecto. La señal no es ruido estático espacial; contiene secuencias matemáticas que se reescriben a sí mismas. Si logramos sintonizar los receptores de la nave, podríamos decodificar un antiguo relé de comunicaciones.', 3, 1, 6),

/*Mercurio (ID 7)*/
('Corazón de Caloris', 'El impacto no formó esta enorme cuenca; expuso lo que había debajo. Una bóveda forjada en una aleación que no figura en nuestros registros. La estructura sufrió un impacto cataclísmico, pero sigue intacta. Tenemos que tener cuidado con lo que podamos despertar si logramos abrirla.', 1, 1, 7),
('La Línea del Ocaso', 'En el terminador, la frontera entre el día abrasador y la noche helada, nos topamos con un cementerio de vehículos de exploración de origen alienígena. Sus sistemas están fundidos, como si hubieran intentado cruzar hacia el lado oscuro y un pulso defensivo los hubiera neutralizado al instante.', 2, 1, 7),
('Esferas del Norte', 'En los oscuros cráteres polares, esferas de composición desconocida flotan de forma estática a medio metro del suelo. Levitan mediante un campo magnético autónomo. Parecen ser minas de proximidad o boyas de contención olvidadas desde una guerra ancestral.', 3, 1, 7),

/*Saturno (ID 8)*/
('El Ojo Inmóvil', 'La Gran Mancha Roja no es solo un ciclón constante. En el centro exacto del vórtice descansa una sombra colosal que permanece estática, desafiando los vientos de miles de kilómetros por hora. Parece ser una instalación suspendida soportando las peores condiciones climáticas imaginables.', 1, 1, 8),
('Resonancia Magnética', 'Entre los intensos cinturones de radiación ecuatorial navega una señal de auxilio que se repite en un bucle infinito. Logramos aislar la frecuencia y conseguimos un audio profundamente distorsionado, pero las cuerdas vocales que lo emiten no suenan humanas.', 2, 1, 8),
('Latido de Europa', 'La corteza de hielo cruje siguiendo un patrón rítmico, casi respiratorio. Lanzamos sondas acústicas y los ecos devuelven un sonido que se asemeja a una entidad titánica en letargo bajo el océano oscuro. Va a ser mejor que mantengamos el sigilo al perforar.', 3, 1, 8);

