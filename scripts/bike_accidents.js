// create map a center it on top of brno-center
var map = L.map('map').setView([49.19522, 16.60796], 13);

// add a layer with data
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// adding custom marker
// var marker = L.marker([49.19522, 16.60796]).addTo(map);

// custom circle
// var circle = L.circle([49.19522, 16.60796], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 500
// }).addTo(map);

// polygon
// var polygon = L.polygon([
//     [49.19522, 16.60796],
//     [49.18522, 16.60796],
//     [49.19522, 16.61796]
// ]).addTo(map);

// custom click function
// marker.on("click", () => console.log("click1"), () => console.log("click"));

// popups
// marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
// circle.bindPopup("I am a circle.");
// polygon.bindPopup("I am a polygon.");

// polyline
// var latlngs = [
//     [49.19522, 16.61796],
//     [49.18522, 16.61796],
//     [49.19522, 16.62796]
// ];

// var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);

// zoom the map to the polyline
// map.fitBounds(polyline.getBounds());