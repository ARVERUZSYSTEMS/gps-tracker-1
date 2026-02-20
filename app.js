Cesium.Ion.defaultAccessToken = CONFIG.CESIUM_TOKEN;

const viewer = new Cesium.Viewer("cesiumContainer", {
  timeline: false,
  animation: false
});

console.log("CESIUM OK");