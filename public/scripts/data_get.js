const BIKE_ROADS_URL = "https://services6.arcgis.com/fUWVlHWZNxUvTUh8/arcgis/rest/services/cykloopatreni_realizovana_opendata/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";
const BIKE_ACCIDENTS_URL = "https://gis.brno.cz/ags1/rest/services/Hosted/Cyklo_nehody/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";

const BIKE_ROADS = "/public/data/bike_roads.json";
const BIKE_ACCIDENTS = "/public/data/bike_accidents.json";


var data_bike_roads;
const ROAD_LENGTH = "delka";
const ROAD_ID = "ogcfid";
const ROAD_YEAR = "rok_realizace";
const ROAD_TYPE = "typ_opatreni";
const ROAD_GEO = "geometry";


d3.json(BIKE_ROADS).get((err, data) => {
    if (!data) {
        console.log(`Error parsing data: ${err}`);
    }
    else {
        const d = data.features.filter((val) => val[ROAD_GEO]);  // only those with geometry
        // console.log(d);
        data_bike_roads = d;
        /*data_bike_roads = {
            ROAD_ID: d.map((e) => e.attributes[ROAD_ID]),
            ROAD_LENGTH: d.map((e) => e.attributes[ROAD_LENGTH]),
            ROAD_TYPE: d.map((e) => e.attributes[ROAD_TYPE]),
            ROAD_GEO: d.map((e) => e[ROAD_GEO].paths),
        }*/

        draw_road();
    }
});


var last;
const draw_road = () => {
    console.log("map", map);
    // draw all the lines
    data_bike_roads.forEach((e) => {
        let color = "red";
        if (e[ROAD_GEO].paths.length > 1) {
            console.log("Long", e);
            color = "blue";
        }
        e[ROAD_GEO].paths.map((p, idx) => {
            const coords = p.map((e) => [e[1], e[0]]);
            last = L.polyline(coords, {color})
                .on("mouseover", () => {
                    console.log("idx", idx, e);
                })
                .addTo(map);
        });
    });
};