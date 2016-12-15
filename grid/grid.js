
var colourToNodeGrid = {}; // define outside make chart as d3 element update will only fill this once as joing lives on even beyond redraw.

function makeGrid() {

	// === Remove and reset width for redraw === //
	
	d3.selectAll('#grid *').remove();
	
	
	// === Set up canvas === //

	var width = wWidth * 0.31, height = wHeight * 0.29;

	var mainCanvas = d3.select('#grid')
		.append('canvas')
		.classed('main-canvas', true)
		.attr('width', width)
		.attr('height', height);


	// --- Set up picking tools --- //

	var hiddenCanvas = d3.select('#grid')
		.append('canvas')
		.classed('hidden-canvas', true)
		.attr('width', width)
		.attr('height', height);



	// function to create new colours for the picking

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

	} // genColor()





	// === Bind data to custom elements === //

	var customBase = document.createElement('custom');
	var custom = d3.select(customBase); // this is our svg replacement


	// settings for a grid with 40 cells in a row and 2x5 cells in a group
	var groupSpacing = 4;
	var cellSpacing = 2;
	var offsetTop = height / 5;
	var cellSize = (width - 20 * cellSpacing - 3 * groupSpacing) / 20;



	// load an example set

  databind(data.nations_grid['sochi_2014']); // ...then update the databind function

	var t = d3.timer(function(elapsed) {
		draw(mainCanvas);
		if (elapsed > 500) t.stop();
	}); // start a timer that runs the draw function for 500 ms (this needs to be higher than the transition in the databind function)



	function databind(data) {

		// log(data);

		// --- Scales --- //

		var extent = d3.extent(data, function(d) { return d.medals; });

		// var colours = ['#b8cee9', '#8aa0bb', '#5e748f', '#344a65', '#08253e'] // blue to blue
		var colours = ['#adceff', '#88b5ff', '#639afb', '#3f81fa', '#0066f5'] // blue to blue
		// var colours = ['#c1e9cd', '#8fb499', '#608367', '#34543a', '#0b2911'] // green to green
		// var colours = ['#c1e9cd', '#7fb6ac', '#49848c', '#205267', '#08253e'] // green to blue

		var numberScale = d3.scaleQuantile().domain(extent).range(colours); // Lch colour scale picked from http://davidjohnstone.net/pages/lch-lab-colour-gradient-picker

		// var colours = ['#adceff', '#639afb', '#0066f5'] // colour extent for piecewise linear scale
		// var numberScale = d3.scaleLinear().domain([extent[0], d3.quantile(extent,0.5),extent[1]]).range(colours); // piecewise scale for the text showing all text in black apart from the biggest (= darkest) rectangles



		// --- Data for the legend --- //

		var colourRange = numberScale.range(),
				colRangeLgth = colourRange.length,
				legendData = [];

		colourRange.forEach(function(el) {

			var obj = {};
			obj.colour = el;
			obj.rangeStart = Math.ceil(numberScale.invertExtent(el)[0]);
			obj.rangeStop = Math.floor(numberScale.invertExtent(el)[1]);
			obj.range = [obj.rangeStart, obj.rangeStop];

			legendData.push(obj);

		}); // produce legendData array of object holding info on colour and range for each bin.



		// --- Bind --- //

		var join = custom.selectAll('custom.rect')
			.data(data.sort(function(a, b) {
  			return d3.ascending(a.medals, b.medals);
				}, function(d) { return d.nation; 
			}));

		var enterSel = join.enter()
			.append('custom')
			.attr('class', 'rect')
			.attr('x', function(d,i) {
				var x0 = Math.floor(i % 20); // 0-19 back to 0
				var x1 = Math.floor(i/5) % 4; // increases by 1 every 5 and gets back to 0 after 20
				d.x = x0 * cellSize + x0 * cellSpacing + x1 * groupSpacing; // save the position for the tooltip later
				return d.x;
			})
	  	.attr('y', function(d,i) {
  			var y0 = Math.floor(i/20) % 20; // increases by 1 every 20
				var y1 = Math.floor(i/40) % 40; // increases by 1 every 40
				d.y = offsetTop + y0 * cellSize + y0 * cellSpacing + y1 * groupSpacing;  // save the position for the tooltip later
				// log('d.x', Math.round(d.x), 'd.y', Math.round(d.y));
  	  	return d.y;
	  	})
			.attr('width', 0)
			.attr('height', 0);

		join
			.merge(enterSel)
			.transition()
			.attr('width', cellSize)
			.attr('height', cellSize)
			.attr('x', function(d,i) {
				var x0 = Math.floor(i % 20); // 0-19 back to 0
				var x1 = Math.floor(i/5) % 4; // increases by 1 every 5 and gets back to 0 after 20
				d.x = x0 * cellSize + x0 * cellSpacing + x1 * groupSpacing; // save the position for the tooltip later
				return d.x;
			})
	  	.attr('y', function(d,i) {
  			var y0 = Math.floor(i/20) % 20; // increases by 1 every 20
				var y1 = Math.floor(i/40) % 40; // increases by 1 every 40
				d.y = offsetTop + y0 * cellSize + y0 * cellSpacing + y1 * groupSpacing;  // save the position for the tooltip later
  	  	return d.y;
	  	}) 
			.attr('fillStyle', function(d) { return numberScale(d.medals); })
			.attr('fillStyleHidden', function(d) { 

				if (!d.hiddenCol) {

					d.hiddenCol = genColor();
					colourToNodeGrid[d.hiddenCol] = d;

				} // here we (1) add a unique colour as property to each element and (2) map the colour to the node in the colourToNodeGrid-dictionary 

				return d.hiddenCol;

			});

		var exitSel = join.exit()
			.transition()
			.attr('width', 0)
			.attr('height', 0)
			.remove();



		// --- Legend --- //

		var legend = custom.selectAll('custom.legend-rect')
			.data(legendData)
			.enter()
			.append('custom')
			.attr('class', 'legend-rect')
			.attr('x', function(d,i) {
				var x0 = width/2 - (cellSize * 0.75) * (colRangeLgth/2), x1 = x0 + (cellSize * 0.75) * i;
				return x1;
			})
	  	.attr('y', function(d,i) {
	  	  	return height * 0.9;
	  	}) 
			.attr('width', cellSize * 0.75)
			.attr('height', cellSize * 0.75)
			.attr('fillStyle', function(d) { return d.colour; });


		var legendText = custom.selectAll('custom.legend-text')
			.data(legendData);
			
		legendText.enter()
			.append('custom')
			.attr('class', 'legend-text')
			.attr('fillStyle', function(d) { return d.colour; })
			.attr('x', function(d,i) {
				var x0 = width/2 - (cellSize * 0.75) * (colRangeLgth/2) - 10, // - 10 is a hard coded offset for the first number
						x1 = width/2 + (cellSize * 0.75) * (colRangeLgth/2) + 2.5; // + 2.5 is a hard coded offset for the last number
				if (i === 0) {
					return x0;
				} else if (i === colRangeLgth-1) {
					return x1;
				}
			})
	  	.attr('y', function(d,i) { return height * 0.9 + cellSize/2; }) 
			.attr('text', function(d, i) { 
				if (i === 0) {
					return d.rangeStart;
				} else if (i > 0 && i < legendData.length-1) {
					return '';
				} else {
					return d.rangeStop + ' medals';
				}
			});


		legendText
			.merge(legendText)
			.attr('text', function(d, i) { 
				if (i === 0) {
					return d.rangeStart;
				} else if (i > 0 && i < legendData.length-1) {
					return '';
				} else {
					return d.rangeStop + ' medals';
				}
			});


	} // databind()


	// === Draw canvas === //

	function draw(canvas, hidden) {

		var context = canvas.node().getContext('2d'); // define respective canvas (main or hidden)


		// clear canvas

		context.fillStyle = '#fff';
		context.fillRect(0, 0, width, height);


		// draw each individual custom element with their properties

		var elements = custom.selectAll('custom.rect'); // this is the same as the join variable, but used here to draw

		elements.each(function(d,i) {

			var node = d3.select(this);
			context.fillStyle = hidden ? node.attr('fillStyleHidden') : node.attr('fillStyle'); // node colour depends on the canvas we draw
			context.fillRect(node.attr('x'), node.attr('y'), node.attr('width'), node.attr('height'))

		}); // for each virtual/custom element...


		if (!hidden) {

			drawLegend();

		}

		function drawLegend() {


			// draw legend rects

			var legendElements = custom.selectAll('custom.legend-rect');

			legendElements.each(function(d, i) {

				var node = d3.select(this);
				context.fillStyle = node.attr('fillStyle');
				context.fillRect(node.attr('x'), node.attr('y'), node.attr('width'), node.attr('height'))

			});


			// draw legend text

			var legendText = custom.selectAll('custom.legend-text');

			legendText.each(function(d, i) {

				var node = d3.select(this);
				context.fillStyle = node.attr('fillStyle');
				context.fillText(node.attr('text'), node.attr('x'), node.attr('y'));

			});

		} // drawLegend()

	} // draw()



	// === Listeners / Handlers === //


	// --- Select event --- ///

	d3.select('select').on('change', function() {

		databind(data[this.value]); // ...then update the databind function
		
		var t = d3.timer(function(elapsed) {
			draw(mainCanvas);
			if (elapsed > 500) t.stop();
		}); // start a timer that runs the draw function for 500 ms (this needs to be higher than the transition in the databind function)

	}); // select listener/handler



	// --- Tooltip --- //

	d3.select('.main-canvas').on('mousemove', function() {

		draw(hiddenCanvas, true); // we only need to draw the hidden canvas when mousing

		// necessary values to calculate tooltip position
		var canvasPos = getWindowOffset(this); // get the canvas left and top position
		var tip = d3.select('.tooltip-center').node(); // cache the tooltip element
		var tipDim = tip.getBoundingClientRect(); // get the tooltip width and height
		var arrowDim = parseInt(window.getComputedStyle(tip, ':after').getPropertyValue('border-width'),10); // get the border-width of the arrow


		// get the mouse-positions on the main canvas
		var mouseX = d3.event.layerX;
		var mouseY = d3.event.layerY;

		// log('canvasPos', canvasPos, 'tip', tip, 'tipDim', tipDim, 'arrowDim', arrowDim)
		

		// get the toolbox for the hidden canvas to pick the colours from where our mouse is, then stringify it in a way our map-object can read it
		var hiddenCtx = hiddenCanvas.node().getContext('2d');
		var col = hiddenCtx.getImageData(mouseX, mouseY, 1, 1).data;
		var colKey = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
		

		// get the data from our map !
		var nodeData = colourToNodeGrid[colKey];

		// if we found some data under our mouse write a tooltip
		if (nodeData) {

			// log(nodeData);

			if (tipDim.width/2 < nodeData.x) {

				// log('tipDim.width/2', tipDim.width/2, 'nodeData.x', nodeData.x, 'central');
				// log('node position within canvas', nodeData.y,'\n + canvas position relative to window', Math.round(canvasPos.top),'\n - height of tooltip', tipDim.height,'\n - border-width of triangle', arrowDim);

				// if the tooltip fits comfortably next our left canvas border draw the tooltip with a central arrow				

				d3.select('.tooltip-left').style('opacity', 0); // ..while getting rid of the other one

				tip = d3.select('.tooltip-center')
					.style('top', nodeData.y + canvasPos.top - tipDim.height - arrowDim + 'px') // nodeData.x = node position within canvas. canvasPos = canvas position relative to viewport (so this changes when we scroll). tipDim.height = height of tooltip. arrowDim = border-width of triangle 
					.style('left', nodeData.x + canvasPos.left - tipDim.width/2 + cellSize/2 + 'px') // as above but removing (width of tooltip / 2) and adding half of cellSize to hit the center 
					.style('opacity', 0.99); // show if we hover over a node

			} else {

				// log('tipDim.width/2', tipDim.width/2, 'nodeData.x', nodeData.x, 'left');
				// log('node position within canvas', nodeData.y,'\n + canvas position relative to window', Math.round(canvasPos.top),'\n - height of tooltip', tipDim.height,'\n - border-width of triangle', arrowDim);

				// if the tooltip doesn't fit comfortably next our left canvas border draw the tooltip with a left arrow

				d3.select('.tooltip-center').style('opacity', 0); // ..while getting rid of the other one

				tip = d3.select('.tooltip-left')
					.style('top', nodeData.y + canvasPos.top - tipDim.height - arrowDim + 'px') // same as for the normal tooltip
					.style('left', nodeData.x + canvasPos.left - arrowDim + cellSize/2 + 'px') // as above but removing half teh arrow-width and adding half the cell size
					.style('opacity', 0.99); // show if we hover over a node

			} // conditional determining the type of tooltip (left arrow or central arrow)

		} // tooltip conditioned on a node being under our mouse


		// Set tooltips to opaque if we're not on a node 

		if (nodeData === undefined) {

			d3.select('.tooltip-center').style('opacity', 0);
			d3.select('.tooltip-left').style('opacity', 0);

		}

		buildTip(nodeData, tip); // build the html

	}); // canvas hover listener/handler




	// === Build the tooltip HTML === //

	var block = [];

	function buildTip(node_data, selection) {


		node_data ? block.push(node_data) : block = []; // Create condition to only build a tooltip the first time data gets added

		if (node_data && block.length === 1) {

			d3.selectAll('.tooltip-center *').remove();
			d3.selectAll('.tooltip-left *').remove();''

		  selection.append('div').attr('id', 'tip-header-grid');
		  selection.append('div').attr('id', 'tip-visual-grid');
		  selection.append('div').attr('id', 'tip-body-grid');

			var image = '../images/flags/4x3/' + node_data.image_name;

		  // ! change image source when wiring this up !

		  // --- Draw header with image and country name --- //

		  d3.select('#tip-header-grid')
		  	.append('img')
		  	.attr('src', image)
		  	.attr('alt', node_data.nation);

		  d3.select('#tip-header-grid')
		  	.append('div')
		  	.html(node_data.nation);


		  // --- Draw visualisation --- //

		  // Set up SVG
		  var margin = { top: 5, right: 10, bottom: 5, left: 10 }
		  var width = 180 - margin.left - margin.right;
		  var height = 20 - margin.top - margin.bottom;

		  var g = d3.select('#tip-visual-grid')
		  	.append('svg')
		  	.attr('id', 'medalTable')
		  	.attr('width', width + margin.left + margin.right)
		  	.attr('height', height + margin.top + margin.bottom)
		  	.append('g')
		  	.attr('transform', 'translate('+ margin.left +', '+ margin.top +')');

		  // Prep data
		  var eventData = data.nations_grid[node_data.place_id]; // 'data' is global - accessing the current event through the place_id variable - just needed for the medal extent
		  var extentMedals = d3.extent(eventData, function(d) { return d.medals; });

		  var medalData = [];
		  d3.range(node_data.bronze).forEach(function(el) { return medalData.push('bronze'); });
		  d3.range(node_data.silver).forEach(function(el) { return medalData.push('silver'); });
		  d3.range(node_data.gold).forEach(function(el) { return medalData.push('gold'); });

			// Measure data
		  var scale = d3.scaleLinear().domain([0, extentMedals[1]]).range([0, width]);

		  // Build visual
		  var medals = g.selectAll('.medals')
		  	.data(medalData)
		  	.enter()
		  	.append('circle')
		  	.classed('medals', true)
		  	.attr('cx', function(d, i) { return scale(i); })
		  	.attr('cy', function(d) { return d === 'gold' ? 3 : d === 'silver' ? 5 : 7; })
		  	// .attr('cy', 5)
		  	.attr('r', 2)
		  	.attr('fill', function(d) { return d === 'gold' ? 'gold' : d === 'silver' ? 'silver' : '#CD7f32'; });


		  // --- Add text in tooltip body --- //

		  var tipBodyHtml =
		    '<p>Gold: ' + node_data.gold + ' &middot; Silver: ' + node_data.silver + ' &middot; Bronze: ' + node_data.bronze + '</p>' +
		    '<p>Total: ' + node_data.medals + ' medals</p>' +
		    (isNaN(node_data.team_size) ? '' : '<p>Team Size: ' + node_data.team_size + '</p>') +
		    (isNaN(node_data.team_size) ? '' : '<p>Medals per athlete: ' + Math.round(node_data.medals/node_data.team_size * 100) / 100 + '</p>');

		  d3.select('#tip-body-grid')
		  	.html(tipBodyHtml);


		} // conditional in order to build the tip

	} // buildTip()




} // makeGrid()

