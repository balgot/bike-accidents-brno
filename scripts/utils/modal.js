/** controls how the modal is displayed, to be loaded after the html **/

// Get the modal
const modal = document.getElementById("app_modal");

// Get the button that opens the modal
const modal_btn = document.getElementById("app_modal__btn");

// Get the <span> element that closes the modal
const modal_close = document.getElementsByClassName("modal__close")[0];

modal_btn.onclick = () => {modal.style.display = "block"; console.log("Openning modal"); };
modal_close.onclick = () => (modal.style.display = "none");

// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
