// degrees to radians polyfill
if (typeof(Number.prototype.toRad) === "undefined")
	Number.prototype.toRad = function(){ return this * Math.PI / 180; };


// geodetic distance approximation
const _dist = (lat1, lon1, lat2, lon2) => {
	const dlat = (lat2 - lat1).toRad();
	const dlon = (lon2 - lon1).toRad();
	const a = (Math.sin(dlat/2) * Math.sin(dlat/2) + Math.sin(dlon/2) * Math.sin(dlon/2) * Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()));
	return (Math.round(((2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))) * 6371)*100)/100);
};

const _centroid = (set) => set.reduce((s, e) => [(s[0]+e[0]), (s[1]+e[1])], [0, 0]).map(e => e / set.length);

const geocluster = (elements, bias) => {
	// set bias to 1 on default
	if ((typeof bias !== "number") || isNaN(bias))
		bias = 1;

	let tot_diff = 0;
	let diffs = [];
	let diff;

	// calculate sum of differences
	for (let i = 1; i < elements.length; i++) {
		diff = _dist(elements[i][0], elements[i][1], elements[i-1][0], elements[i-1][1]);
		tot_diff += diff;
		diffs.push(diff);
	}

	// calculate mean diff
	const mean_diff = (tot_diff / diffs.length);
	let diff_variance = 0;

	// calculate variance total
	diffs.forEach(diff => {diff_variance += Math.pow(diff - mean_diff, 2)});

	// derive threshold from stdev and bias
	const diff_stdev = Math.sqrt(diff_variance / diffs.length);
	const threshold = (diff_stdev * bias);

	let cluster_map = [];

	// generate random initial cluster map
	cluster_map.push({
		centroid: elements[Math.floor(Math.random() * elements.length)],
		elements: []
	});

	// loop elements and distribute them to clusters
	let changing = true;
	while (changing) {

		let new_cluster = false;
		let cluster_changed = false;

		// iterate over elements
		elements.forEach((e, ei) => {
			let closest_dist = Infinity;
			let closest_cluster = null;

			// find closest cluster
			cluster_map.forEach((cluster, ci) => {
				// distance to cluster
				const dist = _dist(e[0], e[1], cluster_map[ci].centroid[0], cluster_map[ci].centroid[1]);

				if (dist < closest_dist) {
					closest_dist = dist;
					closest_cluster = ci;
				}
			});

			// is the closest distance smaller than the stddev of elements?
			if (closest_dist < threshold || closest_dist === 0) {

				// put element into existing cluster
				cluster_map[closest_cluster].elements.push(e);

			} else {

				// create a new cluster with this element
				cluster_map.push({
					centroid: e,
					elements: [e]
				});

				new_cluster = true;

			}

		});

		// delete empty clusters from cluster_map
		cluster_map = cluster_map.filter(cluster => cluster.elements.length > 0);

		// calculate the clusters centroids and check for change
		cluster_map.forEach((cluster, ci) => {
			const  centroid = _centroid(cluster.elements);
			if (centroid[0] !== cluster.centroid[0] || centroid[1] !== cluster.centroid[1]) {
				cluster_map[ci].centroid = centroid;
				cluster_changed = true;
			}
		});

		// loop cycle if clusters have changed
		if (!cluster_changed && !new_cluster) {
			changing = false;
		} else {
			// remove all elements from clusters and run again
			if (changing) cluster_map = cluster_map.map(function(cluster){
				cluster.elements = [];
				return cluster;
			});
		}

	}

	// compress result
	return cluster_map;

};