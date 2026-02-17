// ===============================
// ARVERUZ GPS 3D PRO FINAL
// ===============================

// 🔑 CESIUM TOKEN
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYzlkOTZhYS03ZmY2LTQ1MjItYjA0Yi02NWNiNjJiOTczYzUiLCJpZCI6MzkwOTAyLCJpYXQiOjE3NzEyOTA1MzV9.KDSNw1eDdgV1tuKnbC291EMSlpahZA_uI9fQNxEn8UQ";

// 🔑 OPENROUTESERVICE API
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImYwNTAyZThmNzAyZjRkZWQ5MmEzNjE5ZDkzZTMwNWZjIiwiaCI6Im11cm11cjY0In0=";

// Crear visor
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


// Elementos HUD
const latElement = document.getElementById("lat");
const lonElement = document.getElementById("lon");
const altElement = document.getElementById("alt");
const accuracyElement = document.getElementById("accuracy");

let posicionActual = null;

// Marcador
const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
    point: {
        pixelSize: 10,
        color: Cesium.Color.RED
    }
});

// Geolocalización
window.getLocation = function () {
    navigator.geolocation.getCurrentPosition(function (position) {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const alt = position.coords.altitude || 0;
        const accuracy = position.coords.accuracy;

        posicionActual = { lat, lon };

        latElement.textContent = lat.toFixed(6);
        lonElement.textContent = lon.toFixed(6);
        altElement.textContent = alt.toFixed(1);
        accuracyElement.textContent = accuracy.toFixed(1);

        const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
        entity.position = cartesian;

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 2000),
            orientation: {
                pitch: Cesium.Math.toRadians(-45)
            }
        });

    });
};

// Crear ruta hacia punto clickeado
window.crearRuta = function () {

    if (!posicionActual) {
        alert("Primero presiona UBICAR");
        return;
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction(async function (click) {

        const cartesian = viewer.camera.pickEllipsoid(click.position);
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);

        const destino = {
            lat: Cesium.Math.toDegrees(cartographic.latitude),
            lon: Cesium.Math.toDegrees(cartographic.longitude)
        };

        await generarRuta(posicionActual, destino);

        handler.destroy();

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

async function generarRuta(origen, destino) {

    const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": ORS_API_KEY
            },
            body: JSON.stringify({
                coordinates: [
                    [origen.lon, origen.lat],
                    [destino.lon, destino.lat]
                ]
            })
        }
    );

    const data = await response.json();
    const coords = data.features[0].geometry.coordinates;

    const rutaPositions = coords.map(c =>
        Cesium.Cartesian3.fromDegrees(c[0], c[1])
    );

    viewer.entities.add({
        polyline: {
            positions: rutaPositions,
            width: 5,
            material: Cesium.Color.YELLOW
        }
    });
}

// Auto ubicar al iniciar
getLocation();
