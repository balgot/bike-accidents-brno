/** contains the main logic of the app, to be loaded as last **/

// events...
document.getElementById("app__dark_mode").addEventListener("click", switchDarkMode);

// initialize map...
var map = initMap();

var bike_data;
loadBikeAccidents();

var road_data, road_pollys, min_year, max_year;
loadRoads();