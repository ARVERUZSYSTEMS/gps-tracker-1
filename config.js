/* global window */

window.CONFIG = {

    // 🔥 USAMOS ION (NECESARIO PARA MAPA REAL)
    USE_ION: true,

    // 🔥 PEGA TU TOKEN REAL AQUÍ
    CESIUM_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNTUzMWFhZS1lMGZiLTQwMDktYmEyNS1mYTA3OWRkZWMxNTkiLCJpZCI6MzkwOTAyLCJpYXQiOjE3NzE2OTAyNTJ9.R_fjgQYrsMEL3PZf0OZQHaN4J1KGA0Mn3ri1g57YjYs",

    // ===============================
    // GPS
    // ===============================
    GPS: {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000
    },

    // ===============================
    // CÁMARA
    // ===============================
    CAMERA: {
        follow: true,          // seguir usuario
        followHeightM: 1200,   // altura estable (NO zoom loco)
        flyToDuration: 1.2
    },

    // ===============================
    // FILTRO PRECISIÓN
    // ===============================
    SMOOTHING: {
        enabled: true,
        maxAccuracyM: 80
    },

    // ===============================
    // MARCADOR PROFESIONAL (SVG)
    // ===============================
    MARKER_SVG_DATAURI:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
                <defs>
                    <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2"
                            flood-color="#000" flood-opacity="0.6"/>
                    </filter>
                </defs>

                <g filter="url(#s)">
                    <path d="M32 2c-11 0-20 9-20 20 0 15 20 40 20 40s20-25 20-40C52 11 43 2 32 2z"
                        fill="#00E5FF"
                        stroke="#FFFFFF"
                        stroke-width="2"/>

                    <circle cx="32" cy="22" r="7"
                        fill="#003B46"
                        stroke="#FFFFFF"
                        stroke-width="2"/>
                </g>
            </svg>
        `)
};