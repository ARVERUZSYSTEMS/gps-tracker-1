// ===============================
// ARVERUZ GPS PRO
// ===============================

// TOKEN SEGURO
Cesium.Ion.defaultAccessToken = CONFIG.CESIUM_TOKEN;

// VIEWER ESTABLE
const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    timeline: false,
    animation: false
});

// CAMARA GLOBAL INICIAL (EVITA PANTALLA NEGRA)
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-74, 40, 20000000)
});

// ===============================
// VARIABLES
// ===============================
let gpsEntity;
let watchId;

let waypoints = [];
let routeLine;

// HUD
const latEl = document.getElementById("lat");
const lonEl = document.getElementById("lon");
const altEl = document.getElementById("alt");
const accEl = document.getElementById("accuracy");

// ===============================
// GPS MARKER
// ===============================
gpsEntity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(0, 0),
    point: {
        pixelSize: 14
    }
});

// ===============================
// SMOOTHING
// ===============================
let lastPosition;

function smoothPosition(newPos) {
    if (!lastPosition) {
        lastPosition = newPos;
        return newPos;
    }

    return Cesium.Cartesian3.lerp(
        lastPosition,
        newPos,
        CONFIG.SMOOTHING.alphaPos,
        new Cesium.Cartesian3()
    );
}

// ===============================
// GPS TRACKING
// ===============================
function startGPS() {

    if (!navigator.geolocation) {
        alert("GPS no disponible");
        return;
    }

    watchId = navigator.geolocation.watchPosition(position => {

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const alt = position.coords.altitude || 0;
        const acc = position.coords.accuracy;

        latEl.textContent = lat.toFixed(6);
        lonEl.textContent = lon.toFixed(6);
        altEl.textContent = alt.toFixed(1);
        accEl.textContent = acc.toFixed(1);

        const rawPos = Cesium.Cartesian3.fromDegrees(
            lon,
            lat,
            CONFIG.MARKER_HEIGHT
        );

        const smoothPos = smoothPosition(rawPos);

        const moveDistance = lastPosition
            ? Cesium.Cartesian3.distance(lastPosition, smoothPos)
            : 999;

        if (moveDistance > CONFIG.SMOOTHING.minMoveM) {
            gpsEntity.position = smoothPos;

            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                    lon,
                    lat,
                    CONFIG.CAMERA_HEIGHT
                ),
                orientation: {
                    pitch: Cesium.Math.toRadians(CONFIG.CAMERA_PITCH)
                },
                duration: 0.6
            });

            lastPosition = smoothPos;
        }

    }, error => {
        console.log(error);
    }, {
        enableHighAccuracy: true
    });
}

// BOTON
document.getElementById("btnTrack").onclick = startGPS;

// ===============================
// WAYPOINT SYSTEM
// ===============================
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction(click => {

    const cartesian = viewer.scene.pickPosition(click.position);

    if (!cartesian) return;

    waypoints.push(cartesian);

    viewer.entities.add({
        position: cartesian,
        point: {
            pixelSize: 10
        }
    });

    updateRoute();

}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// LIMPIAR RUTA
handler.setInputAction(() => {

    waypoints = [];

    viewer.entities.removeAll();

    gpsEntity = viewer.entities.add({
        position: lastPosition || Cesium.Cartesian3.fromDegrees(0, 0),
        point: {
            pixelSize: 14
        }
    });

    routeLine = null;

}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

// ===============================
// ROUTE LINE
// ===============================
function updateRoute() {

    if (routeLine) viewer.entities.remove(routeLine);

    if (waypoints.length < 2) return;

    routeLine = viewer.entities.add({
        polyline: {
            positions: waypoints,
            width: 3
        }
    });
}