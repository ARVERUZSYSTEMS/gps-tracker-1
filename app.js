// ===============================
// ARVERUZ GPS – FINAL STABLE BUILD
// ===============================

// TOKEN
Cesium.Ion.defaultAccessToken = CONFIG.CESIUM_TOKEN;

// VIEWER
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    animation: false,
    timeline: false,
    shouldAnimate: false
});

// ===============================
// CAMARA TERRESTRE GARANTIZADA
// (ANTI FIRMAMENTO / ANTI NEGRO)
// ===============================
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
        -74.0,     // Longitud segura
        40.0,      // Latitud segura
        25000000   // 🔥 Altura global estable
    ),
    orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),   // 🔥 Mirando hacia la Tierra
        roll: 0.0
    }
});

// ===============================
// VARIABLES
// ===============================
let markerEntity = null;
let watchID = null;

// HUD
const latEl = document.getElementById("lat");
const lonEl = document.getElementById("lon");
const altEl = document.getElementById("alt");
const accEl = document.getElementById("accuracy");

// BOTÓN GPS
document.getElementById("btnTrack").addEventListener("click", startTracking);

// ===============================
// MARCADOR GPS PROFESIONAL
// ===============================
function createMarker(position) {

    if (markerEntity) {
        viewer.entities.remove(markerEntity);
    }

    markerEntity = viewer.entities.add({
        position: position,

        billboard: {
            image: CONFIG.MARKER_ICON,
            scale: 1.4,   // 🔥 Visible en cualquier zoom
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
        },

        point: {
            pixelSize: 10,
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2
        }
    });
}

// ===============================
// GPS TRACKING ESTABLE
// ===============================
function startTracking() {

    if (!navigator.geolocation) {
        alert("GPS no soportado");
        return;
    }

    if (watchID !== null) {
        navigator.geolocation.clearWatch(watchID);
    }

    watchID = navigator.geolocation.watchPosition(
        updatePosition,
        err => console.log("GPS Error:", err),
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 8000
        }
    );
}

// ===============================
// GPS UPDATE
// ===============================
function updatePosition(pos) {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const alt = pos.coords.altitude || 0;
    const acc = pos.coords.accuracy;

    // HUD
    latEl.textContent = lat.toFixed(6);
    lonEl.textContent = lon.toFixed(6);
    altEl.textContent = alt.toFixed(1);
    accEl.textContent = acc.toFixed(1);

    const cartesian = Cesium.Cartesian3.fromDegrees(
        lon,
        lat,
        CONFIG.MARKER_HEIGHT
    );

    if (!markerEntity) {

        createMarker(cartesian);

        // 🔥 Cámara suave y estable
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                lon,
                lat,
                CONFIG.CAMERA_HEIGHT
            ),
            orientation: {
                pitch: Cesium.Math.toRadians(CONFIG.CAMERA_PITCH)
            },
            duration: 1.2
        });

    } else {

        markerEntity.position = cartesian;
    }
}

// ===============================
// CAMERA STABILITY (CRÍTICO)
// ===============================
viewer.scene.screenSpaceCameraController.minimumZoomDistance = 25;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;

// 🔥 Nunca permitir conflictos
viewer.trackedEntity = undefined;