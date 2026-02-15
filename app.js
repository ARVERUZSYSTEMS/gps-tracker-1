function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocalización no soportada");
    }
}

function showPosition(position) {
    document.getElementById("lat").textContent = position.coords.latitude;
    document.getElementById("lon").textContent = position.coords.longitude;
    document.getElementById("accuracy").textContent = position.coords.accuracy + " metros";
}
