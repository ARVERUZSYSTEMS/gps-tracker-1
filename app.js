// ===============================
// ARVERUZ GPS PRO – STABLE (NO ION)
// Map: OpenStreetMap
// Geocode: Nominatim
// Route: OSRM
// ===============================

(function () {
  "use strict";

  // ---------- DOM ----------
  const latEl = document.getElementById("lat");
  const lonEl = document.getElementById("lon");
  const altEl = document.getElementById("alt");
  const accEl = document.getElementById("accuracy");

  const btnTrack = document.getElementById("btnTrack");
  const btnRoute = document.getElementById("btnRoute");
  const btnClear = document.getElementById("btnClear");

  // ---------- VIEWER (SIN ION) ----------
  // OJO: terrain Ion = problemas de token. Por eso lo apagamos.
  const viewer = new Cesium.Viewer("cesiumContainer", {
    animation: false,
    timeline: false,
    geocoder: true,
    baseLayerPicker: true,
    sceneModePicker: true,
    navigationHelpButton: true,
    homeButton: true,
    fullscreenButton: true,
    infoBox: false,
    selectionIndicator: false,
    shouldAnimate: true,

    imageryProvider: new Cesium.OpenStreetMapImageryProvider({
      url: "https://a.tile.openstreetmap.org/"
    }),

    // Evita errores de Ion por terrain:
    terrainProvider: new Cesium.EllipsoidTerrainProvider()
  });

  // Cámara estable (evita “pegarse” al suelo)
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 25;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;

  // ---------- ESTADO GPS ----------
  let watchId = null;
  let tracking = false;
  let marker = null;
  let firstFix = true;

  // RUTA
  let routeEntity = null;
  let routePoints = []; // para paradas

  // ---------- HELPERS ----------
  function safeText(el, value, fallback = "--") {
    el.textContent = (value === null || value === undefined || Number.isNaN(value)) ? fallback : value;
  }

  function setHud(lat, lon, alt, acc) {
    if (typeof lat === "number") safeText(latEl, lat.toFixed(6)); else safeText(latEl, "--");
    if (typeof lon === "number") safeText(lonEl, lon.toFixed(6)); else safeText(lonEl, "--");
    if (typeof alt === "number") safeText(altEl, alt.toFixed(1)); else safeText(altEl, "--");
    if (typeof acc === "number") safeText(accEl, acc.toFixed(1)); else safeText(accEl, "--");
  }

  function makeMarker(position) {
    if (marker) viewer.entities.remove(marker);

    // Punto + “anillo” para que se vea SIEMPRE
    marker = viewer.entities.add({
      position,
      point: {
        pixelSize: 12,
        color: Cesium.Color.CYAN,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      ellipse: {
        semiMajorAxis: 20.0,
        semiMinorAxis: 20.0,
        material: Cesium.Color.CYAN.withAlpha(0.20),
        outline: true,
        outlineColor: Cesium.Color.CYAN.withAlpha(0.8),
        height: 0,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });

    return marker;
  }

  function flyToPosition(position) {
    // Acerca a nivel “calle” sin pegarse al suelo
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.clone(position),
      orientation: {
        heading: viewer.camera.heading,
        pitch: Cesium.Math.toRadians(-55),
        roll: 0
      },
      duration: 1.2
    });
  }

  // ---------- GPS ----------
  function startTracking() {
    if (!navigator.geolocation) {
      alert("Este navegador no soporta geolocalización.");
      return;
    }

    tracking = true;
    firstFix = true;
    btnTrack.textContent = "⛔ Detener";

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const alt = (typeof pos.coords.altitude === "number") ? pos.coords.altitude : 0;
        const acc = pos.coords.accuracy;

        setHud(lat, lon, alt, acc);

        const position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);

        if (!marker) makeMarker(position);
        else marker.position = position;

        // Solo en el primer fix acercamos cámara (después NO molestamos tu zoom)
        if (firstFix) {
          firstFix = false;
          flyToPosition(position);
        }
      },
      (err) => {
        console.log("GPS Error:", err);
        alert("No se pudo obtener GPS. Revisa permisos de ubicación.");
        stopTracking();
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 12000 }
    );
  }

  function stopTracking() {
    tracking = false;
    btnTrack.textContent = "📍 Ubicar";

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  // ---------- GEOCODE (Nominatim) ----------
  async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: {
        // Nominatim recomienda identificar app; si bloquea, lo ajustamos.
        "Accept": "application/json"
      }
    });
    if (!res.ok) throw new Error("Geocode falló");
    const data = await res.json();
    if (!data || !data[0]) throw new Error("Dirección no encontrada");
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }

  // ---------- ROUTE (OSRM) ----------
  async function routeOSRM(pointsLonLat) {
    // pointsLonLat: [{lon,lat}, ...]
    const coords = pointsLonLat.map(p => `${p.lon},${p.lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Ruta falló");
    const data = await res.json();
    if (!data.routes || !data.routes[0]) throw new Error("No se pudo calcular ruta");
    return data.routes[0].geometry.coordinates; // [[lon,lat], ...]
  }

  function drawRoute(coordsLonLat) {
    if (routeEntity) viewer.entities.remove(routeEntity);

    const positions = coordsLonLat.map(([lon, lat]) => Cesium.Cartesian3.fromDegrees(lon, lat, 0));

    routeEntity = viewer.entities.add({
      polyline: {
        positions,
        width: 6,
        material: Cesium.Color.CYAN,
        clampToGround: true
      }
    });

    viewer.zoomTo(routeEntity);
  }

  // ---------- BOTONES ----------
  btnTrack.addEventListener("click", () => {
    if (!tracking) startTracking();
    else stopTracking();
  });

  btnClear.addEventListener("click", () => {
    stopTracking();
    setHud(null, null, null, null);

    if (marker) {
      viewer.entities.remove(marker);
      marker = null;
    }
    if (routeEntity) {
      viewer.entities.remove(routeEntity);
      routeEntity = null;
    }
    routePoints = [];
  });

  btnRoute.addEventListener("click", async () => {
    try {
      const from = prompt("Dirección de INICIO (ej: 3500 N Walden St, Aurora, CO):");
      if (!from) return;

      const to = prompt("Dirección de DESTINO:");
      if (!to) return;

      const stopsRaw = prompt("Paradas intermedias (opcional). Sepáralas con |  (ej: parada1 | parada2 | parada3):") || "";
      const stops = stopsRaw
        .split("|")
        .map(s => s.trim())
        .filter(Boolean);

      // Geocode
      const start = await geocodeAddress(from);
      const end = await geocodeAddress(to);

      const stopCoords = [];
      for (const s of stops) stopCoords.push(await geocodeAddress(s));

      // Orden: start -> stops -> end
      const pts = [{ lon: start.lon, lat: start.lat }, ...stopCoords.map(p => ({ lon: p.lon, lat: p.lat })), { lon: end.lon, lat: end.lat }];

      const line = await routeOSRM(pts);
      drawRoute(line);
    } catch (e) {
      console.log(e);
      alert("No se pudo generar la ruta. (Puede ser bloqueo temporal del servicio o dirección inválida).");
    }
  });

  // ---------- ESTADO INICIAL ----------
  setHud(null, null, null, null);

  // Un “home” bonito (Denver aprox) para no quedar en estrellas
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-104.9903, 39.7392, 25000),
    orientation: { pitch: Cesium.Math.toRadians(-55) }
  });

})();