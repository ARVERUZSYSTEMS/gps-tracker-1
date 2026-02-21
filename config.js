/* global window */
window.CONFIG = {
  // ✅ NO usamos Ion para evitar fallos de textura/mapa por token
  USE_ION: false,

  // GPS
  GPS: {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 15000
  },

  // Cámara
  CAMERA: {
    follow: true,               // si quieres que siga al usuario
    followHeightM: 1200,        // altura de cámara al seguir
    flyToDuration: 1.2
  },

  // Filtro por precisión (opcional)
  SMOOTHING: {
    enabled: true,
    maxAccuracyM: 80           // si accuracy > 80m, ignora esa lectura
  },

  // Icono SVG (no dependemos de PNG externo)
  MARKER_SVG_DATAURI:
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <defs>
          <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.6"/>
          </filter>
        </defs>
        <g filter="url(#s)">
          <path d="M32 2c-11 0-20 9-20 20 0 15 20 40 20 40s20-25 20-40C52 11 43 2 32 2z"
                fill="#00E5FF" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="32" cy="22" r="7" fill="#003B46" stroke="#FFFFFF" stroke-width="2"/>
        </g>
      </svg>
    `)
};