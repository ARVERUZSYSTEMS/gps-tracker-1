// ===============================
// ARVERUZ GPS TRACKER – MARKER REAL
// ===============================

let viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: Cesium.Terrain.fromWorldTerrain()
});

// 🔵 Crear puntero (entidad)
let marker = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(0, 0),
    point: {
        pixelSize: 12,
        color: Cesium.Color.CYAN,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2
    }
});

// 🎯 Función GPS REAL
function locateUser() {

    if (!navigator.geolocation) {
        alert("GPS no disponible");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {

        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        let alt = position.coords.altitude || 0;
        let acc = position.coords.accuracy;

        // ✅ Actualizar HUD
        document.getElementById("lat").textContent = lat.toFixed(6);
        document.getElementById("lon").textContent = lon.toFixed(6);
        document.getElementById("alt").textContent = alt.toFixed(2);
        document.getElementById("accuracy").textContent = acc.toFixed(1);

        // ✅ Convertir coordenadas
        let cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, alt);

        // ✅ Mover puntero
        marker.position = cartesian;

        // ✅ Centrar cámara (sin zoom loco)
        viewer.camera.flyTo({
            destination: cartesian,
            duration: 2
        });

    }, error => {

        console.log(error);
        alert("Permiso GPS denegado");

    }, {
        enableHighAccuracy: true
    });
}

// 🔘 Botón
document.getElementById("btnTrack").addEventListener("click", locateUser);