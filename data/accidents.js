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

/** stores the accidents data **/
var data_accidents;

/** load the data as soon as the page is loaded **/
d3.json(BIKE_ACCIDENTS_URL).get((err, data) => {
    if (!data) {
        console.log(`Error parsing accidents data: ${err}`);
        return;
    }

    // filter only the data that have the geometry set for vizualisation
    const d = data.features.filter((val) => val[ROAD_GEO]);

    // for debugging, take only first 10 records, TODO: remove
    data_accidents = d.slice(0, 10);

    // restructure the data
    /*data_accidents = {
        ACC_GEO: d.map((e) => e[ACC_GEO].paths),
        ACC_TIMESTAMP: d.map((e) => e.attributes[ACC_TIMESTAMP]),
        ACC_LOCATION: d.map((e) => e.attributes[ACC_LOCATION]),
        ACC_REASON: d.map((e) => e[ACC_REASON]),
        ACC_DESCRIPTION: d.map((e) => e[ACC_DESCRIPTION]),
        ACC_BIKER_AGE: d.map((e) => e[ACC_BIKER_AGE]),
        ACC_BIKER_DRUNK: d.map((e) => e[ACC_BIKER_DRUNK]),
        ACC_BIKER_HELMET: d.map((e) => e[ACC_BIKER_HELMET]),
        ACC_BIKER_SEX: d.map((e) => e[ACC_BIKER_SEX]),
    };*/
    draw_accidents();
    drawPieChart(d3.select("#piechart"), data_accidents, ACC_BIKER_AGE);
});

const draw_accidents = () => {
    data_accidents.forEach((e) => {
        const {x, y} = e[ACC_GEO];
        const loc = [y, x];
        console.log(loc);

        L.marker(loc)
         .on("mouseover", () => console.log(e))
         .addTo(map);
    });
};

// TODO: cluster <or> show accidents only after the road is selected