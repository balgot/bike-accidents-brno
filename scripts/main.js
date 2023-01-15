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

var DBG = false;
var map; // the map used for visualization

// bike roads data
var roads; // just as downloaded
var selectedRoadIdx = null; // selected road or null
var filteredRoads; // same as `filteredAccidents`
var roadsPolylines;

// accidents data
var accidents; // just as downloaded, well, almost ;)
var filteredAccidents; // filtered & selected, working version, list of objects, keys are reasons for display state, values are bools, true indicating to display
var accidentsMarkers; // markers for each accident, have same length

// array, one entry for each row contains a list of indexes to accidents
var bikeRoadsAccidents;

// var minYear = 0, maxYear = 3000;

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
    selectedRoadIdx = selectedIdx;
};

/**
 * Display the selected data on the map.
 *
 * Filters out bike roads and bike accidents as necessary, does also
 * the highlighting.
 *
 * @note expensive, call rarely
 */
const renderSelection = () => {
    // display all the stuff
    drawAccidents(
        accidents,
        accidentsMarkers,
        map,
        filteredAccidents.map((arr) =>
            Object.values(arr).every((v) => v == true)
        )
    );
    displayRoads(
        map,
        roads,
        roadsPolylines,
        filteredRoads.map((arr) => Object.values(arr).every((v) => v == true))
    );
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
    // filteredAccidents = bikeRoadsAccidents[idx]; // TODO: this is wrong

    // zoom in to the segments (on the whole road)
    let bounds = L.latLngBounds();
    roadsPolylines[idx].forEach((polyline) => {
        bounds.extend(polyline.getBounds());
    });
    map.flyToBounds(bounds);

    // show the unselect button
    unselectForm.classList.remove(unselectHidden);

    // highlight selected road
    markRoads(idx);

    // update text part
    updateText();

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
        const year = a.attributes[ACC_YEAR];
        const condition = min <= year && year <= max;
        filteredAccidents[idx].by_year = condition;
    });

    // then roads
    roads.forEach((r, idx) => {
        // there are two options how to display a road here, either it was built
        // way before the range, or during
        const condition = r[ROAD_YEAR] <= max;
        filteredRoads[idx].by_year = condition;
    });

    // finally render
    renderSelection();
    updateText();
};

/** ... */
const describeBrno = () => {
    const _r = filteredRoads.map(r => Object.values(r).every(v => v == true)).filter(v => v == true);
    const roadsTotal = _r.length;
    const minYear = +minYearSpan.innerHTML;
    console.log({ minYear });
    const roadsBuild = _r.filter((v, idx) => roads[idx][ROAD_YEAR] >= minYear).length;
    const accCount = filteredAccidents.map(r => Object.values(r).every(v => v == true)).filter(a => a == true).length;

    return `
        <p class="road_info">
            During the selected time period, there were
            as many as <em>${roadsBuild} new bike roads built</em>
            (totalling to <em>${roadsTotal}</em> bike roads in total).

            At the same time, <em>${accCount}</em> accidents were registred.
            View the more specific statistics below.
        </p>
    `;
}

const updateDescription = () => {
    if (selectedRoadIdx == null)
        aboutRoad.innerHTML = describeBrno();
    else {
        const description = roadInfo(roads[selectedRoadIdx]);
        aboutRoad.innerHTML = description;
        // ..and retrieve the real address
        const [long, latt] = roads[selectedRoadIdx][ROAD_GEO].paths[0][0];
        getAddress(latt, long).then(({ street, suburb, city }) => {
            const streetName = aboutRoad.querySelector(".bike_road__name");
            if (streetName)
                streetName.innerHTML = street;
        });
    }
}

/* TODO */
const updateText = () => {
    // first decide on the generic Brno description or describe the selected
    // road...
    updateDescription();

    // then update each chart, namely:

    // 1) cummulative of accidents and bike roads length
    // 2) some text within, like about sex and stuff
    // 3) ...
}

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
    filteredAccidents = accidents.map((a) => ({ is_loaded: true }));

    // load bike roads
    loadingWhat.innerHTML = "loading bike roads";
    roads = await loadRoads();
    roadsPolylines = initAllRoads(roads);
    filteredRoads = roads.map((r) => ({ is_loaded: true }));

    // initialize the slider on the map (for years)
    loadingWhat.innerHTML = "precomputing stuff";
    const [minYear, maxYear] = minMaxYear(roads);
    initializeSlider(minYear, maxYear, rangeUpdateCallback);

    // finally render everything
    loadingWhat.innerHTML = "initial render";
    renderSelection();
    updateText();

    // precompute which accident belongs to which road
    // make sure to call after the initial drawing!!
    loadingWhat.innerHTML = "precomputing more stuff";
    bikeRoadsAccidents = precomputeRoadAccidents(
        map,
        roads,
        roadsPolylines,
        accidents
    );

    // add to map handler for unselecting
    unselectForm.addEventListener("click", (e) => {
        e.preventDefault();
        markRoads();
        resetMap(map);
        unselectForm.classList.add(unselectHidden);
        updateDescription();
    });

    // when the map gets resized, redraw accidents (potentially use clusters)
    map.on("zoomend", () => renderSelection());

    // we are done with loading
    loadingWhat.innerHTML = "done";
    console.log("Finished all loading");
    document.documentElement.classList.remove("loading");
    document.documentElement.classList.add("ready");

    // DEMO stuff
    const donut = new DonutChart(500, 500, 100, "#sex");
    const ddData = accidents.map((a) => ({
        what: a.attributes[ACC_DESCRIPTION],
    }));
    console.log(ddData);
    donut.update(ddData, "what");
    // donut.update(donutData, donutAttr);

    // sample visualisation - TODO: remove
    const margin = { top: 20, right: 20, bottom: 20, left: 50 };

    const bp = new BarPlotSwitchable(460, 400, margin, "#age");
    bp.update(donutData, donutAttr);

    var randomI = true;
    const change = () => {
        // donut.update(randomI ? donutDataB : donutData, donutAttr);
        bp.update(randomI ? donutDataB : donutData, donutAttr);
        randomI = !randomI;
    };

    const line = new LinePlotAccidents(500, 500, margin, "#linechart");
    var data1 = [
        { ser1: 0.3, ser2: 4, cum: 1 },
        { ser1: 2, ser2: 16, cum: 3 },
        { ser1: 3, ser2: 8, cum: 10 },
    ];

    var data2 = [
        { ser1: 1, ser2: 7, cum: 5 },
        { ser1: 4, ser2: 1, cum: 7 },
        { ser1: 6, ser2: 8, cum: 7.5 },
    ];
    line.update(data1);
    var one = true;
    const ch = () => {
        line.update(one ? data2 : data1);
        one = !one;
    };
};

/******************************************************************************
 *                     M A I N   L O G I C
 ******************************************************************************/

// first allow switching to dark mode at any time
initDarkMode(
    "app__dark_mode",
    "dark_mode__img",
    "assets/pics/favicon.ico",
    "assets/pics/favicon--dark_mode.ico"
);

// initialize everythin
initialize();

// make the resizer available
const resizer = new Resizer();
