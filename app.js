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
    shouldAnimate: true
});

// VARIABLES ESTADO
let markerEntity = null;
let isTracking = false;

// HUD
const latEl = document.getElementById("lat");
const lonEl = document.getElementById("lon");
const altEl = document.getElementById("alt");
const accEl = document.getElementById("accuracy");

// BOTÓN
document.getElementById("btnTrack").addEventListener("click", toggleTracking);

// ===============================
// CREAR MARCADOR PROFESIONAL
// ===============================

function createMarker(position) {

    if (markerEntity) {
        viewer.entities.remove(markerEntity);
    }

    markerEntity = viewer.entities.add({
        position: position,
        billboard: {
            image: CONFIG.MARKER_ICON,
            scale: 0.6,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
    });

    return markerEntity;
}

// ===============================
// TRACKING GPS ESTABLE
// ===============================

function toggleTracking() {

    if (isTracking) {
        stopTracking();
    } else {
        startTracking();
    }
}

function startTracking() {

    if (!navigator.geolocation) {
        alert("GPS no soportado");
        return;
    }

    isTracking = true;

    navigator.geolocation.watchPosition(
        updatePosition,
        handleError,
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }
    );
}

function stopTracking() {

    isTracking = false;

    viewer.trackedEntity = undefined;  // 🔥 CLAVE
}

// ===============================
// ACTUALIZACIÓN GPS
// ===============================

function updatePosition(pos) {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const alt = pos.coords.altitude || 0;
    const acc = pos.coords.accuracy;

    latEl.textContent = lat.toFixed(6);
    lonEl.textContent = lon.toFixed(6);
    altEl.textContent = alt.toFixed(1);
    accEl.textContent = acc.toFixed(1);

    // FILTRO DE PRECISIÓN
    if (CONFIG.SMOOTHING.enabled && acc > CONFIG.SMOOTHING.maxAccuracyM) {
        return;
    }

    const position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);

    if (!markerEntity) {

        function createMarker(position) {

    if (markerEntity) {
        viewer.entities.remove(markerEntity);
    }

    markerEntity = viewer.entities.add({

        position: position,

        // 🔥 ICONO PRINCIPAL
        billboard: {
            image: CONFIG.MARKER_ICON,
            scale: 1.2,                      // 👈 MÁS GRANDE
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            pixelOffset: new Cesium.Cartesian2(0, -10)
        },

        // 🔥 PUNTO CENTRAL (VISIBLE SIEMPRE)
        point: {
            pixelSize: 12,
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
        }
    });

    return markerEntity;
}
        });

    } else {

        markerEntity.position = position;
    }
}

// ===============================
// MANEJO ERRORES GPS
// ===============================

function handleError(err) {

    console.log("GPS Error:", err);
}

// ===============================
// BLOQUEO DE CÁMARA (ANTI-COLAPSO)
// ===============================

viewer.scene.screenSpaceCameraController.minimumZoomDistance = 50;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;

// 🔥 DESACTIVA TRACKING AUTOMÁTICO
viewer.trackedEntity = undefined;
