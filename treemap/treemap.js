// mukheavn

var log = console.log.bind(console);
var dir = console.dir.bind(console);
var replace = function(string) { return string.replace(/[^a-z0-9]/gi,""); };


// === Globals === //

var data;
var width = 500, height = 250;
var colour, colourText;
var colourToNode = {};
var nodesDisciplines = [];

var nextCol = 1;

function genColor(){
  var ret = [];
  // via http://stackoverflow.com/a/15804183
  if(nextCol < 16777215){
    ret.push(nextCol & 0xff); // R
    ret.push((nextCol & 0xff00) >> 8); // G 
    ret.push((nextCol & 0xff0000) >> 16); // B

    nextCol += 1; 
  }
  var col = "rgb(" + ret.join(',') + ")";
  return col;
}


// === Set up the canvas === //

var mainCanvas = d3.select('#container').append('canvas').attr('class', 'mainCanvas').attr('width', width).attr('height', height);
var hiddenCanvas = d3.select('#container').append('canvas').attr('class', 'hiddenCanvas').attr('width', width).attr('height', height);

var customBase = document.createElement('custom');
var custom = d3.select(customBase);


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


	// data = data['chamonix_1924'];
	data = data['sochi_2014'];

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

	// Get all flat nodes showing disciplines
	nodesDisciplines = nodes.filter(function(el) { return !el.children; });

	log('nodes', nodes)

	// Colour scales
	var nodesMinusMax = nodes.filter(function(el) { return el.value < d3.max(nodes, function(d) { return d.value; }) }); // base data for the extent - subtracting the value of the root node 
	var extent = d3.extent(nodesMinusMax, function(d) { return d.value; });

	var colours = ['#c1e9cd', '#7fb6ac', '#49848c', '#205267', '#08253e'] // green to blue for the quantile scale for the rect colours
	colour = d3.scaleQuantile().domain(extent).range(colours); // Lch colour scale picked from http://davidjohnstone.net/pages/lch-lab-colour-gradient-picker
	colourText = d3.scaleLinear().domain([extent[0], d3.quantile(extent,0.9),extent[1]]).range(['#000', '#000', '#fff']); // piecewise scale for the text showing all text in black apart from the biggest (= darkest) rectangles

	
	log('nodesDisciplines', nodesDisciplines);


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
			.attr('children', function(d) { return d.children; })
			.attr('fillStyleHidden', function(d) {
				if (!d.hidden) {
					d.hiddenCol = genColor();
					colourToNode[d.hiddenCol] = d;
				}
				return d.hiddenCol;
			});

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
	
	draw(mainCanvas, false);


} // databind()




function draw(canvas, hidden) {

	var context = canvas.node().getContext('2d');


	context.clearRect(0, 0, width, height);

	var elements = custom.selectAll('custom.rect');

	elements.each(function(d, i) {

		var node = d3.select(this);

		if (node.attr('children')) {

			// log('has children', node.attr('id'), parseInt(node.attr('x')).toFixed(0), parseInt(node.attr('y')).toFixed(0), parseInt(node.attr('width')).toFixed(0), parseInt(node.attr('height')).toFixed(0));

			context.fillStyle = colour(node.attr('value'));
			context.fillRect(+node.attr('x'), +node.attr('y'), +node.attr('width'), +node.attr('height'));

		} else {

			// log('no children', node.attr('id'), parseInt(node.attr('x')).toFixed(0), parseInt(node.attr('y')).toFixed(0), parseInt(node.attr('width')).toFixed(0), parseInt(node.attr('height')).toFixed(0));

			context.strokeStyle = '#eee';
			context.strokeRect(+node.attr('x'), +node.attr('y'), +node.attr('width'), +node.attr('height'));

			if (hidden) {

				context.fillStyle = node.attr('fillStyleHidden');
				context.fillRect(+node.attr('x'), +node.attr('y'), +node.attr('width'), +node.attr('height'));
			
			} // fill the leaf nodes only for the hidden canvas

		}

		if (node.attr('children') && node.attr('parent')) {

			var t = d3.timer(function(elapsed) {

				if (elapsed > 50) {

					context.fillStyle = colourText(node.attr('value'));
					context.font = '10px Open Sans';
					context.fillText(d.value + ' x ' + d.id.replace('Sport: ', ''), +node.attr('x') + 6, +node.attr('y') + 14);
					t.stop();					

				}

			});


		}



	});


} // draw()


mainCanvas.on('mousemove', function() {

	draw(hiddenCanvas, true);

	var mousePos = [d3.event.offsetX, d3.event.offsetY];

	// log('mouseX', mouseX, 'mouseY', mouseY);

	var hiddenCtx = hiddenCanvas.node().getContext('2d');

	var col = hiddenCtx.getImageData(mousePos[0], mousePos[1], 1, 1).data;
	var colKey = 'rgb('+ col[0] +','+ col[1] +','+ col[2] +')';

	var nodeData = colourToNode[colKey];

	// log('nodeData', nodeData);

	var tip = d3.select('.tooltip');

	if (nodeData) {

		// necessary values to calculate tooltip position
		var canvasPos = d3.select('canvas').node().getBoundingClientRect(); // get the canvas left and top position
		// var tip = d3.select('.tooltip'); // cache the tooltip element
		// var tipDim = tip.node().getBoundingClientRect(); // get the tooltip width and height

		tip = d3.select('.tooltip')
			.style('opacity', 0.9)
			.style('top', mousePos[1] + canvasPos.top + 'px')
			.style('left', mousePos[0] + canvasPos.left + 'px')
			.html(nodeData.value + ' x ' + nodeData.id);


		test(tip, nodeData);

	} else {

	// if (nodeData === undefined) {} {

		d3.select('.tooltip').style('opacity', 0);

	}

	// buildTip(nodeData, tip);


}); // canvas listener 


mainCanvas.on('mouseout', function() { d3.select('.tooltip').style('opacity', 0); }); // making sure tooltip disappears when mouse beyond treemap


function test(selection, data) {

		selection.append('div').attr('id', 'tipHeader');
		selection.append('div').attr('id', 'tipBody');

		var margin = { top: 5, right: 5, bottom: 5, left: 150 }
		var width = 300 - margin.left - margin.right;
		var height = 200 - margin.top - margin.bottom;

		var extent = d3.extent(nodesDisciplines, function(d) { return d.value; });
		
		var x = d3.scaleLinear().domain([0, extent[1]]).range([0, width]);
		var y = d3.scaleBand().domain(nodesDisciplines.map(function(d) { return d.id; })).range([0, height]);

		var yAxis = d3.axisLeft(y).tickSize(0).tickPadding(6);

		var g = d3.select('#tipBody')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate('+ margin.left +', '+ margin.top +')')
			.call(yAxis);




}















var block = [];

function buildTip(node_data, selection) {

	node_data ? block.push(node_data) : block = []; // Create condition to only build a tooltip the first time data gets added

	if (node_data && block.length === 1) {

		// d3.selectAll('.tooltip *').remove();

		dir(selection.node());

		d3.select('.tooltip').append('div').attr('id', 'tipHeader');
		
		// selection.append('div').attr('id', 'tipHeader');
		// selection.append('div').attr('id', 'tipBody');

		dir(selection.append('div').attr('id', 'tipHeader').node());


		// var margin = { top: 5, right: 5, bottom: 5, left: 5 }
		// var width = 200 - margin.left - margin.right;
		// var height = 200 - margin.top - margin.bottom;

		// var extent = d3.extent(nodesDisciplines, function(d) { return d.value; });
		
		// var g = d3.select('#tipBody')
		// 	.append('svg')
		// 	.attr('width', width + margin.left + margin.right)
		// 	.attr('height', height + margin.top + margin.bottom)
		// 	.append('g')
		// 	.attr('transform', 'translate('+ margin.left +', '+ margin.top +')');


	}


} // buildTip()

