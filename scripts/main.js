/** contains the main logic of the app, to be loaded as last **/

/******************************************************************************
 *                      C O N S T A N T S
 ******************************************************************************/

const unselectForm = document.querySelector(".unselect");
const unselectHidden = "unselect--invisible";
const aboutRoad = document.getElementById("about_road");
const minYearSpan = document.querySelector(".about__year--min");
const maxYearSpan = document.querySelector(".about__year--max");
const loadingWhat = document.querySelector("#loading__what");
const COLOR_ROAD_SELECTED = "blue";
const COLOR_ROAD_UNSELECTED = "red";

/******************************************************************************
 *                      V A R I A B L E S
 ******************************************************************************/

var DBG = true;
var map; // the map used for visualization

// bike roads data
var roads; // just as downloaded
var selectedRoadIdx = null; // selected road or null
var filteredRoads;  // same as `filteredAccidents`
var roadsPolylines;

// accidents data
var accidents; // just as downloaded, well, almost ;)
var filteredAccidents; // filtered & selected, working version, list of objects, keys are reasons for display state, values are bools, true indicating to display
var accidentsMarkers; // markers for each accident, have same length

// array, one entry for each row contains a list of indexes to accidents
var bikeRoadsAccidents;

/******************************************************************************
 *                        H E L P E R S
 ******************************************************************************/

/**
 * Color the roads polylines.
 *
 * @param {Number} selectedIdx index of road to highlight
 * @returns nothing
 */
const markRoads = (selectedIdx = null) => {
    roadsPolylines.forEach((poly, i) => {
        const color =
            i === selectedIdx ? COLOR_ROAD_SELECTED : COLOR_ROAD_UNSELECTED;
        poly.forEach((p) => p.setStyle({ color }));
    });
};

/* TODO */
const renderSelection = () => {
    // display all the stuff
    drawAccidents(accidents, accidentsMarkers, map, () => true); // TODO: use selectedIdx's instead of function
    displayRoads(map, roads, roadsPolylines, 0, 3000); // TODO: use selectedInx's instead of min, max year
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
 */
const roadClick = (event, data, idx) => {
    // prevent site reloading
    const segment = event.target;

    // update the global vars related to the current selection
    selectedRoadIdx = idx;
    filteredAccidents = bikeRoadsAccidents[idx];

    // zoom in to the segments (on the whole road)
    let bounds = L.latLngBounds();
    roadsPolylines[idx].forEach((polyline) => {
        bounds.extend(polyline.getBounds());
    });
    map.flyToBounds(bounds);

    // show the unselect button
    unselectForm.classList.remove(unselectHidden);

    // update the road description
    const description = roadInfo(data[idx]);
    aboutRoad.innerHTML = description;
    // ..and retrieve the real address
    const [long, latt] = data[idx][ROAD_GEO].paths[0][0];
    getAddress(latt, long).then(({ street, suburb, city }) => {
        const streetName = aboutRoad.querySelector(".bike_road__name");
        streetName.innerHTML = street;
    });

    // highlight selected road
    markRoads(idx);

    // and update all the graphs
    renderSelection();
};

/**
 * Called when the range of visualisation is changed.
 *
 * @param {Number} min min year to use
 * @param {Number} max max year to display
 * @returns nothing
 * @todo implement
 */
const rangeUpdateCallback = (min, max) => {
    // first update the information on the info-panel
    minYearSpan.innerHTML = min;
    maxYearSpan.innerHTML = max;

    // then update the displayed data
    accidents.forEach((a, idx) => {
        const condition = (min <= a[ACC_YEAR] && a[ACC_YEAR] <= max);
        filteredAccidents[idx].by_year = condition;
    });

    // then roads
    roads.forEach((r, idx) => {
        const condition = (min <= r[ROAD_YEAR] && r[ROAD_YEAR] <= max);
        filteredRoads[idx].by_year = condition;
    })

    // finally render
    renderSelection();
};

/**
 * Initialize the scene.
 *
 * Load all data, precompute what can be precomputed, initialize
 * global variables and related event listeners.
 *
 * @param {Boolean} use_clusters (ignored)
 * @returns nothing
 * @todo clusters when zooming in...
 * @todo loading bar? https://loading.io/progress/
 */
const initialize = async (use_clusters = false) => {
    // first, mark the root as loading (to display a nice animation :P )
    document.documentElement.classList.add("loading");

    // initialize the map
    loadingWhat.innerHTML = "initializing map";
    map = initMap();

    // load the accidents data
    loadingWhat.innerHTML = "loading accidents";
    accidents = await loadBikeAccidents();
    accidentsMarkers = initBikeAccident(accidents);
    filteredAccidents = accidents.map((a) => ({"is_loaded": true}));

    // load bike roads
    loadingWhat.innerHTML = "loading bike roads";
    roads = await loadRoads();
    roadsPolylines = initAllRoads(roads);
    filteredRoads = roads.map((r) => ({"is_loaded": true}));

    // initialize the slider on the map (for years)
    const [minYear, maxYear] = minMaxYear(roads);
    initializeSlider(minYear, maxYear, rangeUpdateCallback);

    // finally render everything
    renderSelection();

    // precompute which accident belongs to which road - make sure to call after
    // the initial drawing
    loadingWhat.innerHTML = "precomputing stuff";
    bikeRoadsAccidents = precomputeRoadAccidents(
        map,
        roads,
        roadsPolylines,
        accidents
    );
};

/******************************************************************************
 *                     M A I N   L O G I C
 ******************************************************************************/

// first allow switching to dark mode at any time
document
    .getElementById("app__dark_mode")
    .addEventListener("click", () => switchDarkMode());

// init the dark mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // by default we start with light
    switchDarkMode(true);
}

// initialize everythin
initialize().then(() => {
    loadingWhat.innerHTML = "done";
    console.log("Finisiehd all loading");
    document.documentElement.classList.remove("loading");
    document.documentElement.classList.add("ready");
});

// make the resizer available
const resizer = new Resizer();

// add to map handler for unselecting
unselectForm.addEventListener("click", (e) => {
    e.preventDefault();
    markRoads();
    resetMap(map);
    unselectForm.classList.add(unselectHidden);
    aboutRoad.innerHTML = "";
});

// add a zoom event to the map, TODO: moveend event
map.on("zoomend", () => drawAccidents(accidents, accidentsMarkers, map));
// map.on("moveend", function () {
//     console.log(map.getCenter().toString());
//   });

// sample visualisation - TODO: remove
const margin = { top: 20, right: 0, bottom: 20, left: 20 };
const donut = new DonutChart(500, 500, 100, "#sex");
donut.update(donutData, donutAttr);
const bp = new BarPlotSwitchable(460, 400, margin, "#age");
bp.update(donutData, donutAttr);

var randomI = true;
const change = () => {
    donut.update(randomI ? donutDataB : donutData, donutAttr);
    bp.update(randomI ? donutDataB : donutData, donutAttr);
    randomI = !randomI;
};

// pricina, stav_ridic -- barplot, simple, rotated
// vek_skupina -- donut
// den_v_tydnu, mesic -- https://d3-graph-gallery.com/graph/barplot_button_data_hard.html

// TODO: when deselecting part in checkbox, remove filters in data and then put it back?? or unhighlight everything, or destroy and recompute?
// TODO: initialize dark mode button...