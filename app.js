// =====================================
// ARVERUZ GPS 3D PRO – VERSION ESTABLE
// =====================================

// 🔑 TOKEN CESIUM (deja el tuyo)
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYzlkOTZhYS03ZmY2LTQ1MjItYjA0Yi02NWNiNjJiOTczYzUiLCJpZCI6MzkwOTAyLCJpYXQiOjE3NzEyOTA1MzV9.KDSNw1eDdgV1tuKnbC291EMSlpahZA_uI9fQNxEn8UQ";

// Variable global origen
let origenActual = null;

async function init() {

    // Crear terreno correctamente (Cesium 1.113)
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

    // =========================
    // ELEMENTOS HUD
    // =========================
    const latElement = document.getElementById("lat");
    const lonElement = document.getElementById("lon");
    const altElement = document.getElementById("alt");
    const accuracyElement = document.getElementById("accuracy");

    // =========================
    // MARCADOR GPS PROFESIONAL
    // =========================
    const marcador = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(-104.0, 39.0, 0),
        billboard: {
            image: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            width: 40,
            height: 40,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
    });

    let watchID = null;

    // =========================
    // FUNCIÓN GLOBAL UBICAR
    // =========================
    window.getLocation = function () {

        if (!navigator.geolocation) {
            alert("Geolocalización no soportada");
            return;
        }

        if (watchID !== null) {
            navigator.geolocation.clearWatch(watchID);
        }

        watchID = navigator.geolocation.watchPosition(
            function (pos) {

                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                const alt = pos.coords.altitude || 0;
                const accuracy = pos.coords.accuracy;
                const heading = pos.coords.heading || 0;

                // Actualizar HUD
                latElement.textContent = lat.toFixed(6);
                lonElement.textContent = lon.toFixed(6);
                altElement.textContent = alt.toFixed(1);
                accuracyElement.textContent = accuracy.toFixed(1);

                origenActual = { lat, lon };

                const cart = Cesium.Cartesian3.fromDegrees(lon, lat, 0);

                marcador.position = cart;

                // Rotar marcador según heading
                marcador.billboard.rotation = Cesium.Math.toRadians(heading);

                // Cámara
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1500),
                    orientation: {
                        heading: Cesium.Math.toRadians(heading),
                        pitch: Cesium.Math.toRadians(-45)
                    },
                    duration: 1
                });

            },
            function (error) {
                console.error(error);
                alert("Error obteniendo ubicación");
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );
    };

}

// Iniciar sistema
init();
