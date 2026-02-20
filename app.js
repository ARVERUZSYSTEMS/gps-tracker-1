// ===============================
// ARVERUZ GPS CORE – VERSION PRO LIMPIA
// ===============================

Cesium.Ion.defaultAccessToken = CONFIG.CESIUM_TOKEN;

let viewer = null;
let marker = null;
let watchID = null;

const UI = {
  lat: document.getElementById("lat"),
  lon: document.getElementById("lon"),
  alt: document.getElementById("alt"),
  accuracy: document.getElementById("accuracy"),
  btnTrack: document.getElementById("btnTrack")
};

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
    alert("Geolocalización no soportada.");
    return;
  }

  stopTracking();

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
// GPS
// ===============================
function onGPSPosition(pos) {

  const { latitude, longitude, altitude, accuracy, heading } = pos.coords;

  const rawLat = latitude;
  const rawLon = longitude;
  const rawAlt = altitude || 0;
  const rawAcc = accuracy || 0;
  const rawHeading = heading || 0;

  updateUI(rawLat, rawLon, rawAlt, rawAcc);

  applyFrame(rawLon, rawLat, rawAlt, rawHeading);
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
// APPLY
// ===============================
function applyFrame(lon, lat, alt, headingDeg) {

  marker.position = Cesium.Cartesian3.fromDegrees(lon, lat, CONFIG.MARKER_HEIGHT);

  marker.billboard.rotation = Cesium.Math.toRadians(headingDeg);

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
init();

window.startTracking = startTracking;
window.stopTracking = stopTracking;