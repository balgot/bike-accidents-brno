/** contains the main logic of the app, to be loaded as last **/

var road_pollys; // TODO: remove
var map; // TODO: remove

const unselectForm = document.querySelector(".unselect");
const unselectHidden = "unselect--invisible";
const aboutRoad = document.getElementById("about_road");

unselectForm.addEventListener("click", (e) => {
    e.preventDefault();
    markRoads();
    resetMap(map);
    unselectForm.classList.add(unselectHidden);
    aboutRoad.innerHTML = "";
});

const markRoads = (selectedIdx = null) => {
    road_pollys.forEach((poly, i) => {
        const color = i === selectedIdx ? "blue" : "red";
        poly.forEach((p) => p.setStyle({ color }));
    });
};

/**
 * Handle road click event.
 *
 * @param {ClickEvent} event
 *      click event, with `event.taget` pointing to the segment
 * @param {[BikeRoads]} data
 *      bike road data
 * @param {Number} idx
 *      index of which road got clicked on
 * @returns nothing
 * @todo get all polyline
 */
const roadClick = (event, data, idx) => {
    const segment = event.target; // which polyline

    // for now just console log, TODO: do sth productive here, like filtering
    console.log(`Road ${idx}: ${data[idx]}`);

    // zoom in to the segments
    let bounds = L.latLngBounds();
    road_pollys[idx].forEach((polyline) => {
        bounds.extend(polyline.getBounds());
    });
    map.flyToBounds(bounds);

    // show the unselect button
    unselectForm.classList.remove(unselectHidden);

    // update the road description
    const [description, address] = roadInfo(data[idx]);
    aboutRoad.innerHTML = description;
    console.log({ about: aboutRoad.innerHTML });

    // make it more visible
    markRoads(idx);
};

const initialize = async (use_clusters = false) => {
    // load all the data, create necessary points
    // show loading screen during this
    // initialize global vars
    // add all click events..

    console.log("Starting to load the data...");
    document.documentElement.classList.add("loading");

    // initialize the map
    map = initMap();

    // load and draw accidents data
    const accidents = await loadBikeAccidents();
    console.log({ accidents });
    const rr = await accidents;
    console.log({ rr });
    const accidentsMarkers = initBikeAccident(accidents);
    // if (use_clusters)
    //     drawClusteredAccidents(accidents, map);
    // else
    //     drawAccidents(accidents, accidentsMarkers, map, null);

    // load and draw bike roads
    const roads = await loadRoads();
    const roadsLines = initAllRoads(roads);
    road_pollys = roadsLines; // TODO: remove
    const [minYear, maxYear] = minMaxYear(roads);
    displayRoads(map, roads, roadsLines, minYear, maxYear);

    // load and draw bike roads
    // const [roads, roads_poly] = await loadRoads();
};

/* the main: */

// first allow switching to dark mode at any time
document
    .getElementById("app__dark_mode")
    .addEventListener("click", switchDarkMode);

// // initialize map...
// var map = initMap();

// var bike_data;
// loadBikeAccidents();

// var road_data, road_pollys, min_year, max_year;
// loadRoads();

initialize().then(() => {
    console.log("Finisiehd all loading");
    document.documentElement.classList.remove("loading");
    document.documentElement.classList.add("ready");
});

// drawDonut(donutData, donutAttr, "#sex", 500, 500, 100) // TODO: remove
const donut = new DonutChart(500, 500, 100, "#sex");
donut.update(donutData, donutAttr);

var ii = true;
const donutChange = () => {
    donut.update(ii ? donutDataB : donutData, donutAttr);
    ii = !ii;
};

// pricina, stav_ridic -- barplot, simple, rotated
// vek_skupina -- donut
// den_v_tydnu, mesic -- https://d3-graph-gallery.com/graph/barplot_button_data_hard.html
