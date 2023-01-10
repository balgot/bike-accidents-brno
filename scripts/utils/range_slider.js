/* inspired by https://w3collective.com/double-range-slider-html-css-js/ */

// the element that displays the selected range
const range = document.querySelector(".range-selected");
const rangeInputs = document.querySelectorAll(".range-input input");
const rangePrices = document.querySelectorAll(".range-price input");

/**
 * TODO
 * @param {*} a
 * @param {*} b
 * @param {*} callback
 * @note messy
 */
const rangeUpdate = (a, b, callback) => {
    console.log("RangeUpdate", { a, b });
    const boundA = parseInt(a) || parseInt(rangePrices[0].value);
    const boundB = parseInt(b) || parseInt(rangePrices[1].value);

    if (
        boundA == parseInt(rangePrices[0].value) &&
        boundB == parseInt(rangePrices[1].value)
    )
        return;

    const max = Math.max(boundA, boundB);
    const min = Math.min(boundA, boundB);

	rangeInputs[0].setAttribute("value", `${min}`);
	rangePrices[0].setAttribute("value", `${min}`);
	rangePrices[1].setAttribute("value", `${max}`);
	rangeInputs[1].setAttribute("value", `${max}`);

	const smallest = parseInt(rangeInputs[0].min);
	const largest = parseInt(rangeInputs[0].max);
    range.style.left = ((min - smallest) / (largest - smallest)) * 100 + "%";
    range.style.right = 100 - ((max - smallest) / (largest - smallest)) * 100 + "%";
    callback(min, max);
};

const _makeEL = (inputs, callback) => {
    const list = inputs ? rangeInputs : rangePrices;
    return () => rangeUpdate(list[0].value, list[1].value, callback);
};

const initializeSlider = (min, max, changeCallback) => {
    rangeInputs.forEach((input) => {
        input.setAttribute("min", `${min}`);
		input.setAttribute("max", `${max}`);
        input.addEventListener("input", _makeEL(true, changeCallback));
    });

    rangePrices.forEach((price) => {
        price.setAttribute("min", `${min}`);
		price.setAttribute("max", `${max}`);
        price.addEventListener("input", _makeEL(false, changeCallback));
    });

    rangeUpdate(min, max, changeCallback);
    changeCallback(min, max); // to be sure it gets called in any case
};
