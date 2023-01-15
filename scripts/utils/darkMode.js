/** dark mode related stuff **/

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
const switchDarkMode = (imgId, lightIco, darkIco, forceOn = null) => {
    const STYLE_TO_DARK = "fa-solid fa-moon";
    const STYLE_TO_LIGHT = "fa-solid fa-sun";
    const switcher = document.getElementById(imgId);
    const turnDMOn =
        forceOn != null ? forceOn : switcher.className.includes(STYLE_TO_DARK);

    // change favicon
    document
        .querySelectorAll("link[rel*='icon']")
        .forEach((e) => (e.href = turnDMOn ? darkIco : lightIco));

    // modify the button
    switcher.className = turnDMOn ? STYLE_TO_LIGHT : STYLE_TO_DARK;

    // change the color scheme
    document.documentElement.classList.remove(turnDMOn ? "light" : "dark");
    document.documentElement.classList.add(turnDMOn ? "dark" : "light");
};

/**
 * Initialize the dark mode.
 *
 * @param {String} btnId id of button for switching dark mode
 * @param {String} iconId the icon on the button
 * @param {String} lightIco favicon for light mode
 * @param {String} darkIco favicon for dark mode
 */
const initDarkMode = (btnId, iconId, lightIco, darkIco) => {
    const fn = (on = null) => switchDarkMode(iconId, lightIco, darkIco, on);
    const DARK = "(prefers-color-scheme: dark)";
    const media = window.matchMedia;

    document.getElementById(btnId).addEventListener("click", () => fn());
    if (media && media(DARK).matches) {
        fn(true); // by default we start with light
    }
};
