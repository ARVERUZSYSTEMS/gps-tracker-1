// ===============================
// ARVERUZ GPS 3D PRO FINAL
// ===============================

// 🔑 TOKEN CESIUM
Cesium.Ion.defaultAccessToken = "PEGA_AQUI_TU_TOKEN_CESIUM";

// Crear visor
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: Cesium.createWorldTerrain(),
    timeline: false,
    animation: false,
    baseLayerPicker: true,
    navigationHelpButton: true,
    sceneModePicker: true,
    homeButton: true,
    geocoder: true
});

// Elementos HUD
const latElement = document.getElementById("lat");
const lonElement = document.getElementById("lon");
const altElement = document.getElementById("alt");
const accuracyElement = document.getElementById("accuracy");

// Marcador actual
let entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
    point: {
        pixelSize: 10,
        color: Cesium.Color.RED
    }
});

let origenActual = null;
let rutaActiva = null;
let modoRuta = false;

// ===============================
// GEOLOCALIZACION
// ===============================

window.getLocation = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const alt = position.coords.altitude || 0;
            const accuracy = position.coords.accuracy;

            latElement.textContent = lat.toFixed(6);
            lonElement.textContent = lon.toFixed(6);
            altElement.textContent = alt.toFixed(1);
            accuracyElement.textContent = accuracy.toFixed(1);

            origenActual = { lat, lon };

            const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
            entity.position = cartesian;

            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(lon, lat, 2000),
                orientation: {
                    pitch: Cesium.Math.toRadians(-45)
                }
            });

        });
    }
};

// ===============================
// ACTIVAR MODO RUTA
// ===============================

window.activarModoRuta = function () {
    alert("Haz clic en el mapa para elegir destino");
    modoRuta = true;
};

// Detectar click en mapa
viewer.screenSpaceEventHandler.setInputAction(function(click) {

    if (!modoRuta || !origenActual) return;

    const pickedPosition = viewer.scene.pickPosition(click.position);
    if (!pickedPosition) return;

    const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
    const destinoLat = Cesium.Math.toDegrees(cartographic.latitude);
    const destinoLon = Cesium.Math.toDegrees(cartographic.longitude);

    generarRuta(origenActual.lat, origenActual.lon, destinoLat, destinoLon);

    modoRuta = false;

}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// ===============================
// GENERAR RUTA
// ===============================

async function generarRuta(lat1, lon1, lat2, lon2) {

    if (rutaActiva) {
        viewer.entities.remove(rutaActiva);
    }

    const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "PEGA_AQUI_TU_API_KEY_OPENROUTESERVICE"
        },
        body: JSON.stringify({
            coordinates: [
                [lon1, lat1],
                [lon2, lat2]
            ]
        })
    });

    const data = await response.json();
    const coords = data.features[0].geometry.coordinates;

    const rutaPositions = coords.map(c =>
        Cesium.Cartesian3.fromDegrees(c[0], c[1])
    );

    rutaActiva = viewer.entities.add({
        polyline: {
            positions: rutaPositions,
            width: 6,
            material: Cesium.Color.YELLOW
        }
    });
}

// Ubicación automática al cargar
getLocation();
