/** https://d3-graph-gallery.com/graph/barplot_button_data_hard.html */
class BarPlotSwitchable {
    constructor(width, height, margin, where, sortFn = null) {
        this.margin = margin;
        this.width = width - margin.left - margin.right;
        this.height = height - margin.top - margin.bottom;
        this.sortFn = sortFn;

        // ...
        const usedWidth = width + margin.left + margin.right;
        const usedHeight = height + margin.top + margin.bottom;

        // first make an outer svg to which we will position everything
        const outer = d3
            .select(where)
            .append("svg")
            .attr("width", "100%")
            .attr("class", "map__container")
            .attr("viewBox", `0 0 ${usedWidth} ${usedHeight}`);

        // append the svg object to the body of the page
        this.svg = outer
            .append("svg")
            .attr("width", usedWidth)
            .attr("height", usedHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Initialize the X axis
        this.x = d3.scaleBand().range([0, this.width]).padding(0.2);
        this.xAxis = this.svg
            .append("g")
            .attr("transform", `translate(0,${this.height})`);

        // Initialize the Y axis
        this.y = d3.scaleLinear().range([this.height, 0]);
        this.yAxis = this.svg.append("g").attr("class", "myYaxis");
    }

    /**
     *
     * @param {*} values
     * @returns
     * @todo deduplicate with donut.js
     */
    findCounts(values) {
        const occurrences = values.reduce(
            (acc, curr) => (acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc),
            {}
        ); // what: how many
        const res = Object.keys(occurrences).map((key) => [
            key,
            occurrences[key],
        ]);
        return this.sortFn == null ? res : res.sort(this.sortFn);
    }

    /**
     * Update or initialize.
     *
     * @param {*} data
     * @param {String} attr
     */
    update(data, attr, callback = (...args) => null) {
        const counts = this.findCounts(data.map(d => d[attr]));

        // Update the X axis
        this.x.domain(counts.map((d) => d[0]));
        this.xAxis.call(d3.axisBottom(this.x));
        const x = this.x;

        // Update the Y axis
        this.y.domain([0, d3.max(counts, (d) => d[1])]);
        this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y));
        const y = this.y;
        const height = this.height;

        // Create the u variable
        this.svg
            .selectAll("rect")
            .data(counts)
            .join("rect") // Add a new rect for each new elements
            .on("click", (e, data) => {
                e.target.classList.toggle("highlight--donut");  // todo: class name
                callback(data[0], e.target.classList.contains("highlight--donut"));
            })
            .transition()
            .duration(1000)
            .attr("x", (d) => x(d[0]))
            .attr("y", (d) => y(d[1]))
            .attr("width", this.x.bandwidth())
            .attr("height", (d) => height - y(d[1]))
            .attr("fill", "#69b3a2");
    }
}
