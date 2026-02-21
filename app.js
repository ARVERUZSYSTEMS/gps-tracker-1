// ===============================
// ARVERUZ GPS – DEFINITIVE STABLE BUILD
// ===============================

/* global Cesium, CONFIG */

// 🔥 ACTIVAR TOKEN ION CORRECTAMENTE
if (CONFIG.USE_ION && CONFIG.CESIUM_TOKEN) {
    Cesium.Ion.defaultAccessToken = CONFIG.CESIUM_TOKEN;
}

// 🔥 TOKEN
Cesium.Ion.defaultAccessToken = CONFIG.CESIUM_TOKEN;

// ===============================
// VIEWER ESTABLE
// ===============================

const viewer = new Cesium.Viewer("cesiumContainer", {

    terrain: Cesium.Terrain.fromWorldTerrain(),

    animation: false,
    timeline: false,
    baseLayerPicker: true,
    geocoder: true,

    shouldAnimate: true
});

// ===============================
// ESTABILIDAD VISUAL (CRÍTICO)
// ===============================

// 🔥 ESTO EVITA GLOBO AZUL / MORADO
viewer.scene.globe.baseColor = Cesium.Color.BLACK;

// 🔥 ILUMINACIÓN ESTABLE
viewer.scene.globe.enableLighting = false;

// 🔥 PROFUNDIDAD CORRECTA
viewer.scene.globe.depthTestAgainstTerrain = true;

// ===============================
// CONTROL DE CÁMARA (ANTI-LOCO)
// ===============================

viewer.scene.screenSpaceCameraController.minimumZoomDistance = 80;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;

// 🔥 DESACTIVA TRACKING AUTOMÁTICO
viewer.trackedEntity = undefined;

// ===============================
// VARIABLES ESTADO
// ===============================

let markerEntity = null;
let watchId = null;
let isTracking = false;

// ===============================
// HUD ELEMENTS
// ===============================

const latEl = document.getElementById("lat");
const lonEl = document.getElementById("lon");
const altEl = document.getElementById("alt");
const accEl = document.getElementById("accuracy");

const btnTrack = document.getElementById("btnTrack");

btnTrack.addEventListener("click", toggleTracking);

// ===============================
// TOGGLE TRACKING
// ===============================

function toggleTracking() {

    if (isTracking) {
        stopTracking();
    } else {
        startTracking();
    }
}

// ===============================
// START GPS
// ===============================

function startTracking() {

    if (!navigator.geolocation) {
        alert("GPS no soportado en este dispositivo");
        return;
    }

    isTracking = true;

    btnTrack.textContent = "🛑 Detener";

    watchId = navigator.geolocation.watchPosition(

        updatePosition,
        handleError,

        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000
        }
    );
}

// ===============================
// STOP GPS
// ===============================

function stopTracking() {

    isTracking = false;

    btnTrack.textContent = "📍 Ubicar";

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

// ===============================
// UPDATE POSITION – BLINDADA
// ===============================

function updatePosition(pos) {

    if (!pos || !pos.coords) return;

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const alt = pos.coords.altitude ?? 0;
    const acc = pos.coords.accuracy ?? 0;

    if (lat == null || lon == null) return;

    // ===============================
    // HUD SAFE UPDATE
    // ===============================

    latEl.textContent = lat.toFixed(6);
    lonEl.textContent = lon.toFixed(6);
    altEl.textContent = alt.toFixed(1);
    accEl.textContent = acc.toFixed(1);

    const position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);

    // ===============================
    // CREAR MARCADOR ESTABLE
    // ===============================

    if (!markerEntity) {

        markerEntity = viewer.entities.add({

            position: position,

            // 🔥 PUNTERO PROFESIONAL (NUNCA FALLA)
            point: {
                pixelSize: 14,
                color: Cesium.Color.CYAN,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });

        // 🔥 VUELO DE CÁMARA SOLO PRIMER FIX
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1500)
        });

    } else {

        // 🔥 MOVIMIENTO SUAVE
        markerEntity.position = position;
    }
}

// ===============================
// GPS ERROR HANDLER
// ===============================

function handleError(err) {

    console.log("GPS Error:", err);

    if (err.code === err.PERMISSION_DENIED) {
        alert("Permiso de GPS denegado");
    }
}