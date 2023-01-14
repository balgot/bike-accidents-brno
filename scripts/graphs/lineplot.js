class LinePlotAccidents {
    constructor(width, height, margin, where) {
        this.margin = margin;
        this.width = width - margin.left - margin.right;
        this.height = height - margin.top - margin.bottom;

        // responsive
        const outer = d3
            .select(where)
            .append("svg")
            .attr("width", "100%")
            .attr("class", "map__container")
            .attr("viewBox", `0 0 ${width} ${height}`);

        // append the svg object to the body of the page
        this.svg = outer
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // axis
        this.x = d3.scaleLinear().range([0, this.width]);
        this.xAxis = d3.axisBottom().scale(this.x);
        this.svg
            .append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .attr("class", "line__axis--x");

        // y axis
        this.y = d3.scaleLinear().range([this.height, 0]);
        this.yAxis = d3.axisLeft().scale(this.y);
        this.svg.append("g").attr("class", "line__axis--y");
    }

    update(data) {
        // Create the X axis:
        this.x.domain([0, d3.max(data, (d) => d.ser1)]);
        this.svg
            .selectAll(".line__axis--x")
            .transition()
            .duration(1000)
            .call(this.xAxis);

        // create the Y axis
        this.y.domain([0, d3.max(data, (d) => d.ser2)]);
        this.svg
            .selectAll(".line__axis--y")
            .transition()
            .duration(1000)
            .call(this.yAxis);

        // Create a update selection: bind to the new data
        const u = this.svg
            .selectAll(".line__point")
            .data([data], (d) => d.ser1);

        // Updata the line
        u.enter()
            .append("path")
            .attr("class", "line__point")
            .merge(u)
            .transition()
            .duration(1000)
            .attr(
                "d",
                d3
                    .line()
                    .x((d) => this.x(d.ser1))
                    .y((d) => this.y(d.ser2))
            )
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2.5);
    }
}

// datetime & filled in: https://d3-graph-gallery.com/graph/area_basic.html
