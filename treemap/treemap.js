var log = console.log.bind(console);
var dir = console.dir.bind(console);
var replace = function(string) { return string.replace(/[^a-z0-9]/gi,""); };


// === Globals === //

var data;
var width = 500, height = 250;

// === Set up the canvas === //

var canvas = d3.select('#container').append('canvas').attr('width', width).attr('height', height);

var customBase = document.createElement('custom');
var custom = d3.select(customBase);

var color;

// === Load data === //

d3.tsv('../data/sports.tsv', function(err, data){

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

  treeData(data);

}); // d3.tsv()



function treeData(data, event) {


	data = data['chamonix_1924'];
	// data = data['sochi_2014'];

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


	color = d3.scaleOrdinal(d3.schemeAccent);
	color = d3.scaleOrdinal(d3.schemePastel2);


	databind(nodes);

} // treeData()



function databind(data) {


	var join = custom.selectAll('custom.rect')
			.data(data);


	var enterSel = join.enter()
			.append('custom')
			.classed('rect', true)
			.attr('x', function(d) { return d.x0; })
			.attr('y', function(d) { return d.y0; })
			.attr('width', function(d) { return d.x1 - d.x0; })
			.attr('height', function(d) { return d.y1 - d.y0; })
			.attr('fillStyle', function(d) { return '#ccc'; })
			.attr('value', function(d) { return d.value; })
			.attr('id', function(d) { return d.id; })
			.attr('parent', function(d) { return d.parent; })
			.attr('children', function(d) { return d.children; });

/*
	join
			.merge(enterSel)
			.transition()
			.attr('x', function(d) { return d.x0; })
			.attr('y', function(d) { return d.y0; })
			.attr('width', function(d) { return d.x1; })
			.attr('height', function(d) { return d.y1; });


	var exitSel = join.exit()
			.transition()
			.attr('width', 0)
			.attr('height', 0)
			.remove();
*/
	
	draw();


} // databind()




function draw() {

	var context = canvas.node().getContext('2d');

	context.clearRect(0, 0, width, height);

	var elements = custom.selectAll('custom.rect');

	elements.each(function(d, i) {

		var node = d3.select(this);

		if (node.attr('children')) {

			// log('has children', node.attr('id'), parseInt(node.attr('x')).toFixed(0), parseInt(node.attr('y')).toFixed(0), parseInt(node.attr('width')).toFixed(0), parseInt(node.attr('height')).toFixed(0));

			context.fillStyle = color(node.attr('id'));
			context.fillRect(+node.attr('x'), +node.attr('y'), +node.attr('width'), +node.attr('height'));

		} else {

			// log('no children', node.attr('id'), parseInt(node.attr('x')).toFixed(0), parseInt(node.attr('y')).toFixed(0), parseInt(node.attr('width')).toFixed(0), parseInt(node.attr('height')).toFixed(0));

			context.strokeStyle = '#fff';
			context.strokeRect(+node.attr('x'), +node.attr('y'), +node.attr('width'), +node.attr('height'));

			var eventSpelling = d.value === 1 ? ' event' : ' events';
			var text = d.value + ' ' + d.id +  eventSpelling;

			context.fillStyle = '#000';
			context.font = '10px Open Sans';
			context.fillText(d.value + ' x ' + d.id, +node.attr('x') + 2, +node.attr('y') + 10);

		}


	});


} // draw()










