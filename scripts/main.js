/** contains the main logic of the app, to be loaded as last **/


var road_pollys;  // TODO: remove
const initialize = async (use_clusters = false) => {
    // load all the data, create necessary points
    // show loading screen during this
    // initialize global vars
    // add all click events..

    // initialize the map
    const map = initMap();

    // load and draw accidents data
    const accidents = await loadBikeAccidents();
    const accidentsMarkers = initBikeAccident(accidents);
    drawAccidents(accidents, accidentsMarkers, map, null);

    // load and draw bike roads
    const roads = await loadRoads();
    const roadsLines = initAllRoads(roads);
    road_pollys = roadsLines;  // TODO: remove
    const [minYear, maxYear] = minMaxYear(roads);
    displayRoads(map, roads, roadsLines, minYear, maxYear);

    if (use_clusters)
        drawClusteredAccidents(accidents);
    else
        drawAccidents(accidents);

    // load and draw bike roads
    // const [roads, roads_poly] = await loadRoads();
};

/* the main: */

// first allow switching to dark mode at any time
document.getElementById("app__dark_mode").addEventListener("click", switchDarkMode);


// initialize map...
var map = initMap();

var bike_data;
loadBikeAccidents();

var road_data, road_pollys, min_year, max_year;
loadRoads();

// TODO: add preloader and use async calls.. https://codepen.io/balgot/pen/gOjgEQm