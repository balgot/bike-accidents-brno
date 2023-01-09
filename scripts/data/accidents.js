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
    return d3.json(BIKE_ACCIDENTS_URL).get((err, data) => {
        if (!data) {
            console.log("Error parsing accidents data:", err);
            return null;
        }
        else {
            const d = data.features.filter((val) => val[ROAD_GEO]);  // only those with geometry
            console.log("loaded bike data");
            // bike_data = d; // TODO: remove
            // drawAccidents(d.slice(0, 10), map); // todo: remove
            // drawClusteredAccidents(d.slice(0, 10));
            return d;
        }
    });
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
                .on("click", (e) => accidentClick(e, data, idx));
    });
}


const accidentClick = (event, data, idx) => {
    const target = event.target;  // the marker
    console.log(event);
    // target.bindTooltip("my tooltip text").openTooltip();
    // target.attr({color: "red"});
    console.log(`Accident click:`, target, idx);
};


/**
 * Draw accidents data on the map.
 *
 * @param {[Accident]} data
 *      accidents data as loaded by the `loadBikeAccidents`
 * @param {[L.Marker]} markers
 *      the corresponding markers from `initBikeAccidents`
 * @param {[L.Map]} map
 *      map object to draw data into
 * @param {(Accident, Marker) => bool} doShowFn
 *      null or callable `(accident, marker) -> bool`
 *
 * @returns nothing
 */
const drawAccidents = (data, markers, map, doShowFn = null) => {
    const show = (accident, marker) => (doShowFn == null ? true : doShowFn(accident, marker));
    data.forEach((accident, idx) => {
        const marker = markers[idx];
        if (show(accident, marker))
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
 *
 * TODO
 * ====
 *      hide clusters when zooming-in or out
 */
const drawClusteredAccidents = (data, map, stddev=0.7) => {
    const coords = data.map((e) => [e[ACC_GEO].y, e[ACC_GEO].x]);
    const clusters = geocluster(coords, stddev);
    clusters.forEach(cluster => {
        L.circle(cluster.centroid, {
                color: 'blue',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 3 * cluster.elements.length
            }).addTo(map);
    });
};
