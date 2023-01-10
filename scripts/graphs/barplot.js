/** https://d3-graph-gallery.com/graph/barplot_button_data_hard.html */
class BarPlotSwitchable {
    constructor(margin, width, height, where) {
        this.margin = margin;
        this.width = width - margin.left - margin.right;
        this.height = height - margin.top - margin.bottom;

        // append the svg object to the body of the page
        this.svg = d3
            .select(where)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Initialize the X axis
        this.x = d3.scaleBand().range([0, width]).padding(0.2);
        this.xAxis = svg
            .append("g")
            .attr("transform", `translate(0,${height})`);

        // Initialize the Y axis
        this.y = d3.scaleLinear().range([height, 0]);
        this.yAxis = svg.append("g").attr("class", "myYaxis");
    }

    /**
     * Update or initialize.
     *
     * @param {*} data
     * @param {String} x
     * @param {String} y
     */
    update(data, x, y) {
        // Update the X axis
        this.x.domain(data.map((d) => d[x]));
        this.xAxis.call(d3.axisBottom(this.x));

        // Update the Y axis
        this.y.domain([0, d3.max(data, (d) => d[y])]);
        this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y));

        // Create the u variable
        this.svg
            .selectAll("rect")
            .data(data)
            .join("rect") // Add a new rect for each new elements
            .transition()
            .duration(1000)
            .attr("x", (d) => x(d[x]))
            .attr("y", (d) => y(d[y]))
            .attr("width", this.x.bandwidth())
            .attr("height", (d) => height - this.y(d.value))
            .attr("fill", "#69b3a2");
    }
}
