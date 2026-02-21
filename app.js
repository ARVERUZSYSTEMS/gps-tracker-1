// ============================
// CESIUM BASIC TEST
// ============================

Cesium.Ion.defaultAccessToken = CONFIG.CESIUM_TOKEN;

try {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    timeline: false,
    animation: false
  });

  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-74, 40, 20000000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45)
    }
  });

  console.log("CESIUM BASIC LOADED");

} catch (e) {
  console.error("Cesium init error:", e);
}