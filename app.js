// ===============================
// ARVERUZ GPS – FULL STABLE BUILD
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

// Inicializa la cámara en una vista global bonita
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-74, 40, 20000000)
});

// VARIABLES DE ESTADO
let markerEntity = null;
let watchID = null;

// HUD
const latEl = document.getElementById("lat");
const lonEl = document.getElementById("lon");
const altEl = document.getElementById("alt");
const accEl = document.getElementById("accuracy");

// BOTÓN
document.getElementById("btnTrack").addEventListener("click", startTracking);

// ===============================
// MARCADOR (PUNTERO GPS)
// ===============================

function createMarker(position) {
    if (markerEntity) {
        viewer.entities.remove(markerEntity);
    }

    markerEntity = viewer.entities.add({
        position: position,
        billboard: {
            image: CONFIG.MARKER_ICON,
            scale: 1.2,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            pixelOffset: new Cesium.Cartesian2(0, -10)
        },
        point: {
            pixelSize: 10,
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
        }
    });

    return markerEntity;
}

// ===============================
// GPS TRACKING
// ===============================

function startTracking() {

    if (!navigator.geolocation) {
        alert("Geolocalización no soportada");
        return;
    }

    if (watchID !== null) {
        navigator.geolocation.clearWatch(watchID);
    }

    watchID = navigator.geolocation.watchPosition(
        pos => updatePosition(pos),
        err => console.error(err),
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 8000
        }
    );
}

function updatePosition(pos) {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const alt = pos.coords.altitude || 0;
    const acc = pos.coords.accuracy;

    // Actualiza HUD
    latEl.textContent = lat.toFixed(6);
    lonEl.textContent = lon.toFixed(6);
    altEl.textContent = alt.toFixed(1);
    accEl.textContent = acc.toFixed(1);

    const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, CONFIG.MARKER_HEIGHT);

    if (!markerEntity) {
        createMarker(cartesian);

        // Centrar cámara la primera vez
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, CONFIG.CAMERA_HEIGHT),
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
// CAMERA RESTRICTIONS
// ===============================

viewer.scene.screenSpaceCameraController.minimumZoomDistance = 30;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;

// Evitar track automático que entra en conflicto con zoom
viewer.trackedEntity = undefined;