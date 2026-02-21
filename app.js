// ===============================
// ARVERUZ GPS – FINAL STABLE BUILD
// ===============================

Cesium.Ion.defaultAccessToken = CONFIG.CESIUM_TOKEN;
const viewer = new Cesium.Viewer("cesiumContainer", {

    terrain: Cesium.Terrain.fromWorldTerrain(),

    imageryProvider: new Cesium.IonImageryProvider({
        assetId: 2   // 🔥 Bing Maps / Satélite estándar
    }),

    animation: false,
    timeline: false,
    shouldAnimate: true

});

// 🔥 FIX CRÍTICO → TEXTURA PLANETA
viewer.imageryLayers.removeAll();

viewer.imageryLayers.addImageryProvider(
    new Cesium.IonImageryProvider({ assetId: 2 })
);

// 🔥 CAMARA TERRESTRE GARANTIZADA
viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-74, 40, 25000000),
    orientation: {
        pitch: Cesium.Math.toRadians(-90)
    }
});