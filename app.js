const latElement = document.getElementById("lat");
const lonElement = document.getElementById("lon");
const accuracyElement = document.getElementById("accuracy");

let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker = L.marker([0, 0]).addTo(map);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocalización no soportada.");
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    latElement.textContent = lat;
    lonElement.textContent = lon;
    accuracyElement.textContent = accuracy + " metros";

    map.setView([lat, lon], 15);
    marker.setLatLng([lat, lon]);
}
