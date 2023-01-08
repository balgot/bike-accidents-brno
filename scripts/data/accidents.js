/** loading and manipulation with accidents data **/

/** URL to get the data about bike accidents, retrieve all data with all fields **/
const BIKE_ACCIDENTS_URL = "https://gis.brno.cz/ags1/rest/services/Hosted/Cyklo_nehody/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";

/** fields present in the data **/
const ACC_TIMESTAMP = "datum";  // todo-convert to local GMT for Czech Republic
const ACC_LOCATION = "nazev";
const ACC_REASON = "pricina";
const ACC_DESCRIPTION = "srazka";
const ACC_GEO = "geometry"
const ACC_BIKER_SEX = "pohlavi";
const ACC_BIKER_HELMET = "ozn_osoba";
const ACC_BIKER_DRUNK = "alkohol";
const ACC_BIKER_AGE = "vek_skupina";
// ... todo: add more relevant fields

const loadBikeAccidents = async () => {
    return d3.json(BIKE_ACCIDENTS_URL).get((err, data) => {
        if (!data) {
            console.log(`Error parsing data: ${err}`);
        }
        else {
            const d = data.features.filter((val) => val[ROAD_GEO]);  // only those with geometry
            console.log("loaded bike data");
            bike_data = d; // TODO: remove
            drawClusteredAccidents(d);
            return d;
        }
    });
};

const drawAccidents = (data) => {
    data.forEach((e) => {
        const {x, y} = e[ACC_GEO];
        const loc = [y, x];

        L.marker(loc)
         .on("mouseover", () => console.log(e))
         .addTo(map);
    });
};

const drawClusteredAccidents = (data, stddev=0.7) => {
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
