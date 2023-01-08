// url to fetch all data from
const BIKE_ROADS_URL = "https://services6.arcgis.com/fUWVlHWZNxUvTUh8/arcgis/rest/services/cykloopatreni_realizovana_opendata/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";

// fields in the data
const ROAD_LENGTH = "delka";
const ROAD_ID = "ogcfid";
const ROAD_YEAR = "rok_realizace";
const ROAD_TYPE = "typ_opatreni";
const ROAD_GEO = "geometry";


/**
 * Download the road data, do the initialisation and display the roads.
 *
 * Return
 * ------
 *      data,
 *      polyline segments,
 *      min year in data,
 *      max year in data
 **/
const loadRoads = async () => {
    return d3.json(BIKE_ROADS_URL).get((err, data) => {
        if (!data) {
            console.log(`Error parsing data: ${err}`);
            return [];
        }
        else {
            console.log("loaded bike roads");
            const filtered_data = data.features.filter((val) => val[ROAD_GEO]);  // only those with geometry
            const used_data = filtered_data.map((elem) => {
                let attr = elem.attributes;
                attr[ROAD_GEO] = elem.geometry;
                return attr;
            });
            const polys = initAllRoads(used_data);
            const [min, max] = minMaxYear(used_data);
            displayRoads(map, used_data, polys, min, max);
            road_data = used_data; road_pollys = polys; min_year = min; max_year = max;  // TODO: remove
            return [used_data, polys, min, max];
        }
    });
};

const initAllRoads = (data) => {
    /* map each element to a sequence of polylines */
    color = "red"; // temporary
    return data.map((elem, idx) => {
        const polys = elem[ROAD_GEO].paths.map((path) => {
            const coords = path.map((e) => [e[1], e[0]]);  // swap coords to have the correct format
            return L.polyline(coords, {color})
                    .on("click", () => roadClick(idx));
        });
        return polys;
    });
};

/** Find the minimum and maximum year present in the downloaded data **/
const minMaxYear = (data) => {
    let min = Infinity;
    let max = new Date().getFullYear();  // current year
    data.forEach((elem) => {
        min = Math.min(min, elem[ROAD_YEAR]);
        max = Math.max(max, elem[ROAD_YEAR]);
    });
    return [min, max];
};

const displayRoads = (map, data, polys, from, to) => {
    data.forEach((elem, idx) => {
        const keep = from <= elem[ROAD_YEAR] && elem[ROAD_YEAR] <= to;
        polys[idx].forEach(p => keep ? p.addTo(map) : p.remove());
    });
};

const roadInfo = (data, idx) => {
    // TODO: add variations
    // TODO: add styles and markdown
    // TODO: add pictures of the opatreni
    const road = data[idx];
    const streetName = "Random Street";  // TODO: deduc
    return `Bike road ${streetName} was finished in ${road[ROAD_YEAR]}. The length of the segment is ${road[ROAD_LENGTH]}. The specific project is marked as ${road[ROAD_TYPE]}.`;
}

const isOnTheRoad = (road, x, y, delta=1) => {
    return true; // TODO: finish
}

const roadClick = (idx) => {
    // for now just console log, TODO: do sth productive here
    console.log(road_data[idx]);

    // zoom in to the segments
    let bounds = L.latLngBounds();
    road_pollys[idx].forEach((polyline) => {
        bounds.extend(polyline.getBounds());
    });
    map.flyToBounds(bounds); //, {animate: true, duration: 5});

    // TODO: move somewheer else
    const target = document.getElementById("about_road");
    target.innerHTML = roadInfo(road_data, idx);

    // TODO: make it more visible
    road_pollys.forEach((poly, i) => {
        const color = i == idx ? "blue" : "red";
        poly.forEach(p => p.setStyle({color}));
    });
}

/**
 * TODO: loading screen when fetching data
 * color gradient for years?
 * light & dark mode
 * TODO: cluster on zoom in
 */