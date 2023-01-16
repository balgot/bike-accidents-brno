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

// graphs
var gLineAccidentsCum;
var gMonth;
var gSex;
var gAge;
var minYear = 0,
    maxYear = 3000;

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
 */
const rangeUpdateCallback = (min, max) => {
    // first update the information on the info-panel
    minYearSpan.innerHTML = min;
    maxYearSpan.innerHTML = max;
    minYear = min;
    maxYear = max;

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
    const _r = filteredRoads
        .map((r) => Object.values(r).every((v) => v == true))
        .filter((v) => v == true);
    const roadsTotal = _r.length;
    const minYear = +minYearSpan.innerHTML;
    const roadsBuild = _r.filter(
        (v, idx) => roads[idx][ROAD_YEAR] >= minYear
    ).length;
    const accCount = filteredAccidents
        .map((r) => Object.values(r).every((v) => v == true))
        .filter((a) => a == true).length;

    return `
        <p class="road_info">
            During the selected time period, there were
            as many as <em>${roadsBuild} new bike roads built</em>
            (totalling to <em>${roadsTotal}</em> bike roads in total).

            At the same time, <em>${accCount}</em> accidents were registred.
            View the more specific statistics below.
        </p>
    `;
};

const updateDescription = () => {
    if (selectedRoadIdx == null) aboutRoad.innerHTML = describeBrno();
    else {
        const description = roadInfo(roads[selectedRoadIdx]);
        aboutRoad.innerHTML = description;
        // ..and retrieve the real address
        const [long, latt] = roads[selectedRoadIdx][ROAD_GEO].paths[0][0];
        getAddress(latt, long).then(({ street, suburb, city }) => {
            const streetName = aboutRoad.querySelector(".bike_road__name");
            if (streetName) streetName.innerHTML = street;
        });
    }
};

findCounts = (values) => {
    const occurrences = values.reduce(
        (acc, curr) => (acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc),
        {}
    ); // what: how many
    return Object.keys(occurrences).map((key) => [
        Number(key),
        occurrences[key],
    ]);
};

/**
 * Update the part of the screen that displays the whole text.
 *
 * Update the description of the place, all texts and graphs.
 */
const updateText = () => {
    // first decide (Brno description, road description)
    updateDescription();

    // then update each chart, namely:

    // 1) cummulative of accidents and bike roads length
    // 1.a) prepare accidents on the selection
    const acc = accidents.filter(
        (_, idx) =>
            Object.values(filteredAccidents[idx]).every((v) => v == true) &&
            (selectedRoadIdx == null ||
                bikeRoadsAccidents[selectedRoadIdx].includes(idx))
    );
    const years = acc.map((a) => a.attributes[ACC_YEAR]);
    const yearData = findCounts(years).sort((a, b) => a[0] - b[0]);

    // 1.b) prepare roads
    const ro =
        selectedRoadIdx == null
            ? roads.filter((_, idx) =>
                  Object.values(filteredRoads[idx]).every((v) => v == true)
              )
            : [roads[selectedRoadIdx]];
    let lengths = {};
    ro.forEach(
        (r) =>
            (lengths[r[ROAD_YEAR]] =
                (lengths[r[ROAD_YEAR]] || 0) + r[ROAD_LENGTH])
    );

    // 1.c) cummulative lengths
    let cumLengths = {};
    for (let i = minYear; i <= maxYear; i++) {
        cumLengths[i] = (lengths[i] || 0) + (cumLengths[i - 1] || 0);
    }

    let data = {};
    Object.keys(cumLengths).forEach(
        (k) => (data[k] = { cumLength: cumLengths[k] })
    );
    yearData.forEach(([year, count]) => (data[year].accidents = count));

    const finalData = Object.keys(data).map((k) => {
        let entries = data[k];
        entries.accidents = entries.accidents || 0;
        entries.year = k;
        return entries;
    });
    gLineAccidentsCum.update(finalData, "year", "accidents", "cumLength");

    // 1.5) update line chart description
    const lpBefore = `
        The evolution of accidents and the total length of bike roads
        during the selected year span is as follows (left axis and lineplot
        denote accidents counts in a particular year, right axis and shaded
        area is the cummulative, i.e. total, length of bike roads at any
        given year).`;
    document.getElementById("lineChart--before").innerHTML = lpBefore;
    const lpAfter = `
        (Note that while the accidents count is incresing, it is not
        possible to deduce anything as during these years, the total
        number of bikers increased as well.).`;
    document.getElementById("lineChart--after").innerHTML = lpAfter;

    // 2) update other graphs
    const attribs = acc.map(a => a.attributes);
    gMonth.update(attribs, ACC_MONTH);
    gSex.update(attribs.filter(a => a[ACC_BIKER_SEX]), ACC_BIKER_SEX);
    gAge.update(attribs.filter(a => a[ACC_BIKER_AGE]), ACC_BIKER_AGE);

    if (attribs.length) {
        document.getElementById("month--before").innerHTML = `
            The months in which the accident happened across all
            years (note the difference summer - winter).
        `;
        document.getElementById("sex--before").innerHTML = `
            The distribution of sex (only records with valid value
            are displayed).
        `;
        document.getElementById("age--before").innerHTML = `
            The age distribution:
        `;
    } else {
        for (const _id of ["month--before", "sex--before", "age--before"]) {
            document.getElementById(_id).innerHTML = "No accidents to show";
        }
    }
};

/**
 * Initialize the scene.
 *
 * Load all data, precompute what can be precomputed, initialize
 * global variables and related event listeners.
 *
 * @param {Boolean} use_clusters (ignored)
 * @returns nothing
 * @idea loading bar? https://loading.io/progress/
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

    // create the graphs..
    const margin = { top: 20, right: 20, bottom: 20, left: 50 };
    gLineAccidentsCum = new LinePlotAccidents(500, 500, margin, "#linechart");
    gMonth = new BarPlotSwitchable(500, 500, margin, "#month");
    gAge = new BarPlotSwitchable(500, 500, margin, "#age", (a, b) => {
        const _a = +a[0].match(/\b\d+/)[0];
        const _b = +b[0].match(/\b\d+/)[0];
        return _a - _b;
    });
    gSex = new DonutChart(500, 500, margin.left, "#sex");

    // initialize the slider on the map (for years) [needs graphs]
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
        updateText();
    });

    // when the map gets resized, redraw accidents (potentially use clusters)
    map.on("zoomend", () => renderSelection());

    // we are done with loading
    loadingWhat.innerHTML = "done";
    console.log("Finished all loading");
    document.documentElement.classList.remove("loading");
    document.documentElement.classList.add("ready");
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
