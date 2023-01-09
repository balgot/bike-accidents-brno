const initMap = () => {
    // create map a center it on top of brno-center
    const map = L.map('map').setView([49.19522, 16.60796], 13);

    // add a layer with data
    // see https://wiki.openstreetmap.org/wiki/Raster_tile_providers for different types of a map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    return map;
};

const initialize = () => {
    // load all the data, create necessary points
    // show loading screen during this
    // initialize global vars
};

const getAddress = async (lattitude, longitude) => {
    /**
     * Get the address of the point using the nominatim service.
     *
     * Arguments
     * =========
     *      latitude: float, WGS84 projection
     *      longitude: float, WGS84 projection
     *
     * Returns
     * =======
     *      object with street, suburb and city as strings
     *      on error, "unknown" values are returned
     *
     * About
     * =====
     *      * API documentation: https://nominatim.org/release-docs/develop/api/Reverse/
     *      * SO example: https://stackoverflow.com/questions/66506483/how-to-get-the-address-from-coordinates-with-open-street-maps-api
     *      * terms of use: https://operations.osmfoundation.org/policies/nominatim/
     *
     * TODO
     * ====
     *      * cache results
     *      * provide a attribution in <About> modal
     *      * something with API limit?
     *      * error handling?
     */
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lattitude}&lon=${longitude}&zoom=17&accept-language=en`;
    const headers = { "User-Agent": "bike-accidents-in-brno" };
    return fetch(url, { headers })
      .then((res) => res.json())
      .then((res) => {
          const street = res.address?.road || "";
          const suburb = res.address?.suburb || "";
          const city = res.address?.city || "";
          return { street, suburb, city };
      });
};

const filter = () => {
    // TODO: better name
    // handle filter events and show only necessary parts
};

const switchDarkMode = () => {
    /**
     * Switch the dark mode.
     *
     * The detection of dark mode is based on the icon in the header.
     * This needs proper initialisation at the start of the script.
     *
     * TODO
     * ====
     *      initialize the icon at the start
     *
     * Inspired by https://webdesign.tutsplus.com/tutorials/color-schemes-with-css-variables-and-javascript--cms-36989.
     */
    const STYLE_TO_DARK = "fa-solid fa-moon";
    const STYLE_TO_LIGHT = "fa-solid fa-sun";
    const switcher = document.getElementById("dark_mode__img");
    const on = switcher.className.includes(STYLE_TO_DARK);

    // change favicon
    document.querySelectorAll("link[rel*='icon']").forEach((e) => e.href = on ? "assets/pics/favicon--dark_mode.ico" : "assets/pics/favicon.ico");

    // modify the button
    switcher.className = on ? STYLE_TO_LIGHT : STYLE_TO_DARK;

    // change the color scheme
    document.documentElement.classList.remove(on ? "light" : "dark");
    document.documentElement.classList.add(on ? "dark" : "light");
};

const handleRoadClick = (whichRoad) => {
    // update stats about the row, render the graphs
};

const handleAccidentClick = (whichPoint) => {
    // display a popup next to the accident with the info
    // POSSIBLY show marks in each graph
    // POSSIBLY some pictures of the place?
};

const handleRest = () => {
    // TODO: better name
    // when the user clicks on the graph, filter out the accidents,
    // and display something to show all of them
};
