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

        // y2 axis
        this.y2 = d3.scaleLinear().range([this.height, 0]);
        // this.yAxis = d3.axisLeft().scale(this.y);
        // this.svg.append("g").attr("class", "line__axis--y");
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

        // update y2 axis
        this.y2.domain([0, d3.max(data, d => d.cum)]);

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

        // new: cummulative...
        // Create a update selection: bind to the new data
        const v = this.svg
            .selectAll(".line__cumm")
            .data([data], (d) => d.ser1);

        // make tooltip
        this.tooltip = this.svg
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

    this.mouseover = function(event, d) {
        this.tooltip
          .style("opacity", 1)
      }

      this.mousemove = function(event, d) {
          console.log("mosemove", this.tooltip);
        this.tooltip
          .html(`The exact value of<br>the Ground Living area is: ${d.GrLivArea}`)
          .style("left", /*(event.x)/2 + */"0px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
          .style("top", /*(event.y)/2 +*/ "0px")
      }

      // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
      this.mouseleave = function(event,d) {
        this.tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
      }


        // Updata the line
        const path =
        v.enter()
            .append("path");
            path
            .attr("class", "line__cumm")
            .merge(v)
            .transition()
            .duration(1000)
            .attr(
                "d",
                d3
                    .area()
                    .x((d) => this.x(d.ser1))
                    .y0(this.y2(0))
                    .y1((d) => this.y2(d.cum))
            )
            .attr("fill", "#cce5df")
            .attr("fill-opacity", "0.4")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5);
            path.on("mouseover", this.mouseover.bind(this) )
    .on("mousemove", this.mousemove.bind(this) )
    .on("mouseleave", this.mouseleave.bind(this) );
    }
}

// datetime & filled in: https://d3-graph-gallery.com/graph/area_basic.html
