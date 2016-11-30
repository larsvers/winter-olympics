var log = console.log.bind(console);
var dir = console.dir.bind(console);
var replace = function(string) { return string.replace(/[^a-z0-9]/gi,""); };




var data;
var width = 500, height = 250;

// === Set up the canvas === //

var canvas = d3.select('#container').append('canvas').attr('width', width).attr('height', height);

var context = canvas.node().getContext('2d');

// === Load data === //

d3.tsv('../data/sports2.tsv', function(err, data){

	// --- Get a map-object with events as key --- // 

  var nested = d3.nest()
  	.key(function(d) { return d.place_id; })
  	.entries(data);

  data = {};

  nested.forEach(function(el) {

  	data[el.key] = el.values.map(function(el) {

		  return {

	      event_id: parseInt(el.event_id),
	      events: parseInt(el.events),

	      place: el.place,
	      sport: el.sport,
	      discipline: el.discipline

		  }; // returned mapped object

		}); // map function

	}); // loop through nested

  // log(data);

  treeData(data);

}); // d3.tsv()



function treeData(data, event) {


	data = data['chamonix_1924'];

	log('data', data);

	// Get hierarchical object from our tsv data
	var root = d3.stratify()
			.id(function(d) { return d.discipline; }) // the children
			.parentId(function(d) { return d.sport; }) // the parent
			(data);

	// Add a value property with the events data and sort the data according to best treemap practices (https://github.com/d3/d3-hierarchy#node_sort)
	root
			.sum(function(d) { return d.events; })
			.sort(function(a, b) { return b.height - a.height || b.events - a.events; });		

	log('root', root);

	// Generate the treemap layout
	var treemap = d3.treemap()
			.size([width, height])
			.padding(2);

	// Get all nodes (from root to the last leaf) into a flat array
	var nodes = treemap(root)
			.descendants();

	log('nodes', nodes)

}