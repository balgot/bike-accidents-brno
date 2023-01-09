/** Scripts related to the range slider, inspired by: https://codepen.io/scottbram/pen/PoGpyKa */

/* Default config */
// TODO: set them from somewhere else or enforce them in HTML
const rangeSliderMin = 2000;  // arbitrary ;)
const rangeSliderMax = new Date().getFullYear();  // up to the current year

/* First set-up the divs displaying the range */
const RSLeft = document.querySelector(".slider__range--left");
const RSMid = document.querySelector(".slider__range--mid");
const RSRight = document.querySelector(".slider__range--right");
const RSLeftHandle = document.querySelector(".slider__handle--left");
const RSRightHandle = document.querySelector(".slider__handle--right");
const RSInputMin = document.querySelector(".slider__input--from");
const RSInputMax = document.querySelector(".slider__input--to");

RSLeft.style.width = `${rangeSliderMin + (100 - rangeSliderMax)}%`;
RSRight.style.width = `${rangeSliderMin + (100 - rangeSliderMax)}%`;
RSMid.style.cssText = `left: ${rangeSliderMin}%; right: ${(100 - rangeSliderMax)}%`;
RSLeftHandle.style.left = `${rangeSliderMin}%`;
RSRightHandle.style.left = `${rangeSliderMax}%`;

// TODO: rename Min, Max as we allow different order
const RSHandleInput = (minValue, maxValue) => {
    const realMin = Math.min(minValue, maxValue);
    const realMax = Math.max(minValue, maxValue);

    // need to calculate 3 segments:
    //  * empty from start to the range
    //  * range itself
    //  * empty from range to the end
    // and store this to vars: <fst segment>[A]<snd segment>[B]<last segment>
    const totalLength = rangeSliderMax - rangeSliderMin;
    const A = 100 * realMin / totalLength;
    const B = 100 * realMax / totalLength;

    // now update all the divs
    RSLeft.style.cssText = `left: 0; width: ${A}%`;
    RSMid.style.cssText = `left: ${A}%; width: ${B - A}%`;
    RSRight.style.cssText = `left: ${B}%; width: ${100 - B}%`;

    // and handles
    RSLeftHandle.style.left = `${A}%`;
    RSLeftHandle.innerHTML = `${realMin}`;
    RSRightHandle.style.left = `${B}%`;
    RSRightHandle.innerHTML = `${realMax}`;
}

RSInputMin.value = rangeSliderMin;
RSInputMin.addEventListener("input", (e) => RSHandleInput(e.target.value, RSInputMax.value));
// RSInputMin.addEventListener('input', e => {
// 	e.target.value = Math.min(e.target.value, e.target.parentNode.childNodes[5].value - 1);
// 	var value = (100 / ( parseInt(e.target.max) - parseInt(e.target.min) )) * parseInt(e.target.value) - (100 / (parseInt(e.target.max) - parseInt(e.target.min) )) * parseInt(e.target.min);

// 	var children = e.target.parentNode.childNodes[1].childNodes;
// 	children[1].style.width = `${value}%`;
// 	children[5].style.left = `${value}%`;
// 	children[7].style.left = `${value}%`;
// 	children[11].style.left = `${value}%`;

// 	children[11].childNodes[1].innerHTML = e.target.value;
// });

RSInputMax.value = rangeSliderMax;
RSInputMax.addEventListener("input", (e) => RSHandleInput(RSInputMin.value, e.target.value));
// RSInputMax.addEventListener('input', e => {
// 	e.target.value = Math.max(e.target.value, e.target.parentNode.childNodes[3].value - (-1));
// 	var value = (100 / ( parseInt(e.target.max) - parseInt(e.target.min) )) * parseInt(e.target.value) - (100 / ( parseInt(e.target.max) - parseInt(e.target.min) )) * parseInt(e.target.min);

// 	var children = e.target.parentNode.childNodes[1].childNodes;
// 	children[3].style.width = `${100-value}%`;
// 	children[5].style.right = `${100-value}%`;
// 	children[9].style.left = `${value}%`;
// 	children[13].style.left = `${value}%`;

// 	children[13].childNodes[1].innerHTML = e.target.value;
// });
