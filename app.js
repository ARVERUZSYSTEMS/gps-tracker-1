// ===============================
// ARVERUZ GPS PRO – FULL STABLE
// ===============================

// TOKEN
Cesium.Ion.defaultAccessToken = CONFIG.CESIUM_TOKEN;

// VIEWER
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    animation: false,
    timeline: false,
    baseLayerPicker: true,
    shouldAnimate: true
});
// 🔥 MAPA BASE DEFINITIVO (ESRI – ULTRA ESTABLE)

viewer.imageryLayers.removeAll();

viewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    })
);

// ESTADO
let markerEntity = null;
let watchId = null;

// HUD
const latEl = document.getElementById("lat");
const lonEl = document.getElementById("lon");
const altEl = document.getElementById("alt");
const accEl = document.getElementById("accuracy");

// BOTÓN
document.getElementById("btnTrack").addEventListener("click", toggleTracking);

// ===============================
// TOGGLE GPS
// ===============================

function toggleTracking() {

    if (watchId) {
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
        alert("GPS no soportado");
        return;
    }

    watchId = navigator.geolocation.watchPosition(
        updatePosition,
        handleError,
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }
    );
}

// ===============================
// STOP GPS
// ===============================

function stopTracking() {

    navigator.geolocation.clearWatch(watchId);
    watchId = null;
}

// ===============================
// UPDATE GPS
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

    const position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);

    if (!markerEntity) {

        markerEntity = viewer.entities.add({

            position: position,

            billboard: {
                image: CONFIG.MARKER_ICON,
                scale: 1.0,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },

            point: {
                pixelSize: 10,
                color: Cesium.Color.CYAN,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });

        // 🔥 CÁMARA SUAVE (NO COLAPSA)
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1500)
        });

    } else {

        markerEntity.position = position;
    }
}

// ===============================
// GPS ERROR
// ===============================

function handleError(err) {

    console.log("GPS Error:", err);
}

// ===============================
// CÁMARA ESTABLE
// ===============================

viewer.scene.screenSpaceCameraController.minimumZoomDistance = 50;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;

viewer.trackedEntity = undefined;