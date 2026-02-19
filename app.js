// ===============================
// ARVERUZ GPS CORE – VERSION PRO LIMPIA
// (sin parches, lista para producción)
// ===============================

Cesium.Ion.defaultAccessToken = CONFIG.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYzlkOTZhYS03ZmY2LTQ1MjItYjA0Yi02NWNiNjJiOTczYzUiLCJpZCI6MzkwOTAyLCJpYXQiOjE3NzEyOTA1MzV9.KDSNw1eDdgV1tuKnbC291EMSlpahZA_uI9fQNxEn8UQ;

// ===== Estado global =====
let viewer = null;
let marker = null;
let watchID = null;

// ===== UI cache =====
const UI = {
  lat: document.getElementById("lat"),
  lon: document.getElementById("lon"),
  alt: document.getElementById("alt"),
  accuracy: document.getElementById("accuracy"),
  btnTrack: document.getElementById("btnTrack")
};

// ===== Estado para suavizado =====
const SmoothState = {
  initialized: false,
  lon: 0,
  lat: 0,
  alt: 0,
  headingDeg: 0,
  lastUpdateTs: 0
};

// ===============================
// INIT
// ===============================
async function init() {
  const terrainProvider = await Cesium.createWorldTerrainAsync();

  viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider,
    timeline: false,
    animation: false,
    baseLayerPicker: true,
    navigationHelpButton: true,
    sceneModePicker: true,
    homeButton: true,
    geocoder: true
  });

  createMarker();
  wireUI();
}

function wireUI() {
  UI.btnTrack.addEventListener("click", startTracking);
}

// ===============================
// MARKER
// ===============================
function createMarker() {
  marker = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(-104.0, 39.0, 0),
    billboard: {
      image: CONFIG.MARKER_ICON,
      width: 40,
      height: 40,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }
  });
}

// ===============================
// TRACKING
// ===============================
function startTracking() {
  if (!navigator.geolocation) {
    alert("Geolocalización no soportada en este dispositivo/navegador.");
    return;
  }

  stopTracking(); // evita watchers duplicados

  watchID = navigator.geolocation.watchPosition(
    onGPSPosition,
    onGPSError,
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
}

function stopTracking() {
  if (watchID !== null) {
    navigator.geolocation.clearWatch(watchID);
    watchID = null;
  }
}

// ===============================
// GPS HANDLERS
// ===============================
function onGPSPosition(pos) {
  const { latitude, longitude, altitude, accuracy, heading } = pos.coords;

  const rawLat = latitude;
  const rawLon = longitude;
  const rawAlt = altitude || 0;
  const rawAcc = accuracy || 0;
  const rawHeading = (heading == null || Number.isNaN(heading)) ? 0 : heading;

  // HUD siempre muestra valores reales (sin suavizar)
  updateUI(rawLat, rawLon, rawAlt, rawAcc);

  // Si smoothing está apagado, aplicar directo
  const S = CONFIG.SMOOTHING;
  if (!S || !S.enabled) {
    applyFrame(rawLon, rawLat, rawAlt, rawHeading);
    return;
  }

  // Throttle (limita la carga)
  const now = performance.now();
  if (now - SmoothState.lastUpdateTs < S.minUpdateIntervalMs) return;
  SmoothState.lastUpdateTs = now;

  // Filtra lecturas malas por precisión
  if (rawAcc > S.maxAccuracyM) return;

  // Primera lectura: inicializa estado
  if (!SmoothState.initialized) {
    SmoothState.initialized = true;
    SmoothState.lon = rawLon;
    SmoothState.lat = rawLat;
    SmoothState.alt = rawAlt;
    SmoothState.headingDeg = rawHeading;
    applyFrame(SmoothState.lon, SmoothState.lat, SmoothState.alt, SmoothState.headingDeg);
    return;
  }

  // Evita vibración cuando está quieto
  const movedM = haversineMeters(SmoothState.lat, SmoothState.lon, rawLat, rawLon);
  if (movedM < S.minMoveM) {
    // suaviza sólo heading un poco
    SmoothState.headingDeg = lerpAngleDeg(SmoothState.headingDeg, rawHeading, S.alphaHeading);
    applyFrame(SmoothState.lon, SmoothState.lat, SmoothState.alt, SmoothState.headingDeg);
    return;
  }

  // Suavizado (EMA / low-pass)
  SmoothState.lon = lerp(SmoothState.lon, rawLon, S.alphaPos);
  SmoothState.lat = lerp(SmoothState.lat, rawLat, S.alphaPos);
  SmoothState.alt = lerp(SmoothState.alt, rawAlt, S.alphaPos);
  SmoothState.headingDeg = lerpAngleDeg(SmoothState.headingDeg, rawHeading, S.alphaHeading);

  applyFrame(SmoothState.lon, SmoothState.lat, SmoothState.alt, SmoothState.headingDeg);
}

function onGPSError(err) {
  console.error("GPS Error:", err);
}

// ===============================
// UI
// ===============================
function updateUI(lat, lon, alt, accuracy) {
  UI.lat.textContent = lat.toFixed(6);
  UI.lon.textContent = lon.toFixed(6);
  UI.alt.textContent = alt.toFixed(1);
  UI.accuracy.textContent = accuracy.toFixed(1);
}

// ===============================
// APPLY (MARKER + CAMERA)
// ===============================
function applyFrame(lon, lat, alt, headingDeg) {
  // Marker (posición suave)
  marker.position = Cesium.Cartesian3.fromDegrees(lon, lat, CONFIG.MARKER_HEIGHT);

  // Rotación según rumbo
  marker.billboard.rotation = Cesium.Math.toRadians(headingDeg);

  // Cámara estable (sin flyTo)
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, CONFIG.CAMERA_HEIGHT),
    orientation: {
      heading: Cesium.Math.toRadians(headingDeg),
      pitch: Cesium.Math.toRadians(CONFIG.CAMERA_PITCH),
      roll: 0
    }
  });
}

// ===============================
// MATH HELPERS
// ===============================
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Lerp angular (evita salto 359° -> 0°)
function lerpAngleDeg(a, b, t) {
  let diff = ((b - a + 540) % 360) - 180; // [-180, 180]
  return (a + diff * t + 360) % 360;
}

// Distancia aproximada entre dos coordenadas (Haversine)
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = Math.PI / 180;

  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

// ===============================
// START
// ===============================
init();

// Exponer si lo necesitas desde consola
window.startTracking = startTracking;
window.stopTracking = stopTracking;
