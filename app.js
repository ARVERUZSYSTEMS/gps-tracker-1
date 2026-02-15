// ===============================
// ARVERUZ GPS TRACKER - MULTI MAP PRO
// ===============================

Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

const latElement = document.getElementById("lat");
const lonElement = document.getElementById("lon");
const accuracyElement = document.getElementById("accuracy");

// Inicializar mapa
const map = L.map('map', {
    zoomControl: false,
    touchZoom: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    dragging: true
}).setView([0, 0], 2);

map.options.zoomSnap = 0.25;
map.options.zoomDelta = 0.25;

// ===============================
// CAPAS DE MAPA
// ===============================

// Mapa normal
const normalLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '© OpenStreetMap contributors' }
);

// Satélite (Esri)
const satelliteLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles © Esri' }
);

// Modo oscuro
const darkLayer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { attribution: '&copy; CARTO' }
);

// Agregar capa inicial
normalLayer.addTo(map);

// Control de capas
L.control.layers(
    {
        "Mapa Normal": normalLayer,
        "Satélite": satelliteLayer,
        "Modo Oscuro": darkLayer
    }
).addTo(map);

// Zoom estilo moderno
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// Marcador
let marker = L.marker([0, 0]).addTo(map);

// ===============================
// GEOLOCALIZACIÓN
// ===============================

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError, {
            enableHighAccuracy: true
        });
    } else {
        alert("Geolocalización no soportada.");
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    latElement.textContent = lat.toFixed(6);
    lonElement.textContent = lon.toFixed(6);
    accuracyElement.textContent = accuracy.toFixed(1);

    map.setView([lat, lon], 15);
    marker.setLatLng([lat, lon]);
}

function showError(error) {
    alert("Error obteniendo ubicación.");
}

// Obtener ubicación automática
window.onload = function () {
    getLocation();
};
