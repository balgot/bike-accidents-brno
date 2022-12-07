const BIKE_ACCIDENTS_URL = "https://gis.brno.cz/ags1/rest/services/Hosted/Cyklo_nehody/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";
const BIKE_ACCIDENTS = "/public/data/bike_accidents.json";


var data_accidents;
const ACC_TIMESTAMP = "datum";  // todo-convert to local GMT for Czech Republic
const ACC_LOCATION = "nazev";
const ACC_REASON = "pricina";
const ACC_DESCRIPTION = "srazka";
const ACC_GEO = "geometry"

const ACC_BIKER_SEX = "pohlavi";
const ACC_BIKER_HELMET = "ozn_osoba";
const ACC_BIKER_DRUNK = "alkohol";
const ACC_BIKER_AGE = "vek_skupina";
// ...


d3.json(BIKE_ACCIDENTS_URL).get((err, data) => {
    if (!data) {
        console.log(`Error parsing data: ${err}`);
    }
    else {
        console.log(data);
        const d = data.features.filter((val) => val[ROAD_GEO]);  // only those with geometry
        data_accidents = d;//.slice(0, 10);
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
    }
});

var xx;
const draw_accidents = (stddev=0.7) => {
    const coords = data_accidents.map((e) => [e[ACC_GEO].y, e[ACC_GEO].x]);
    console.log("Coords:", coords);
    const clusters = geocluster(coords, stddev);
    clusters.forEach(cluster => {
        L.circle(cluster.centroid, {
                color: 'blue',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 3 * cluster.elements.length
            }).addTo(map);
    });

    /*data_accidents.forEach((e) => {
        const {x, y} = e[ACC_GEO];
        const loc = [y, x];
        console.log(loc);

        L.marker(loc)
         .on("mouseover", () => console.log(e))
         .on("click", () => {
            const target = d3.select("#selected");
            console.log(target);
            target.nodes()[0].innerHTML = `<code>${JSON.stringify(e.attributes)}</code>`;
            console.log(e);
            xx = target.nodes()[0];
         })
         .addTo(map);
    });*/
};

// TODO: cluster <or> show accidents only after the road is selected