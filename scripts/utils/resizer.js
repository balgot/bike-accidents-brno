/** script used to resize the middle part, i.e. map vs data description **/
/* see: https://htmldom.dev/create-resizable-split-views/ */

class Resizer {
    constructor() {
        // Query the elements
        this.resizer = document.getElementById('dragMe');
        this.leftSide = this.resizer.previousElementSibling;
        this.rightSide = this.resizer.nextElementSibling;

        // mouse position
        this.mouseX = 0;
        this.mouseY = 0;

        // left side width
        this.leftWidth = 0;

        // atach event handlers
        this.resizer.addEventListener('mousedown', this.mouseDownHandler);
    }

    mouseDownHandler(e) {
        // Get the current mouse position
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.leftWidth = this.leftSide.getBoundingClientRect().width;

        // Attach the listeners to `document`
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('mouseup', this.mouseUpHandler);
    }

    mouseMoveHandler (e) {
        // How far the mouse has been moved
        const dx = e.clientX - this.mouseX;
        const dy = e.clientY - this.mouseY;

        const newLeftWidth = ((this.leftWidth + dx) * 100) / this.resizer.parentNode.getBoundingClientRect().width;
        this.leftSide.style.width = `${newLeftWidth}%`;
        document.body.style.cursor = 'col-resize';

        this.leftSide.style.userSelect = 'none';
        this.leftSide.style.pointerEvents = 'none';
        this.rightSide.style.userSelect = 'none';
        this.rightSide.style.pointerEvents = 'none';
    };

    mouseUpHandler () {
        document.body.style.removeProperty('cursor');

        this.leftSide.style.removeProperty('user-select');
        this.leftSide.style.removeProperty('pointer-events');
        this.rightSide.style.removeProperty('user-select');
        this.rightSide.style.removeProperty('pointer-events');

        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener('mousemove', this.mouseMoveHandler);
        document.removeEventListener('mouseup', this.mouseUpHandler);
    };
}
