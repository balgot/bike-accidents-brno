/*******************************************************************************
 * PIE CHART
 * ---------
 *
 * (inspired by http://bl.ocks.org/dbuezas/9306799)
 */

const _width = 800;
const _height = 800;
const _radius = Math.min(_width, _height) / 2;

const drawPieChart = (where, data, attr) => {
    console.log("draw pie chart", where, attr);
    const svg = where.append("svg").attr("width", _width).attr("height", _height).append("g");
    svg.append("g").attr("class", "slices");
    svg.append("g").attr("class", "labels");
    svg.append("g").attr("class", "lines");

    const pie = d3.pie().sort(null)  // ascending
                        .value((d) => d.value);
    const arc = d3.arc().outerRadius(_radius * 0.8)
                        .innerRadius(_radius * 0.4);
    const outerArc = d3.arc().outerRadius(_radius * 0.9)
                             .innerRadius(_radius * 0.9);

    const d = data.map((d) => d.attributes[attr]);
    const colorScale = d3.scaleOrdinal(d3.schemeCategory20);
    const _udata = [...new Set(d)];
    const _data = _udata.map((e, i) => { return {label: e, value: d.filter(x => x == e).length}; });
    console.log(_data);

	/* ------- PIE SLICES -------*/
	var slice = svg.select(".slices")
                   .selectAll("path.slice")
		           .data(pie(_data), d => d.data.label);

	slice.enter()
		.insert("path")
		.style("fill", d => colorScale(d.data.label))
		.attr("class", "slice");

	slice
		.transition().duration(1000)
		.attrTween("d", function(d) {
			this._current = this._current || d;
			const interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return t => arc(interpolate(t));
		})

	slice.exit()
		.remove();

	/* ------- TEXT LABELS -------*/

	var text = svg.select(".labels").selectAll("text")
		.data(pie(_data), d => d.data.label);

	text.enter()
		.append("text")
		.attr("dy", ".35em")
		.text(d => d.data.label);

	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.transition().duration(1000)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	text.exit()
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(_data), d => d.data.label);

	polyline.enter()
		.append("polyline");

	polyline.transition().duration(1000)
		.attrTween("points", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = _radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc.centroid(d2), outerArc.centroid(d2), pos];
			};
		});

	polyline.exit()
		.remove();
};


