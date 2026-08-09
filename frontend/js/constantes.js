const PUERTO = 5000;
export const API_URL = window.location.hostname === "localhost"? `http://localhost:${PUERTO}/api` : "https://backend-t3by.onrender.com/api";
export const CUERPOS_URL = "cuerpos_celestes";
export const VEHICULOS_URL = "vehiculos";
export const MISIONES_URL = "misiones";
export const PROGRESO_URL = "progreso";
export const DESBLOQUEAR_URL = "desbloquear";
export const PUNTO1_TOP = "15%";
export const PUNTO2_TOP = "50%";
export const PUNTO3_TOP = "85%";
export const PUNTO1_LEFT = "12%";
export const PUNTO2_LEFT = "78%";
export const PUNTO3_LEFT = "20%";

export const PUNTO_DESBLOQUEADO = "y obtuviste un punto de mejora"
export const ERROR_PUNTO_MAX = "pero no obtuviste puntos de mejora, ya los adquiriste todos"

export const ERROR_COMPLETADO = "Este punto ya fue explorado por la nave.";
export const ERROR_DISPONIBLE = "Error al verificar el estado de la misión.";
export const ERROR_PUNTOS_MAX = "pero no obtuviste puntos de mejora, ya obtuviste todos previamente"
export const TIPOS_PLANETA = { 1: "Rocoso", 2: "Gaseoso", 3: "Helado"};
export const TIPOS_TERRENO = { 1: "Desértico", 2: "Rocoso", 3: "Helado"};
export const COORDENADAS_SVG = ["12,15", "78,50", "20,85"];