class LinePlotAccidents {
    constructor(width, height, margin, where) {
        this.margin = margin;
        this.width = width - margin.left - margin.right;
        this.height = height - margin.top - margin.bottom;

        // responsive svg container
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
        this.xAxis = d3.axisBottom().scale(this.x).tickFormat(d3.format("d"));
        this.svg
            .append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .attr("class", "line__axis--x");

        // y axis
        this.y = d3.scaleLinear().range([this.height, 0]);
        this.yAxis = d3.axisLeft().scale(this.y);
        this.svg.append("g").attr("class", "line__axis--y");

        // y2 axis, for cummulative
        this.y2 = d3.scaleLinear().range([this.height, 0]);
        this.y2Axis = d3.axisLeft().scale(this.y2);
        this.svg.append("g").attr("class", "line__axis--y2").attr("transform", `translate(${this.width}, 0)`);
    }

    update(data, x = "ser1", y = "ser2", z = "cum") {
        // Create the X axis:
        this.x.domain([d3.min(data, (d) => d[x]), d3.max(data, (d) => d[x])]);
        this.svg
            .selectAll(".line__axis--x")
            .transition()
            .duration(1000)
            .call(this.xAxis);

        // create the Y axis
        this.y.domain([0, d3.max(data, (d) => d[y] || 0)]);
        this.svg
            .selectAll(".line__axis--y")
            .transition()
            .duration(1000)
            .call(this.yAxis);

        // update y2 axis
        this.y2.domain([0, 1.5 * d3.max(data, (d) => d[z])]);
        this.svg
            .selectAll(".line__axis--y2")
            .transition()
            .duration(1000)
            .call(this.y2Axis);

        // accidents - line plot
        const nonZeroIdx = data.findIndex(e => e["accidents"] > 0);
        console.log({nonZeroIdx, data})
        const u = this.svg
            .selectAll(".line__point")
            .data([data.filter((_, i) => i >= nonZeroIdx)], (d) => d[x]);

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
                    .x((d) => this.x(d[x]))
                    .y((d) => this.y(d[y] || 0))
            )
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2.5);

        // accidents - circles
        this.svg.selectAll(".line__point--circle").remove();
        const circles = this.svg
            .selectAll(".line__point--circle")
            .data(data.filter((_, i) => i >= nonZeroIdx), (d) => d[x]);

        circles.enter()
              .append("circle")
              .attr("class", "line__point--circle")
              .merge(circles)
              .transition()
              .duration(1000)
              .attr("fill", "steelblue")
              .attr("stroke", "none")
              .attr("cx", d => this.x(d[x]))
              .attr("cy", d => this.y(d[y]))
              .attr("r", 5);
        this.svg.selectAll(".line__point--circle").append("title").text(d => `Accidents: ${d[y]}`)

        // new: cummulative...
        // Create a update selection: bind to the new data
        const v = this.svg.selectAll(".line__cumm").data([data], (d) => d[x]);

        // Updata the line
        const path = v.enter().append("path");
        path.attr("class", "line__cumm")
            .merge(v)
            .transition()
            .duration(1000)
            .attr(
                "d",
                d3
                    .area()
                    .x((d) => this.x(d[x]))
                    .y0(this.y2(0))
                    .y1((d) => this.y2(d[z]))
            )
            .attr("fill", "#cce5df")
            .attr("fill-opacity", "0.4")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5);
        path.append("title").text("Cummulative length of roads")
    }
}

// datetime & filled in: https://d3-graph-gallery.com/graph/area_basic.html
