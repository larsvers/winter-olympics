
// === The Grid === //

function makeGridMultiple(container) {




	var chartIndex = {}; 
	var colourToNodeGridMulti = {}; // define outside make chart as d3 element update will only fill this once as joing lives on even beyond redraw.

	data.events.forEach(function(d, i) {

		colourToNodeGridMulti[d.place_id] = {}; // a colour lookup for each event

		container.append('div').attr('class', 'grid container' + i).attr('id', d.place_id); // create i container

		chartIndex[i] = chart().event(d.place_id); // create i composed charts

		d3.select('.container' + i).datum(data).call(chartIndex[i]); // make i charts



	}); // create html structure

	// d3.select('.container0').datum(data).call(chartIndex[0]); // debug
	// d3.select('.container1').datum(data).call(chartIndex[1]); // debug


	// --- Main function --- //

	function chart(selection) {

		
		// === Set up canvas and picking === //

		var width = wWidth * 0.15;
		var height = width/2;

		var event = 'chamonix_1924';

		function my(selection) {

			selection.each(function (data, i) {


				var mainCanvas = d3.select(this).append('canvas').attr('class', 'main-canvas grid').attr('id', event).attr('width', width).attr('height', height);
				var hiddenCanvas = d3.select(this).append('canvas').attr('class', 'hidden-canvas grid').attr('id', event).attr('width', width).attr('height', height);


				// function to create new colours for the picking

				var nextCol = 1;

				function genColor(){

				  var ret = [];
				  // via http://stackoverflow.com/a/15804183
				  if(nextCol < 16777215){
				    ret.push(nextCol & 0xff); // R
				    ret.push((nextCol & 0xff00) >> 8); // G 
				    ret.push((nextCol & 0xff0000) >> 16); // B

				    nextCol += 10;
				  }
				  var col = "rgb(" + ret.join(',') + ")";
				  return col;

				} // genColor()



				// === Bind data to custom elements === //

				var customBase = document.createElement('custom');
				var custom = d3.select(customBase); // this is our svg replacement


				// settings for a grid with 40 cells in a row and 2x5 cells in a group

				var groupSpacing = 2;
				var cellSpacing = 2;
				var offsetTop = height / 3.5;
				var offsetSide = width * 0.075;
				var cellSize = (width - 20*cellSpacing - 3*groupSpacing - 2*offsetSide) / 20;


				// === Create data for the label === //

				// log(data.nations_grid[event]);
				// log(data.events_force[event]);

				var host = data.events_force[event][0]['host_city'];
				var year = data.events_force[event][0]['year'];
				var topNation = data.events_force[event][0]['top_nation'];
				var maxMedals = d3.max(data.nations_grid[event], function(d) { return d.medals; }); 
				var chartHeadline =  host + ' ' + year ;
				var chartSubline = 'Top nation: ' + topNation + ' (' + maxMedals + ')';




				// Bind and draw the data

				var t = d3.timer(function(elapsed) {

				  if (elapsed > 500) {
				  	databind(data.nations_grid[event]); // ...then update the databind function
				  	draw(mainCanvas);
				  	initLabels();
				  	t.stop();
				  }

				}); // start a timer until elements have been created to calculate positions



				function databind(data) {

					// log(data);

					// --- Scales --- //

					var extent = d3.extent(data, function(d) { return d.medals; });
					var colours = ['#adceff', '#88b5ff', '#639afb', '#3f81fa', '#0066f5'] // blue to blue
					var numberScale = d3.scaleQuantile().domain(extent).range(colours); // Lch colour scale picked from http://davidjohnstone.net/pages/lch-lab-colour-gradient-picker


					// --- Bind --- //

					var joinGridMultiple = custom.selectAll('custom.rect-multiple')
						.data(data.sort(function(a, b) {
								// 4 levels of sorting (if medals are equal, sort by gold, if gold is equal sort by silver...)
								if (a.medals < b.medals) return -1;
								if (a.medals > b.medals) return 1;
								if (a.gold < b.gold) return -1;
								if (a.gold > b.gold) return 1;
								if (a.silver < b.silver) return -1;
								if (a.silver > b.silver) return 1;
								if (a.bronze < b.bronze) return -1;
								if (a.bronze > b.bronze) return 1;
							}, function(d) { return d.nation; 
						}))
						.enter()
						.append('custom')
						.attr('class', 'rect-multiple')
						.attr('width', cellSize)
						.attr('height', cellSize)
						.attr('x', function(d,i) {
							var x0 = Math.floor(i % 20); // 0-19 back to 0
							var x1 = Math.floor(i/5) % 4; // increases by 1 every 5 and gets back to 0 after 20
							d.x = offsetSide + x0 * cellSize + x0 * cellSpacing + x1 * groupSpacing; // save the position for the tooltip later
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

							// if (!d.hiddenCol) { // for some reason the first event ('chamonix_1924') already gets a hiddenCol before coming here. Don't know why - but excluding this condition works.
									
							d.hiddenCol = genColor();

							colourToNodeGridMulti[event][d.hiddenCol] = d;



							// } // here we (1) add a unique colour as property to each element and (2) map the colour to the node in the colourToNodeGrid-dictionary 

							return d.hiddenCol;

						});


				} // databind()


				// === Draw canvas === //

				// var blockText = 0;

				function draw(canvas, hidden) {

					var context = canvas.node().getContext('2d'); // define respective canvas (main or hidden)


					// clear canvas

					context.clearRect(0, 0, width, height);


					// draw each individual custom element with their properties

					var elements = custom.selectAll('custom.rect-multiple'); // this is the same as the join variable, but used here to draw

					elements.each(function(d,i) {


						var node = d3.select(this);

						context.fillStyle = hidden ? node.attr('fillStyleHidden') : node.attr('fillStyle'); // node colour depends on the canvas we draw
						context.fillRect(node.attr('x'), node.attr('y'), node.attr('width'), node.attr('height'))


					}); // for each virtual/custom element...


					// log('draw');

					// blockText++;

					// if (blockText === 1 && !hidden) drawText(context);


				} // draw()



				// === Add labels === //

				function initLabels(){

					// --- Add text --- //

					d3.select('div#' + event).append('div').attr('class', 'multiple header').attr('id', event).html(chartHeadline);
					d3.select('div#' + event).append('div').attr('class', 'multiple subline').attr('id', event).html(chartSubline);


					// --- Position text (after waiting for canvases to be built) --- //
					
					var t = d3.timer(function(elapsed){

						if (elapsed > 150) {

							// --- Calculate positions (non-responsive ! tried canvas text which looked shit) --- //

							var canvasPosRel = { top: d3.select('canvas#' + event).node().offsetTop, left: d3.select('canvas#' + event).node().offsetLeft }; // relative to the #modal div (which is { position: relative; })
							var canvasDim = d3.select('canvas#' + event).node().getBoundingClientRect();
							var padding = canvasDim.height / 20;
							var headerDim = d3.select('.multiple.header#' + event).node().getBoundingClientRect();
							var sublineDim = d3.select('.multiple.subline#' + event).node().getBoundingClientRect();

							// --- Position text --- //

							d3.select('.multiple.header#' + event)
								.style('top', canvasPosRel.top + padding + 'px')
								.style('left', canvasPosRel.left + canvasDim.width/2 - headerDim.width/2 + 'px');

							d3.select('.multiple.subline#' + event)
								.style('top', canvasPosRel.top + canvasDim.height - padding - sublineDim.height + 'px')
								.style('left', canvasPosRel.left + canvasDim.width/2 - sublineDim.width/2 + 'px');


							t.stop();

						}


					}); // d3.timer()

				} // initLabels()




				// === Listeners / Handlers === //


				// --- Updating the grid when chapter changes (as in 'chamonix_1924' to 'stmoritz_1928' --- //



				// --- Tooltip --- //

				var bounce = 0;

				d3.select('.main-canvas#' + event).on('mousemove', function() {

					bounce++;

					if (bounce < 100) draw(hiddenCanvas, true);  // we only need to draw the hidden canvas once when mousing

					

					// necessary values to calculate tooltip position
					var canvasPos = getWindowOffset(this); // get the canvas left and top position
					var tip = d3.select('.tooltip-center').node(); // cache the tooltip element
					var tipDim = tip.getBoundingClientRect(); // get the tooltip width and height
					var arrowDim = parseInt(window.getComputedStyle(tip, ':after').getPropertyValue('border-width'),10); // get the border-width of the arrow


					// get the mouse-positions on the main canvas
					var mouseX = d3.event.layerX;
					var mouseY = d3.event.layerY;

					// log('canvasPos.top', canvasPos.top, 'tipDim.height', tipDim.height, 'arrowDim', arrowDim)
					

					// get the toolbox for the hidden canvas to pick the colours from where our mouse is, then stringify it in a way our map-object can read it
					var hiddenCtx = hiddenCanvas.node().getContext('2d');
					var col = hiddenCtx.getImageData(mouseX, mouseY, 1, 1).data;
					var colKey = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
					
					// log(hiddenCanvas.attr('id'), colKey);

					// get the data from our map !
					var nodeData = colourToNodeGridMulti[event][colKey];
					
					// if we found some data under our mouse write a tooltip
					if (nodeData) {

						// log('grid-multiple', nodeData.nation, Math.round(nodeData.x), colourToNodeGrid);

						// log(nodeData);

						if (tipDim.height > canvasPos.top) {

							// log('low:', 'tipDim.height', tipDim.height, 'nodeData.y', nodeData.y);

							d3.select('.tooltip-center').style('opacity', 0); // ..while getting rid of the other one

							tip = d3.select('.tooltip-low')
								.style('top', canvasPos.top + nodeData.y + cellSize + arrowDim + 'px') // nodeData.x = node position within canvas. canvasPos = canvas position relative to viewport (so this changes when we scroll). tipDim.height = height of tooltip. arrowDim = border-width of triangle 
								.style('left', canvasPos.left + nodeData.x + cellSize/2 - tipDim.width/2 + 'px') // as above but removing (width of tooltip / 2) and adding half of cellSize to hit the center 
								.style('opacity', 0.99); // show if we hover over a node

						} else {

							// log('center:', 'tipDim.width', tipDim.width, 'nodeData.x', nodeData.x);

							// log('tipDim.width/2', tipDim.width/2, 'nodeData.x', nodeData.x, 'central');
							// log('node position within canvas', nodeData.y,'\n + canvas position relative to window', Math.round(canvasPos.top),'\n - height of tooltip', tipDim.height,'\n - border-width of triangle', arrowDim);

							// if the tooltip fits comfortably next our left canvas border draw the tooltip with a central arrow				

							d3.select('.tooltip-low').style('opacity', 0); // ..while getting rid of the other one

							tip = d3.select('.tooltip-center')
								.style('top', nodeData.y + canvasPos.top - tipDim.height - arrowDim + 'px') // nodeData.x = node position within canvas. canvasPos = canvas position relative to viewport (so this changes when we scroll). tipDim.height = height of tooltip. arrowDim = border-width of triangle 
								.style('left', nodeData.x + canvasPos.left - tipDim.width/2 + cellSize/2 + 'px') // as above but removing (width of tooltip / 2) and adding half of cellSize to hit the center 
								.style('opacity', 0.99); // show if we hover over a node

						} // conditional determining the type of tooltip (left arrow or central arrow)

					} // tooltip conditioned on a node being under our mouse


					// Set tooltips to opaque if we're not on a node 

					if (nodeData === undefined) {

						d3.select('.tooltip-center').transition().duration(50).style('opacity', 0);
						d3.select('.tooltip-left').transition().duration(50).style('opacity', 0);
						d3.select('.tooltip-low').transition().duration(50).style('opacity', 0);

					}


					buildTip(nodeData, tip); // build the html


				}); // canvas hover listener/handler


				d3.select('.main-canvas#' + event).on('mouseout', function() {

					d3.select('.tooltip-center').transition().duration(50).style('opacity', 0);
					d3.select('.tooltip-left').transition().duration(50).style('opacity', 0);
					d3.select('.tooltip-low').transition().duration(50).style('opacity', 0);				

				}); // mouseout listener

				// === Build the tooltip HTML === //

				var block = [];

				function buildTip(node_data, selection) {


					node_data ? block.push(node_data) : block = []; // Create condition to only build a tooltip the first time data gets added

					if (node_data && block.length === 1) {

						d3.selectAll('.tooltip-center *').remove();
						d3.selectAll('.tooltip-left *').remove();''
						d3.selectAll('.tooltip-low *').remove();''

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


			}); // selecction.each()

		} // my();


		// === Exposed variables === //

		my.width = function(_) {
			if(!arguments.length) return width;
			width = _;
			return my;
		} 

		my.height = function(_) {
			if(!arguments.length) return height;
			height = _;
			return my;
		} 

		my.event = function(_) {
			if(!arguments.length) return event;
			event = _;
			return my;
		} 

		return my;


	} // chart()

} // makeGridMultiple()