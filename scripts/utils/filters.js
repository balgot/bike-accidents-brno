/** for filtering graphs.. **/

const filterBtn = document.querySelector(".filters__btn");
const filterBtnIco = filterBtn.querySelector("i");
const filterBtnText = filterBtn.querySelector("span");
const filters = document.querySelector(".filters");
const filterInputs = document.querySelectorAll(".filters input");
const filterCloseBtn = document.querySelector(".filters__close");
const FILTER_FA = "fa-filter";
const CLOSE_FA = "fa-xmark";

const _openCloseFilters = () => {
    filters.classList.toggle("filters--hidden");
    if (filters.classList.contains("filters--hidden")) {
        filterBtn.classList.remove("filters__btn--selected");
        filterBtnIco.classList.add(FILTER_FA);
        filterBtnIco.classList.remove(CLOSE_FA);
        filterBtnText.innerHTML = "Filters";
    }
    else {
        filterBtn.classList.add("filters__btn--selected");
        filterBtnIco.classList.add(CLOSE_FA);
        filterBtnIco.classList.remove(FILTER_FA);
        filterBtnText.innerHTML = "Close";
    }
};

filterBtn.addEventListener("click", _openCloseFilters);
filterInputs.forEach((input) => {
    input.addEventListener("change", () => {
        const show = input.checked;
        const name = input.name;
        const section = document.querySelector(`.text .${name}`);
        console.log(section);
        section.style.display = show ? "block" : "none";
    });
});
