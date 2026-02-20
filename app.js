window.addEventListener("DOMContentLoaded", () => {

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

  function startTracking() {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada.");
      return;
    }

    stopTracking();

    watchID = navigator.geolocation.watchPosition(updatePosition);
  }

  function stopTracking() {
    if (watchID !== null) {
      navigator.geolocation.clearWatch(watchID);
      watchID = null;
    }
  }

  function updatePosition(pos) {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const heading = pos.coords.heading || 0;

    UI.lat.textContent = lat.toFixed(6);
    UI.lon.textContent = lon.toFixed(6);

    marker.position = Cesium.Cartesian3.fromDegrees(lon, lat, CONFIG.MARKER_HEIGHT);

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, CONFIG.CAMERA_HEIGHT),
      orientation: {
        heading: Cesium.Math.toRadians(heading),
        pitch: Cesium.Math.toRadians(CONFIG.CAMERA_PITCH),
        roll: 0
      }
    });
  }

  init();

});