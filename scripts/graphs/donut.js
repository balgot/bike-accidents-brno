/** donut chart, from https://d3-graph-gallery.com/graph/donut_label.html **/

class DonutChart {
    constructor(width, height, margin, where) {
        this.radius = Math.min(width, height) / 2 - margin;

        // first make an outer svg to which we will position everything
        const outer = d3
            .select(where)
            .append("svg")
            .attr("width", "100%")
            .attr("class", "map__container")
            .attr("viewBox", `0 0 ${width} ${height}`);

        this.svg = outer
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("preserveAspectRatio", "xMidYMin meet")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append("g")
            .style("transform", "translate(50%, 50%)");
    }

    findCounts(values) {
        const occurrences = values.reduce(
            (acc, curr) => (acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc),
            {}
        ); // what: how many
        return Object.keys(occurrences).map((key) => [
            Number(key),
            occurrences[key],
        ]);
    }

    // callback accepts the clicked key and bool whether clicked/unclicked
    update(data, attribute, callback = (a, b) => console.log(a, b)) {
        const entries = data.map((e) => e[attribute]);
        const differentValues = new Set(entries);
        const counts = this.findCounts(entries);
        const radius = this.radius;

        // first remove the old chart
        this.svg.selectAll("*").remove();

        // prepare the color scheme
        const color = d3
            .scaleOrdinal()
            .domain(Array.from(differentValues))
            .range(d3.schemeDark2);

        // Compute the position of each group on the pie:
        const pie = d3
            .pie()
            .sort(null) // Do not sort group by size
            .value((d) => d[1]);
        const data_ready = pie(counts);

        // The arc generator
        const arc = d3
            .arc()
            .innerRadius(radius * 0.5) // This is the size of the donut hole
            .outerRadius(radius * 0.8);

        // Another arc that won't be drawn. Just for labels positioning
        const outerArc = d3
            .arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        this.svg.selectAll("allSlices")
            .data(data_ready)
            .join("path")
            .attr("d", arc)
            .attr("fill", (d) => color(d.data[0])) // TODO: corrent?
            .attr("stroke", "var(--color-font-primary)")
            .style("stroke-width", "2px")
            .on("click", (e, segment) => {
                e.target.classList.toggle("highlight--donut");
                callback(segment.data[0], e.target.classList.contains("highlight--donut"));
            })
            .style("opacity", 0)
            .transition()
            .delay((d, i) => i * 500 - 50)
            .duration(500)
            .style("opacity", 0.7)
            .attrTween('d', d => {
                const i = d3.interpolate(d.startAngle+0.1, d.endAngle);
                return t => {
                    d.endAngle = i(t);
                    return arc(d);
                };
            });

        // Add the polylines between chart and labels:
        this.svg.selectAll("allPolylines")
            .data(data_ready)
            .join("polyline")
            .style("stroke", "var(--color-font-primary)")
            .style("fill", "none")
            .attr("stroke-width", 2)
            .attr("points", function (d) {
                const posA = arc.centroid(d); // line insertion in the slice
                const posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
                const posC = outerArc.centroid(d); // Label position = almost the same as posB
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                return [posA, posB, posC];
            })
            .style("opacity", 0)
            .transition()
            .duration(500)
            .delay((d, i) => 500 * i)
            .style("opacity", 1);

        // Add the polylines between chart and labels:
        this.svg.selectAll("allLabels")
            .data(data_ready)
            .join("text")
            .text((d) => `${d.data[0]} (count: ${d.data[1]})`)
            .style("fill", "var(--color-font-primary)")
            .attr("transform", function (d) {
                const pos = outerArc.centroid(d);
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            })
            .style("text-anchor", function (d) {
                const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return midangle < Math.PI ? "start" : "end";
            })
            .style("opacity", 0)
            .transition()
            .duration(500)
            .delay((d, i) => 500 * i)
            .style("opacity", 1);
    }
};

const donutData = [
    { a: 9 },
    { a: 8 },
    { a: 5 },
    { a: 8 },
    { a: 8 },
    { a: 8 },
    { a: 9 },
    { a: 9 },
    { a: 7 },
    { a: 7 },
    { a: 7 },
    { a: 7 },
    { a: 7 },
    { a: 7 },
];
const donutDataB = [
    { a: 9 },
    { a: 8 },
    { a: 5 },
    { a: 5 },
    { a: 5 },
    { a: 5 },
];
const donutAttr = "a";
