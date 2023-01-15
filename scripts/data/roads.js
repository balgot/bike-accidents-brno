// url to fetch all data from
const BIKE_ROADS_URL = "https://services6.arcgis.com/fUWVlHWZNxUvTUh8/arcgis/rest/services/cykloopatreni_realizovana_opendata/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";

// fields in the data
const ROAD_LENGTH = "delka";
const ROAD_ID = "ogcfid";
const ROAD_YEAR = "rok_realizace";
const ROAD_TYPE = "typ_opatreni";
const ROAD_GEO = "geometry";


/**
 * Download the road data.
 *
 * @returns data
 *      loaded data, a list of records, or null, if an error occured
 */
const loadRoads = async () => {
    try {
        // make sure to use d3v5
        const data = await d3.json(BIKE_ROADS_URL);
        // only those with geometry and valid year
        const filtered_data = data.features.filter((val) => (val[ROAD_GEO] && val.attributes[ROAD_YEAR]));
        // preprocess a bit
        const used = filtered_data.map((elem) => {
            let attr = elem.attributes;
            attr[ROAD_GEO] = elem.geometry;
            return attr;
        });
        console.log("Loaded bike roads data:", {used});
        return used;
    }
    catch {
        return null;
    }
};

/**
 * Create the polylines for each Bike Road.
 *
 * @param {[BikeRoad]} data
 *      bike roads data as loaded by `loadRoads`
 * @returns polylines
 *      2d list of polylines, each record hold a list of polylines
 *      for the corresponding BikeRoad, the click event emmited
 *      i.e. `roadClick` accepts the index to `data`
 */
const initAllRoads = (data) => {
    const color = "red"; // TODO: temporary, do something with this
    const renderer = L.canvas({ padding: 0.5, tolerance: 10 });
    return data.map((elem, idx) => {
        return elem[ROAD_GEO].paths.map((path) => {
            const coords = path.map((e) => [e[1], e[0]]);
            return L.polyline(coords, {color, renderer })
                    .on("click", (e) => roadClick(e, data, idx));
        });
    });
};


/**
 * Find the minimum and maximum year present in the downloaded data
 *
 * @param {[BikeRoad]} data
 *      bike roads data as loaded by `loadRoads`
 * @returns {[Number, Number]} [minYear, maxYear]
 *      tuple with min and maxYear present in the data
 */
const minMaxYear = (data) => {
    const thisYear = new Date().getFullYear();
    // console.log("Min Year IS");
    // console.log(data.reduce((p, e) => Math.min(p, e[ROAD_YEAR])));
    // data.forEach((d) => console.log(d[ROAD_YEAR]));
    return data.reduce(([min, max], road) => [
        Math.min(min, road[ROAD_YEAR]),
        Math.max(max, road[ROAD_YEAR]),
    ], [thisYear, 0]);
    // let min = Infinity;
    // let max = new Date().getFullYear();  // current year
    // data.forEach((elem) => {
    //     min = Math.min(min, elem[ROAD_YEAR]);
    //     max = Math.max(max, elem[ROAD_YEAR]);
    // });
    // return [min, max];
};

/**
 * Display only the roads by their index.
 *
 * @param {L.Map} map
 *      map to which the roads should be drawn
 * @param {[BikeRoad]} data
 *      bike road data
 * @param {[[L.Poyline]]} polys
 *      the corresponding polylines
 * @param {Array[Boolean]} flag
 *      whether to display any particular road
 *
 * @returns nothing
 */
const displayRoads = (map, data, polys, flag) => {
    data.forEach((elem, idx) => {
        const keep = flag[idx];
        polys[idx].forEach(p => keep ? p.addTo(map) : p.removeFrom(map));
    });
};


/**
 * Describe the given bike road.
 *
 * @param {BikeRoad} road
 *      bike road to describe
 * @returns {String}
 *      the description
 *
 * @note the street name is not filled in
 * @todo add more options, variations
 * @idea add pictures of how it might look like?
 */
const roadInfo = (road) => {
    const year = road[ROAD_YEAR];
    const len = road[ROAD_LENGTH];
    const _type = road[ROAD_TYPE];
    const options = [
        `
        <p class="bike_road">
            Bike Road <span class="bike_road__name"></span>
            was finished in <span class="bike_road__year">${year}</span>.
            The length of the segment is
            <span class="bike_road__length">${len}</span> metres.
            The project was:
            <span class="bike_road__project">${translate(_type)}</span>.
        </p>
        `
    ];
    return options[Math.floor(Math.random() * options.length)];
}
