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

    let watchID = null;

window.getLocation = function () {

    if (!navigator.geolocation) {
        alert("Geolocalización no soportada");
        return;
    }

    if (watchID !== null) {
        navigator.geolocation.clearWatch(watchID);
    }

    watchID = navigator.geolocation.watchPosition(pos => {

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const speed = pos.coords.speed || 0;
        const heading = pos.coords.heading || 0;

        latElement.textContent = lat.toFixed(6);
        lonElement.textContent = lon.toFixed(6);

        origenActual = { lat, lon };

        const cart = Cesium.Cartesian3.fromDegrees(lon, lat);

        entity.position = cart;

        // Rotación tipo flecha
        entity.billboard = {
            image: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            width: 40,
            height: 40,
            rotation: Cesium.Math.toRadians(heading),
            verticalOrigin: Cesium.VerticalOrigin.CENTER
        };

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1500),
            orientation: {
                heading: Cesium.Math.toRadians(heading),
                pitch: Cesium.Math.toRadians(-45)
            },
            duration: 1
        });

    },
    error => {
        console.error(error);
    },
    {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
    });
};

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
