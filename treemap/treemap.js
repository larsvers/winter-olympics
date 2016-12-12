
var log = console.log.bind(console);
var dir = console.dir.bind(console);
var replace = function(string) { return string.replace(/[^a-z0-9]/gi,""); };



// === Globals === //

var data;
var width = 500, height = 250;
var colour, colourText;
var colourToNode = {};
var nodesDisciplines = [];
var dur = 500;

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

	makeDropdown(data);

  treeData(data['chamonix_1924']);
	var t = d3.timer(function(elapsed) {
		draw(mainCanvas, false);
		if (elapsed > dur + 100) {
			drawText();
			t.stop();
		}
	}); // start a timer that runs the draw function for 500 ms (this needs to be higher than the transition in the databind function)


	d3.select('select').on('change', function() {

		treeData(data[this.value]); // ...then update the databind function

		var t = d3.timer(function(elapsed) {
			draw(mainCanvas, false);
			if (elapsed > dur + 100) {
				drawText();
				t.stop();
			}
		}); // start a timer that runs the draw function for 500 ms (this needs to be higher than the transition in the databind function)

	}); // select listener/handler


}); // d3.tsv()





function makeDropdown(data) {

	var selectData = d3.keys(data);
	
	var select = d3.select('#select')
		.append('select');

	var options = select.selectAll('option.options')
		.data(selectData)
		.enter()
		.append('option')
		.attr('class', 'options')
		.attr('value', function(d) { return d; })
		.html(function(d) { return d; });

} // makeDropdown()




// === Prep data === //

function treeData(data) {

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
		.tile(d3.treemapResquarify)
		.size([width, height])
		.padding(0);

	// Get all nodes (from root to the last leaf) into a flat array
	var nodes = treemap(root)
			.descendants();

	// Get all flat nodes showing disciplines
	nodesDisciplines = nodes
		.filter(function(el) { return !el.children; })
		.sort(function(a,b){ return b.value - a.value; });

	// log('nodes', nodes)

	// Colour scales
	var nodesMinusMax = nodes.filter(function(el) { return el.value < d3.max(nodes, function(d) { return d.value; }) }); // base data for the extent - excluding the value of the root node 
	var extent = d3.extent(nodesMinusMax, function(d) { return d.value; });

	var colours = ['#c1e9cd', '#7fb6ac', '#49848c', '#205267', '#08253e'] // green to blue for the quantile scale for the rect colours
	colour = d3.scaleQuantile().domain(extent).range(colours); // Lch colour scale picked from http://davidjohnstone.net/pages/lch-lab-colour-gradient-picker

	colour = d3.scaleLinear().domain(extent).range([colours[0], colours[colours.length-1]])
	colour = d3.scaleLinear().domain([extent[0], d3.quantile(extent,0.5),extent[1]]).range([colours[0], colours[2], colours[colours.length-1]]); // piecewise scale for the text showing all text in black apart from the biggest (= darkest) rectangles
	colourText = d3.scaleLinear().domain([extent[0], d3.quantile(extent,0.9),extent[1]]).range(['#000', '#000', '#fff']); // piecewise scale for the text showing all text in black apart from the biggest (= darkest) rectangles

	
	// log('nodesDisciplines descending', nodesDisciplines);


	databind(nodes);
	
} // treeData()




// === Bind data === //

function databind(data) {

	var join = custom.selectAll('custom.rect')
			.data(data, function(d) { return d.id});


	var enterSel = join.enter()
			.append('custom')
			.classed('rect', true)
			.attr('x', function(d) { return d.x0; })
			.attr('y', function(d) { return d.y0; })
			.attr('value', function(d) { return d.value; })
			.attr('parent', function(d) { return d.parent; })
			.attr('children', function(d) { return d.children; })
			.attr('fillStyleHidden', function(d) {
				if (!d.hidden) {
					d.hiddenCol = genColor();
					colourToNode[d.hiddenCol] = d;
				}
				return d.hiddenCol;
			})
			.attr('width', 0)
			.attr('height', 0)
			.attr('fillStyle', '#fff')
			.transition().duration(dur)
			.attr('width', function(d) { return d.x1 - d.x0; })
			.attr('height', function(d) { return d.y1 - d.y0; })
			.attr('fillStyle', function(d) { return colour(d.value); })

  
	join
			.merge(enterSel)
			.transition().duration(dur)
			.attr('x', function(d) { return d.x0; })
			.attr('y', function(d) { return d.y0; })
			.attr('width', function(d) { return d.x1 - d.x0; })
			.attr('height', function(d) { return d.y1 - d.y0; })
			.attr('fillStyle', function(d) { return colour(d.value); })
			.attr('value', function(d) { return d.value; })
			.attr('parent', function(d) { return d.parent; })
			.attr('children', function(d) { return d.children; })
			.attr('fillStyleHidden', function(d) {
				if (!d.hidden) {
					d.hiddenCol = genColor();
					colourToNode[d.hiddenCol] = d;
				}
				return d.hiddenCol;
			});


	var exitSel = join.exit()
			.transition().duration(dur)
			.attr('width', 0)
			.attr('height', 0)
			.remove();
	


	// draw(mainCanvas, false);


} // databind()




// === Draw the elements === //

function draw(canvas, hidden) {

	var context = canvas.node().getContext('2d');

	context.clearRect(0, 0, width, height);

	var elements = custom.selectAll('custom.rect'); // grab all elements

	elements.each(function(d, i) {

		var node = d3.select(this); // grab element

		if (d.children && d.depth > 0) { // all non-leaf nodes less the root node get a fill

			context.fillStyle = node.attr('fillStyle');
			context.fillRect(+node.attr('x'), +node.attr('y'), +node.attr('width'), +node.attr('height'));

		} // style condition

		if (!d.children) { // all leaf nodes get a stroke

			context.strokeStyle = '#fff';
			context.strokeRect(+node.attr('x'), +node.attr('y'), +node.attr('width'), +node.attr('height'));

		} // style condition

		if (!d.children && hidden) {

			context.fillStyle = node.attr('fillStyleHidden');
			context.fillRect(+node.attr('x'), +node.attr('y'), +node.attr('width'), +node.attr('height'));

		} // hidden fillStyle condition


	}); // draw each node

} // draw()





function drawText(){

	var context = mainCanvas.node().getContext('2d');

	var elements = custom.selectAll('custom.rect');

	elements.each(function(d, i) {

		var node = d3.select(this);

 		if (node.attr('children') && node.attr('parent')) { // all non-leaf nodes and not the root node get some text

			context.fillStyle = colourText(node.attr('value'));
			context.font = '10px Open Sans';
			context.fillText(d.value + ' x ' + d.id.replace('Sport: ', ''), +node.attr('x') + 6, +node.attr('y') + 14);

		}

	}); // loop through elements

} // drawText()




// === Interactivity === //


var block = []; // array to block unnecessary re-loads

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
		var tipDim = d3.select('.tooltip').node().getBoundingClientRect(); // get the tooltip width and height

		tip = d3.select('.tooltip')
			.style('top', mousePos[1] + canvasPos.top - tipDim.height - 5 + 'px') // mouse + canvas position - tip height - padding
			.style('left', mousePos[0] + canvasPos.left - tipDim.width/2 + 'px'); // mouse + canvas position - half the tip width

		block.push(nodeData.id); // nodeData.id under the mouse gets pushed to array every mousemove
		if (block.length > 2) block.shift() // if this array gets longer than 2, remove the first element array (the 'old' one)
		if (block[1] !== block[0]) buildTip(tip, nodeData); // only if the two elements differ - as in we hovered over a new area - build it.

	} 

}); // canvas listener 





mainCanvas.on('mouseout', function() { 

	block = [];
	d3.selectAll('.tooltip *').style('opacity', 0); 

}); // making sure tooltip disappears when mouse beyond treemap





function buildTip(selection, data) {

	// straight cleaning for simplicity
	d3.selectAll('.tooltip *').remove();


	// add header and body div's
	selection.append('div').attr('id', 'tipHeader').style('opacity', 1).style('background-color', 'rgba(220,220,255,0.9)');
	selection.append('div').attr('id', 'tipBody').style('opacity', 1).style('background-color', 'rgba(220,220,255,0.9)');

	d3.select('#tipHeader').html('Number of disciplines')

	// Sizes
	var margin = { top: 5, right: 20, bottom: 5, left: 90 }
	var width = 200 - margin.left - margin.right;
	var height = 200 - margin.top - margin.bottom;

	// Scales and Axis
	var extent = d3.extent(nodesDisciplines, function(d) { return d.value; });		
	var x = d3.scaleLinear().domain([0, extent[1]]).range([0, width]);
	var y = d3.scaleBand().domain(nodesDisciplines.map(function(d) { return d.id; })).rangeRound([0, height]);
	var yAxis = d3.axisLeft(y).tickSize(0).tickPadding(6);

	// Add SVG and g's
	var g = d3.select('#tipBody')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate('+ margin.left +', '+ margin.top +')')
		.call(yAxis);

	var gLines = g.append('g').attr('class', 'gLines');
	var gCircles = g.append('g').attr('class', 'gCircles');


	// Build visual

	var joinLines = gLines.selectAll('.lines')
		.data(nodesDisciplines);

	var enterLines = joinLines
		.enter()
		.append('line')
		.classed('lines', true)
		.attr('x1', function(d) { return x(0); })
		.attr('y1', function(d) { return y(d.id) + y.bandwidth()/2; }) // adding half of the bandwidth necessary to position the line in the center
		.attr('x2', function(d) { return x(d.value); })
		.attr('y2', function(d) { return y(d.id) + y.bandwidth()/2; })
		.style('stroke', function(d) { return d.id === data.id ? '#08253e' : 'steelblue'; })
		.style('stroke-width', 1);

	var joinCircles = gCircles.selectAll('.circles')
		.data(nodesDisciplines);

	var enterCircles = joinCircles
		.enter()
		.append('circle')
		.classed('circles', true)
		.attr('cx', function(d) { return x(d.value); })
		.attr('cy', function(d) { return y(d.id) + y.bandwidth()/2; }) // adding half of the bandwidth necessary to position the line in the center
		.attr('r', 2)
		.style('fill', function(d) { return d.id === data.id ? '#08253e' : 'steelblue'; });


	// Add text label to currrent lollipop

	d3.select('text.value').remove();

	var font = parseInt(d3.select('.tick text').style('font-size').replace('px',''),10); // Font size of axis labels

	g.append('text')
		.attr('class', 'value')
		.attr('x', x(data.value) + 5) // value plus a bit of padding
		.attr('y', y(data.id) + y.bandwidth()/2 + font/4) // this is how the labels align central
		.attr('font-size', font)
		.attr('fill', '#000')
		.attr('text-anchor', 'start')
		.text(data.value);

} // buildTip()



