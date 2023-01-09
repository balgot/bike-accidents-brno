/* inspired by https://w3collective.com/double-range-slider-html-css-js/ */

// the element that displays the selected range
const range = document.querySelector(".range-selected");
const rangeInputs = document.querySelectorAll(".range-input input");
const rangePrices = document.querySelectorAll(".range-price input");

// TODO: add callback
const rangeUpdate = (a, b) => {
	const boundA = parseInt(a) || parseInt(rangePrices[0].value);
	const boundB = parseInt(b) || parseInt(rangePrices[1].value);

	const max = Math.max(boundA, boundB);
	const min = Math.min(boundA, boundB);

	rangePrices[0].value = min;
	rangeInputs[0].value = min;
	rangePrices[1].value = max;
	rangeInputs[1].value = max;

	range.style.left = (min / rangeInputs[0].max) * 100 + "%";
	range.style.right = 100 - (max / rangeInputs[1].max) * 100 + "%";
};

rangeInputs.forEach((input) =>
	input.addEventListener("input", (e) =>
		rangeUpdate(rangeInputs[0].value, rangeInputs[1].value)
	)
);

rangePrices.forEach((price) =>
	price.addEventListener("input", (e) =>
		rangeUpdate(rangePrices[0].value, rangePrices[1].value)
	)
);
