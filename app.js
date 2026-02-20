window.addEventListener("DOMContentLoaded", async () => {

  const debug = document.getElementById("debug");

  try {

    debug.innerText = "SETTING TOKEN...";

    Cesium.Ion.defaultAccessToken = CONFIG.CESIUM_TOKEN;

    debug.innerText = "CREATING VIEWER...";

    let viewer;

    try {

      debug.innerText = "LOADING TERRAIN...";

      const terrainProvider = await Cesium.createWorldTerrainAsync();

      viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider,
        timeline: false,
        animation: false
      });

      debug.innerText = "TERRAIN LOADED ✅";

    } catch (terrainError) {

      console.warn("Terrain fallback:", terrainError);

      viewer = new Cesium.Viewer("cesiumContainer", {
        timeline: false,
        animation: false
      });

      debug.innerText = "FALLBACK MODE (NO TERRAIN) ✅";
    }

    viewer.scene.globe.enableLighting = true;

    console.log("CESIUM FULLY RUNNING");

  } catch (fatalError) {

    console.error("FATAL ERROR:", fatalError);

    debug.innerText = "FATAL ERROR ❌\n" + fatalError.message;
  }
});