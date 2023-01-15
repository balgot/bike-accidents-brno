/** loading and manipulation with accidents data **/

// URL to get the data about bike accidents, retrieve all data with all fields
const BIKE_ACCIDENTS_URL = "https://gis.brno.cz/ags1/rest/services/Hosted/Cyklo_nehody/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";

/** fields present in the data **/
const ACC_TIMESTAMP = "datum";  // TODO: convert to local GMT for Czech Republic
const ACC_LOCATION = "nazev";
const ACC_REASON = "pricina";
const ACC_DESCRIPTION = "srazka";
const ACC_GEO = "geometry"
const ACC_BIKER_SEX = "pohlavi";
const ACC_BIKER_HELMET = "ozn_osoba";
const ACC_BIKER_DRUNK = "alkohol";
const ACC_BIKER_AGE = "vek_skupina";
const ACC_YEAR = "rok";
// ... todo: add more relevant fields


/**
 * Load bike accidents data and keep only those with geo info.
 *
 * *NOTE*: the GEO info are {x, y} - the opposite order as longitude
 * and lattitude.
 *
 * @returns data
 *      a list of objects, one per each accident, or null,
 *      if loading failed - see console for error message
 */
const loadBikeAccidents = async () => {
    try {
        // make sure to use d3v5
        const data = await d3.json(BIKE_ACCIDENTS_URL);
        // only those with geometry
        const used = data.features.filter((val) => val[ROAD_GEO]);
        console.log("Loaded bike accidents data:", {used});
        return used;
    }
    catch {
        return null;
    }
};


/**
 * Initialize the markers of the accidents.
 *
 * @param {[Accident]} data
 *      accident data, as loaded by `loadBikeAccidents`
 * @returns markers
 *      list of markers, one per each accidents, with click
 *      events but not bound to anything
 */
const initBikeAccident = (data) => {
    console.assert(data !== null);
    return data.map((accident, idx) => {
        const {x, y} = accident[ACC_GEO];
        const location = [y, x];
        return L.marker(location)
                .bindTooltip(accidentDescription(data[idx]))
                .on("click", (e) => accidentClick(e, data, idx));
    });
}


/**
 * Return a description of the accident with only the most important
 * info.
 *
 * @param {Accident} accident
 * @returns {string} the description
 * @todo translate
 */
const accidentDescription = (accident) => {
    const attrs = accident.attributes;
    return `
    Bike Accident<br/>
    when: ${attrs[ACC_YEAR]}<br/>
    why: ${attrs[ACC_REASON]}<br/>
    what: ${attrs[ACC_DESCRIPTION]}
    `;
}


/**
 * Handle bike accident click.
 *
 * Show a popup for now and log it.
 *
 * @param {[ClickEvent]} event
 *      contains `event.target` that point to the clicked marker
 * @param {[Accident]} data
 *      bike accidents data
 * @param {Number} idx
 *      index to `data` indicating which point was clicked on
 * @returns nothing
 */
const accidentClick = (event, data, idx) => {
    const target = event.target;  // the marker
    target.openTooltip();
};

/**
 * Computed clusters markers on the map.
 */
var _computedClusters = null;


/**
 * Draw accidents data on the map. Based on the map zoom level...
 *
 * @param {[Accident]} data
 *      accidents data as loaded by the `loadBikeAccidents`
 * @param {[L.Marker]} markers
 *      the corresponding markers from `initBikeAccidents`
 * @param {[L.Map]} map
 *      map object to draw data into
 * @param {[bool]} show
 *      for each accident determines whether to show it or not
 *
 * @returns nothing
 */
const drawAccidents = (data, markers, map, show = null) => {
    // first clear everythin
    markers.map(m => m.removeFrom(map));
    _computedClusters?.map(c => c.removeFrom(map));

    if (map.getZoom() < 15) {
        drawClusteredAccidents(data.filter((d, i) => show == null || show[i]), map);
        return;
    }

    data.forEach((accident, idx) => {
        const marker = markers[idx];
        if (show == null || show[idx])
            marker.addTo(map);
        else
            marker.removeFrom(map);
    });
};

/**
 * Draw accidents, but instead of using points, use clusters. *
 *
 * @param {[Accident]} data
 *      accidents data as loaded by the `loadBikeAccidents`
 * @param {[L.Map]} map
 *      map object to draw data into
 * @param {float} stddev
 *      controls how dense a cluster should be
 *
 * @returns nothing
 */
const drawClusteredAccidents = (data, map, stddev=0.7) => {
    const coords = data.map((e) => [e[ACC_GEO].y, e[ACC_GEO].x]);
    const clusters = geocluster(coords, stddev);
    _computedClusters = clusters.map(cluster => {
        const circle = L.circle(cluster.centroid, {
                color: 'blue',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 3 * cluster.elements.length
            });
        circle.addTo(map);
        circle.bindTooltip(`
            Bike Accidents<br/>
            number: ${cluster.elements.length}<br/>
            <br/>
            Zoom-in (or click)<br/>
            to display details
        `)
        .on("click", () => map.flyToBounds(circle.getBounds()));
        return circle;
    });
};
