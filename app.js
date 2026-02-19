// ===============================
// ARVERUZ GPS - VERSION DEBUG ESTABLE
// ===============================

// 🔑 TOKEN
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYzlkOTZhYS03ZmY2LTQ1MjItYjA0Yi02NWNiNjJiOTczYzUiLCJpZCI6MzkwOTAyLCJpYXQiOjE3NzEyOTA1MzV9.KDSNw1eDdgV1tuKnbC291EMSlpahZA_uI9fQNxEn8UQ";

// Crear visor SIMPLE
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    timeline: false,
    animation: false,
    baseLayerPicker: true,
    navigationHelpButton: true,
    sceneModePicker: true,
    homeButton: true,
    geocoder: true
});

// HUD
const latElement = document.getElementById("lat");
const lonElement = document.getElementById("lon");
const altElement = document.getElementById("alt");
const accuracyElement = document.getElementById("accuracy");

// Marcador
const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(0, 0),
    point: {
        pixelSize: 10,
        color: Cesium.Color.RED
    }
});

window.getLocation = function () {

    if (!navigator.geolocation) {
        alert("Geolocalización no soportada");
        return;
    }

    navigator.geolocation.getCurrentPosition(function(pos) {

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const alt = pos.coords.altitude || 0;
        const accuracy = pos.coords.accuracy || 0;

        latElement.textContent = lat.toFixed(6);
        lonElement.textContent = lon.toFixed(6);
        altElement.textContent = alt.toFixed(1);
        accuracyElement.textContent = accuracy.toFixed(1);

        const cart = Cesium.Cartesian3.fromDegrees(lon, lat, alt);

        entity.position = cart;

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 2000),
            orientation: {
                pitch: Cesium.Math.toRadians(-45)
            }
        });

    }, function(error) {
        console.error(error);
        alert("Error ubicación: " + error.message);
    });
};
