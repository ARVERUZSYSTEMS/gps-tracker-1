/* global Cesium, CONFIG */
(function () {
  "use strict";

  // ---------- HUD ----------
  const latEl = document.getElementById("lat");
  const lonEl = document.getElementById("lon");
  const altEl = document.getElementById("alt");
  const accEl = document.getElementById("accuracy");

  const btnTrack = document.getElementById("btnTrack");
  const btnRoute = document.getElementById("btnRoute");
  const btnClear = document.getElementById("btnClear");

  // ---------- Viewer (SIN ION para evitar globo morado/azul) ----------
  const viewer = new Cesium.Viewer("cesiumContainer", {
    animation: false,
    timeline: false,
    baseLayerPicker: true,
    geocoder: true,
    homeButton: true,
    navigationHelpButton: true,
    sceneModePicker: true,
    fullscreenButton: true,

    // ✅ OSM gratis y estable
    imageryProvider: new Cesium.OpenStreetMapImageryProvider({
      url: "https://a.tile.openstreetmap.org/"
    }),

    // ✅ Sin Terrain Ion (evita errores por token)
    terrainProvider: new Cesium.EllipsoidTerrainProvider()
  });

  // Cámara estable / anti “pegada al piso”
  const ssc = viewer.scene.screenSpaceCameraController;
  ssc.minimumZoomDistance = 25;        // evita pegarse al suelo
  ssc.maximumZoomDistance = 25000000;  // límite alto

  // Mejora visual básica
  viewer.scene.globe.depthTestAgainstTerrain = false;

  // ---------- Estado GPS ----------
  let watchId = null;
  let isTracking = false;

  // Marcador GPS
  let gpsEntity = null;

  // ---------- Estado Rutas ----------
  let routeMode = false;
  let routeStart = null;
  let routeEnd = null;
  let routeEntity = null;

  // ---------- Helpers ----------
  function setHud(lat, lon, alt, acc) {
    latEl.textContent = (lat ?? NaN).toFixed ? lat.toFixed(6) : "--";
    lonEl.textContent = (lon ?? NaN).toFixed ? lon.toFixed(6) : "--";
    altEl.textContent = (alt ?? NaN).toFixed ? alt.toFixed(1) : "--";
    accEl.textContent = (acc ?? NaN).toFixed ? acc.toFixed(1) : "--";
  }

  function ensureGpsEntity(position) {
    if (gpsEntity) return;

    gpsEntity = viewer.entities.add({
      name: "ARVERUZ GPS Marker",
      position,
      billboard: {
        image: CONFIG.MARKER_SVG_DATAURI,
        scale: 0.9,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        // ✅ siempre visible aunque el terreno “tape”
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      point: {
        pixelSize: 10,
        color: Cesium.Color.CYAN,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });
  }

  function updateGpsEntity(position) {
    ensureGpsEntity(position);
    gpsEntity.position = position;
  }

  function flyTo(position) {
    const carto = Cesium.Cartographic.fromCartesian(position);
    const lon = Cesium.Math.toDegrees(carto.longitude);
    const lat = Cesium.Math.toDegrees(carto.latitude);

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, CONFIG.CAMERA.followHeightM),
      duration: CONFIG.CAMERA.flyToDuration
    });
  }

  function distanceMeters(aCart, bCart) {
    const a = Cesium.Cartographic.fromCartesian(aCart);
    const b = Cesium.Cartographic.fromCartesian(bCart);
    const geodesic = new Cesium.EllipsoidGeodesic(a, b);
    return geodesic.surfaceDistance;
  }

  // ---------- GPS ----------
  function startTracking() {
    if (!navigator.geolocation) {
      alert("Este navegador no soporta GPS (geolocation).");
      return;
    }

    // Requiere HTTPS: GitHub Pages ✅
    isTracking = true;
    btnTrack.textContent = "⛔ Detener";

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const alt = pos.coords.altitude || 0;
        const acc = pos.coords.accuracy;

        setHud(lat, lon, alt, acc);

        // filtro precisión
        if (CONFIG.SMOOTHING.enabled && acc > CONFIG.SMOOTHING.maxAccuracyM) return;

        const position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);

        updateGpsEntity(position);

        // Cámara (sin trackedEntity para evitar “rebotes” raros)
        if (CONFIG.CAMERA.follow) {
          flyTo(position);
        }
      },
      (err) => {
        console.log("GPS Error:", err);
        alert("GPS: no se pudo obtener ubicación. Revisa permisos del navegador.");
        stopTracking();
      },
      CONFIG.GPS
    );
  }

  function stopTracking() {
    isTracking = false;
    btnTrack.textContent = "📍 Ubicar";

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  function toggleTracking() {
    if (isTracking) stopTracking();
    else startTracking();
  }

  // ---------- Ruta (2 clics) ----------
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  function setRouteMode(on) {
    routeMode = on;
    btnRoute.textContent = on ? "✅ Ruta" : "🧭 Ruta";
    if (on) {
      routeStart = null;
      routeEnd = null;
      if (routeEntity) {
        viewer.entities.remove(routeEntity);
        routeEntity = null;
      }
      alert("Modo Ruta: haz click en el mapa para ORIGEN y luego DESTINO.");
    }
  }

  handler.setInputAction((movement) => {
    if (!routeMode) return;

    const cartesian = viewer.scene.pickPosition(movement.position) ||
      viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);

    if (!cartesian) return;

    if (!routeStart) {
      routeStart = cartesian;
      return;
    }

    if (!routeEnd) {
      routeEnd = cartesian;

      const meters = distanceMeters(routeStart, routeEnd);
      const km = meters / 1000;

      routeEntity = viewer.entities.add({
        name: "ARVERUZ Route",
        polyline: {
          positions: [routeStart, routeEnd],
          width: 4,
          material: Cesium.Color.CYAN,
          clampToGround: false
        }
      });

      alert(`Distancia aprox: ${km.toFixed(2)} km`);
      setRouteMode(false);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // ---------- Limpiar ----------
  function clearAll() {
    // ruta
    routeMode = false;
    btnRoute.textContent = "🧭 Ruta";
    routeStart = null;
    routeEnd = null;
    if (routeEntity) {
      viewer.entities.remove(routeEntity);
      routeEntity = null;
    }

    // gps (no lo borro si estás trackeando)
    if (gpsEntity && !isTracking) {
      viewer.entities.remove(gpsEntity);
      gpsEntity = null;
      setHud(null, null, null, null);
    }
  }

  // ---------- Eventos UI ----------
  btnTrack.addEventListener("click", toggleTracking);
  btnRoute.addEventListener("click", () => setRouteMode(!routeMode));
  btnClear.addEventListener("click", clearAll);

  // Inicial HUD
  setHud(null, null, null, null);
})();