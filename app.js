// ===============================
// ARVERUZ GPS 3D - VERSION GITHUB PAGES ESTABLE
// ===============================

// 🔑 TOKEN
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYzlkOTZhYS03ZmY2LTQ1MjItYjA0Yi02NWNiNjJiOTczYzUiLCJpZCI6MzkwOTAyLCJpYXQiOjE3NzEyOTA1MzV9.KDSNw1eDdgV1tuKnbC291EMSlpahZA_uI9fQNxEn8UQ"; // ← Pega tu token real aquí

async function init() {

    // Terreno correcto para Cesium 1.113
    const terrainProvider = await Cesium.createWorldTerrainAsync();

    const viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: terrainProvider,
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
        position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
        point: {
            pixelSize: 10,
            color: Cesium.Color.RED
        }
    });

    // Función ubicación
    window.getLocation = function () {

        if (!navigator.geolocation) {
            alert("Geolocalización no soportada.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function (position) {

                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const alt = position.coords.altitude || 0;
                const accuracy = position.coords.accuracy;

                latElement.textContent = lat.toFixed(6);
                lonElement.textContent = lon.toFixed(6);
                altElement.textContent = alt.toFixed(1);
                accuracyElement.textContent = accuracy.toFixed(1);

                const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
                entity.position = cartesian;

                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1500),
                    orientation: {
                        pitch: Cesium.Math.toRadians(-45)
                    }
                });

            },
            function (error) {
                alert("Error obteniendo ubicación: " + error.message);
            }
        );
    };

}

init();
