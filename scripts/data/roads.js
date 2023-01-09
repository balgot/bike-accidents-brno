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
        // only those with geometry
        const filtered_data = data.features.filter((val) => val[ROAD_GEO]);
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
    return data.map((elem, idx) => {
        return elem[ROAD_GEO].paths.map((path) => {
            const coords = path.map((e) => [e[1], e[0]]);
            return L.polyline(coords, {color})
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
 * Display only the roads in the given year span.
 *
 * @param {L.Map} map
 *      map to which the roads should be drawn
 * @param {[BikeRoad]} data
 *      bike road data
 * @param {[[L.Poyline]]} polys
 *      the corresponding polylines
 * @param {Number} from
 *      min year to include
 * @param {Number} to
 *      max year to include
 *
 * @returns nothing
 */
const displayRoads = (map, data, polys, from, to) => {
    data.forEach((elem, idx) => {
        const keep = from <= elem[ROAD_YEAR] && elem[ROAD_YEAR] <= to;
        polys[idx].forEach(p => keep ? p.addTo(map) : p.removeFrom(map));
    });
};


/**
 * Describe the given bike road.
 *
 * @param {BikeRoad} road
 *      bike road to describe
 * @returns {[String, String]}
 *      the description with the address
 *
 * @todo add more options, variations
 * @idea add pictures of how it might look like?
 */
const roadInfo = (road) => {
    const streetName = "Random Street";  // TODO: deduce, see common.js
    const year = road[ROAD_YEAR];
    const len = road[ROAD_LENGTH];
    const _type = road[ROAD_TYPE];  // TODO: translate
    const options = [
        `
        <p class="bike_road">
            Bike Road <span class="bike_road__name">${streetName}</span>
            was finished in <span class="bike_road__year">${year}</span>.
            The length of the segment is
            <span class="bike_road__length">${len}</span>.
            The project was: <span class="bike_road__project">${_type}</span>.
        </p>
        `
    ];
    return options[Math.floor(Math.random() * options.length)];
}


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
    const segment = event.target;  // which polyline

    // for now just console log, TODO: do sth productive here, like filtering
    console.log(`Road ${idx}: ${data[idx]}`);

    // zoom in to the segments
    let bounds = L.latLngBounds();
    road_pollys[idx].forEach((polyline) => {
        bounds.extend(polyline.getBounds());
    });
    map.flyToBounds(bounds);

    // TODO: move somewheer else
    const target = document.getElementById("about_road");
    target.innerHTML = roadInfo(data, idx);

    // TODO: make it more visible
    road_pollys.forEach((poly, i) => {
        const color = i == idx ? "blue" : "red";
        poly.forEach(p => p.setStyle({color}));
    });
}

/**
 * color gradient for years?
 * TODO: cluster on zoom in
 */