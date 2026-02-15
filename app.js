// ===============================
// ARVERUZ GPS TRACKER - PRO VERSION
// ===============================

// Elementos del panel
const latElement = document.getElementById("lat");
const lonElement = document.getElementById("lon");
const accuracyElement = document.getElementById("accuracy");

// ===============================
// Inicialización del mapa
// ===============================

const map = L.map('map', {
    zoomControl: false,      // Quitamos el zoom clásico
    touchZoom: true,         // Zoom táctil activado
    scrollWheelZoom: true,   // Zoom con rueda
    doubleClickZoom: true,   // Doble clic zoom
    dragging: true
}).setView([0, 0], 2);       // Vista inicial global

// Zoom más suave (más profesional)
map.options.zoomSnap = 0.25;
map.options.zoomDelta = 0.25;

// Capa del mapa (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Agregar zoom estilo moderno abajo derecha
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Marcador inicial
let marker = L.marker([0, 0]).addTo(map);

// ===============================
// Función para obtener ubicación
// ===============================

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError, {
            enableHighAccuracy: true
        });
    } else {
        alert("Geolocalización no soportada por este navegador.");
    }
}

// ===============================
// Mostrar posición en mapa
// ===============================

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    // Actualizar panel
    latElement.textContent = lat.toFixed(6);
    lonElement.textContent = lon.toFixed(6);
    accuracyElement.textContent = accuracy.toFixed(1);

    // Mover mapa
    map.setView([lat, lon], 15);

    // Mover marcador
    marker.setLatLng([lat, lon]);
}

// ===============================
// Manejo de errores
// ===============================

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Permiso de ubicación denegado.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Información de ubicación no disponible.");
            break;
        case error.TIMEOUT:
            alert("Tiempo de espera agotado.");
            break;
        default:
            alert("Error desconocido.");
            break;
    }
}

// ===============================
// Obtener ubicación automática al cargar
// ===============================

window.onload = function () {
    getLocation();
};
