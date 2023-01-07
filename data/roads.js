const loadRoads = () => {
    return d3.json(BIKE_ROADS_URL).get((err, data) => {
        if (!data) {
            console.log(`Error parsing data: ${err}`);
        }
        else {
            const d = data.features.filter((val) => val[ROAD_GEO]);  // only those with geometry
            /*
            data_bike_roads = {
                ROAD_ID: d.map((e) => e.attributes[ROAD_ID]),
                ROAD_LENGTH: d.map((e) => e.attributes[ROAD_LENGTH]),
                ROAD_TYPE: d.map((e) => e.attributes[ROAD_TYPE]),
                ROAD_GEO: d.map((e) => e[ROAD_GEO].paths),
            }
            */
            return d;
        }
    });
};

const initAllRoads = (data) => {
    /* map each element to a sequence of polylines */
    return data.map((elem) => {
        const polys = elem[ROAD_GEO].paths.map((path, idx) => {
            const coords = path.map((e) => [e[1], e[0]]);  // swap coords to have the correct format
            return L.polyline(coords, {color})
                    .on("mouseover", () => console.log(elem));  // TODO: temporarily display the clicked road
        });
        return polys;
    });
};

const minMaxYear = (data) => {
    return [0, 0];
};

const displayRoads = (map, data, polys, from, to) => {
    data.forEach((elem, idx) => {
        const keep = from <= elem[ROAD_YEAR] && elem[ROAD_YEAR] <= to;
        polys[idx].forEach(p => keep ? p.addTo(map) : p.remove());
    });
};

const roadInfo = (data, idx) => {
    const road = data[idx];
    return `${road}`;
}

const isOnTheRoad = (road, x, y, delta=1) => {
    return true; // TODO: finish
}

/**
 * TODO: loading screen when fetching data
 * color gradient for years?
 * light & dark mode
 */