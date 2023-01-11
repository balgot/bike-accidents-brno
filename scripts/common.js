const BrnoPosition = [49.19522, 16.60796];
const MAP_ZOOM = 13;

/**
 * Initialize the Leaflet map.
 *
 * @returns {L.Map}
 *      the map centered to Brno
 *
 * @notes different types of maps:
 *      https://wiki.openstreetmap.org/wiki/Raster_tile_providers
 */
const initMap = () => {
    const map = L.map("map").setView(BrnoPosition, MAP_ZOOM);

    // add a layer with data
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return map;
};

/**
 * Reset the map view.
 *
 * @param {L.map} map
 * @returns nothing
 */
const resetMap = (map) => map.flyTo(BrnoPosition, MAP_ZOOM);

/**
 * Get the address of the point using the *nominatim* service.
 *
 * @param {Number} lattitude WGS84 projection
 * @param {Number} longitude WGS84 projection
 * @returns {Promise<{street: String, suburb: String, city: String}>}
 *      object with street, suburb and city as strings
 *      on error, "unknown" values are returned
 *
 * @see
 *      * API documentation: https://nominatim.org/release-docs/develop/api/Reverse/
 *      * SO example: https://stackoverflow.com/questions/66506483/how-to-get-the-address-from-coordinates-with-open-street-maps-api
 *      * terms of use: https://operations.osmfoundation.org/policies/nominatim/
 *
 * @todo
 *      * cache results
 *      * provide a attribution in <About> modal
 *      * something with API limit?
 *      * error handling?
 */
const getAddress = (lattitude, longitude) => {
    if (DBG)
        return new Promise((res, rej) => ({
            street: "Debug Street",
            suburb: "Debug I.",
            city: "Debug City",
        }));
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lattitude}&lon=${longitude}&zoom=17&accept-language=en`;
    const headers = { "User-Agent": "bike-accidents-in-brno" };
    return fetch(url, { headers })
        .then((res) => res.json())
        .then((res) => {
            console.log("getAddress", res);
            const street = res.address?.road || "";
            const suburb = res.address?.suburb || "";
            const city = res.address?.city || "";
            return { street, suburb, city };
        });
};

/**
 * Precompute the accidents for each bike roads.
 *
 * @param {L.map} map
 *      the map on which the data are to be displayed
 * @param {[BikeRoad]} bike_data
 *      bike roads data
 * @param {[[L.polyline]]} bike_polys
 *      polylines corresponding to the bike roads
 * @param {[Accident]} accidents_data
 *      accidents data
 * @returns distances
 *      2d array of indices, each row corresponds to one bike road
 *      and contains the accidents that happened in its proximity
 *
 * @note goes over all pairs of roads and accident -- pretty slow
 */
const precomputeRoadAccidents = (
    map,
    bike_data,
    bike_polys,
    accidents_data
) => {
    const REQUIRED_MAX_DIST = 25; // empirically chosen, metres
    return bike_data.map((road, idx) => {
        const polys = bike_polys[idx];
        return accidents_data
            .map((acc, i) => [acc, i])
            .filter(([acc, i]) => {
                const accLocation = L.latLng([acc[ACC_GEO].y, acc[ACC_GEO].x]);
                const accLocationPX = map.latLngToLayerPoint(accLocation);
                const closePoints = polys
                    .map((p) => p.closestLayerPoint(accLocationPX))
                    .filter((p) => !!p);
                if (!closePoints.length) return false;
                const closePoint = closePoints.reduce((a, b) =>
                    a.distance <= b.distance ? a : b
                );
                if (!closePoint) return false; // nulll TODO?
                const polyLocation = map.layerPointToLatLng(closePoint);
                const realDist = accLocation.distanceTo(polyLocation);
                return realDist <= REQUIRED_MAX_DIST;
            })
            .map(([acc, i]) => i);
    });
};

/**
 * Switch the dark mode.
 *
 * The detection of dark mode is based on the icon in the header.
 * This needs proper initialisation at the start of the script.
 *
 * @param {Boolean} forceOn if set, forces the state
 * @note initialize the icon at the start
 * @link https://webdesign.tutsplus.com/tutorials/color-schemes-with-css-variables-and-javascript--cms-36989.
 */
const switchDarkMode = (forceOn = null) => {
    const STYLE_TO_DARK = "fa-solid fa-moon";
    const STYLE_TO_LIGHT = "fa-solid fa-sun";
    const switcher = document.getElementById("dark_mode__img");
    const turnDMOn =
        forceOn != null ? forceOn : switcher.className.includes(STYLE_TO_DARK);

    // change favicon
    document
        .querySelectorAll("link[rel*='icon']")
        .forEach(
            (e) =>
                (e.href = turnDMOn
                    ? "assets/pics/favicon--dark_mode.ico"
                    : "assets/pics/favicon.ico")
        );

    // modify the button
    switcher.className = turnDMOn ? STYLE_TO_LIGHT : STYLE_TO_DARK;

    // change the color scheme
    document.documentElement.classList.remove(turnDMOn ? "light" : "dark");
    document.documentElement.classList.add(turnDMOn ? "dark" : "light");
};
