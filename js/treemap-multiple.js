
// === The Treemap === //

function makeTreemapMultiple(container) {


	// --- Globals --- //

	var chartIndex = {}; 
	var colourToNodeTreemap = {};

	data.events.forEach(function(d, i) {

		colourToNodeTreemap[d.place_id] = {}; // a colour lookup for each event

		container.append('div').attr('class', 'treemap container' + i).attr('id', d.place_id); // create i container

		chartIndex[i] = chart().event(d.place_id); // create i composed charts

		d3.select('.container' + i).datum(data).call(chartIndex[i]); // make i charts

	}); // create html structure


	// d3.select('.container0').datum(data).call(chartIndex[0]); // debug
	// d3.select('.container1').datum(data).call(chartIndex[1]); // debug


	// --- Main function --- //

	function chart() {


		// === Globals === //

		var width = wWidth * 0.15;
		var height = width/2;

		var event = 'chamonix_1924';


		function my(selection) {

			selection.each(function (data, i) {

				var colour, colourText;
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

				} // genColor()



				// === Set up the canvas === //

				var mainCanvas = d3.select(this).append('canvas').attr('class', 'main-canvas treemap').attr('id', event).attr('width', width).attr('height', height);
				var hiddenCanvas = d3.select(this).append('canvas').attr('class', 'hidden-canvas tremap').attr('id', event).attr('width', width).attr('height', height);

				var customBase = document.createElement('custom');
				var custom = d3.select(customBase);





				// === Initial load === //

			  treeData(data.sports_treemap[event]);
				
				var t = d3.timer(function(elapsed) {
					draw(mainCanvas, false);
					if (elapsed > dur + 100) {
						drawText();
						getLabels();
						initLabels();
						t.stop();
					}
				}); // start a timer that runs the draw function for 500 ms (this needs to be higher than the transition in the databind function)



				// === Prep data === //

				var root;

				function treeData(data) {

					// console.log('data', data);

					// Get hierarchical object from our tsv data
					root = d3.stratify()
						.id(function(d) { return d.discipline; }) // the children
						.parentId(function(d) { return d.sport; }) // the parent
						(data);

					// Add a value property with the events data and sort the data according to best treemap practices (https://github.com/d3/d3-hierarchy#node_sort)
					root
						.sum(function(d) { return d.events; })
						.sort(function(a, b) { return b.height - a.height || b.events - a.events; });		

					// console.log('root', root);

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

					// console.log('nodes', nodes)

					// Colour scales
					var nodesMinusMax = nodes.filter(function(el) { return el.value < d3.max(nodes, function(d) { return d.value; }); }); // base data for the extent - excluding the value of the root node 
					var extent = d3.extent(nodesMinusMax, function(d) { return d.value; });

					// var colours = ['#adceff', '#0f6fff', '#0066f5'] // colour extent for piecewise linear scale
					var colours = ['#adceff', '#639afb', '#0066f5']; // colour extent for piecewise linear scale
					colour = d3.scaleLinear().domain([extent[0], d3.quantile(extent,0.5),extent[1]]).range(colours); // piecewise scale for the text showing all text in black apart from the biggest (= darkest) rectangles


					colourText = d3.scaleLinear().domain([extent[0], d3.quantile(extent,0.9),extent[1]]).range(['#000', '#000', '#fff']); // piecewise scale for the text showing all text in black apart from the biggest (= darkest) rectangles


					// console.log('nodesDisciplines descending', nodesDisciplines);


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
									colourToNodeTreemap[event][d.hiddenCol] = d;
								}
								return d.hiddenCol;
							})
							.attr('width', 0)
							.attr('height', 0)
							.attr('fillStyle', '#fff')
							.transition().duration(dur)
							.attr('width', function(d) { return d.x1 - d.x0; })
							.attr('height', function(d) { return d.y1 - d.y0; })
							.attr('fillStyle', function(d) { return colour(d.value); });


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
									colourToNodeTreemap[event][d.hiddenCol] = d;
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



				// --- function to draw the text (happens only once) --- //

				function drawText(){

					var context = mainCanvas.node().getContext('2d');

					var elements = custom.selectAll('custom.rect');

					elements.each(function(d, i) {

						var node = d3.select(this);

				 		if (d.children && d.parent) { // all non-leaf nodes and not the root node get some text

				 			// Base settings and variables

							context.fillStyle = '#444';
							context.font = '9px Open Sans';

							var rect = {
								w: d.x1 - d.x0,
								h: d.y1 - d.y0
							};

							var text = d.id.replace('Sport: ', '');
							var tWidth = context.measureText(text).width;

				 			// console.log(d.id + ' rect width:', rect.w, ' - text width:', tWidth);

				 			if (tWidth < rect.w) { // if it fits horizontally: write it

								context.fillText(text, +node.attr('x') + 3, +node.attr('y') + 10);

				 			} else { // if it doesn't fit horizontally

				 				if (tWidth < rect.h) { // if it fits vertically: rotate

									// rotate
									context.save();
									context.translate(+node.attr('x') + 9 + 2, +node.attr('y') + tWidth + 3); // +10 is font-size, +3 and +6 are paddings
									context.rotate(-Math.PI/2);
									context.fillText(text, 0, 0);
									context.restore();

				 				} else {

				 					text = trimTreeText(text, rect.w, context); // overwrite the text with the new trimmed text
									context.fillText(text, +node.attr('x') + 3, +node.attr('y') + 10);

				 				} // inner rotate conditional

				 			} // outer rotate conditional 



						}

					}); // loop through elements

				} // drawText()



				// --- Helper function trimming too long text --- //

				function trimTreeText(text, rectWidth, ctx) {

					var newText = text;
					var newTextWidth = ctx.measureText(newText).width;
					var context = ctx;

					if (newText.length < 2 || newTextWidth < rectWidth - 6) { // 6 is a padding

						return newText;

					} else {

						newText = text.slice(0,-2);
						return trimTreeText(newText, rectWidth, context);

					} // trim the text by 2 letters until the text is smaller than the rectangle's width or only 2 letters long.

				} // trimTreeText()


				// === Add labels === //

				// --- Create data for the label --- //


				var host, year, eventNum, chartHeadline, chartSubline;

				function getLabels() {

					host = data.events_force[event][0]['host_city'];
					year = data.events_force[event][0]['year'];
					eventNum = root.value; 
					chartHeadline = event === 'chamonix_1924' ? host + ' ' + year + ' (' + eventNum + ' events)' : host + ' ' + year + ' (' + eventNum + ')';

				}


				// --- Add labels --- //

				function initLabels(){

					// --- Add text --- //

					d3.select('div#' + event).append('div').attr('class', 'multiple header').attr('id', event).html(chartHeadline);


					// --- Position text (after waiting for canvases to be built) --- //
					
					var t = d3.timer(function(elapsed){

						if (elapsed > 150) {

							// --- Calculate positions (non-responsive ! tried canvas text which looked shit) --- //

							var canvasPosRel = { top: d3.select('canvas#' + event).node().offsetTop, left: d3.select('canvas#' + event).node().offsetLeft }; // relative to the #modal div (which is { position: relative; })
							var canvasDim = d3.select('canvas#' + event).node().getBoundingClientRect();
							var padding = canvasDim.height / 20;
							var headerDim = d3.select('.multiple.header#' + event).node().getBoundingClientRect();

							// --- Position text --- //

							d3.select('.multiple.header#' + event)
								.style('top', canvasPosRel.top - headerDim.height - padding + 'px')
								.style('left', canvasPosRel.left + canvasDim.width/2 - headerDim.width/2 + 'px');


							t.stop();

						} // timer conditional


					}); // d3.timer()

				} // initLabels()



				// === Interactivity === //

				var block = []; // array to block unnecessary re-loads

				mainCanvas.on('mousemove', function() {

					draw(hiddenCanvas, true);

					var mousePos = [d3.event.offsetX, d3.event.offsetY];

					// console.log('mouseX', mouseX, 'mouseY', mouseY);

					var hiddenCtx = hiddenCanvas.node().getContext('2d');

					var col = hiddenCtx.getImageData(mousePos[0], mousePos[1], 1, 1).data;
					var colKey = 'rgb('+ col[0] +','+ col[1] +','+ col[2] +')';

					var nodeData = colourToNodeTreemap[event][colKey];

					// console.log('nodeData', nodeData);

					var tip = d3.select('.tooltip');

					if (nodeData) {

						// necessary values to calculate tooltip position
						var canvasPos = getWindowOffset(this); // get the canvas left and top position
						var tipDim = tip.node().getBoundingClientRect(); // get the tooltip width and height

						
						if (tipDim.height < canvasPos.top) { // if there's enough head-space for the tooltip

							tip = d3.select('.tooltip')
								.style('top', mousePos[1] + canvasPos.top - tipDim.height - 5 + 'px') // mouse + canvas position - tip height - padding
								.style('left', mousePos[0] + canvasPos.left - tipDim.width/2 + 'px') // mouse + canvas position - half the tip width
								.style('opacity', 0.99);

						} else {

							tip = d3.select('.tooltip')
								.style('top', mousePos[1] + canvasPos.top + 5 + 'px') // mouse + canvas position + padding
								.style('left', mousePos[0] + canvasPos.left - tipDim.width/2 + 'px') // mouse + canvas position - half the tip width
								.style('opacity', 0.99);

						}


						block.push(nodeData.id); // nodeData.id under the mouse gets pushed to array every mousemove
						if (block.length > 2) block.shift(); // if this array gets longer than 2, remove the first element array (the 'old' one)
						if (block[1] !== block[0]) buildTip(tip, nodeData); // only if the two elements differ - as in we hovered over a new area - build it.

					} 

				}); // canvas listener 



				mainCanvas.on('mouseout', function() { 

					block = [];
					d3.selectAll('.tooltip').transition().duration(100).style('opacity', 0); 

				}); // making sure tooltip disappears when mouse beyond treemap



				function buildTip(selection, data) {


					// straight cleaning for simplicity

					d3.selectAll('.tooltip *').remove();


					// add header and body div's

					selection.append('div').attr('id', 'tip-header-treemap');
					selection.append('div').attr('id', 'tip-body-treemap');

					var totalEvents = data.ancestors()[data.ancestors().length-1].value;
					var eventRatio = Math.floor((data.value / totalEvents)*100);

					d3.select('#tip-header-treemap').html('Number of events<br><span class="small">' + eventRatio + '% from a total of ' + totalEvents + ' events</span>');


					// Sizes

					var margin = { top: 5, right: 20, bottom: 5, left: 90 };
					var width = 200 - margin.left - margin.right;
					var height = 200 - margin.top - margin.bottom;


					// Scales and Axis

					var extent = d3.extent(nodesDisciplines, function(d) { return d.value; });		
					var x = d3.scaleLinear().domain([0, extent[1]]).range([0, width]);
					var y = d3.scaleBand().domain(nodesDisciplines.map(function(d) { return d.id; })).rangeRound([0, height]);
					var yAxis = d3.axisLeft(y).tickSize(0).tickPadding(6);


					// Add SVG and g's

					var g = d3.select('#tip-body-treemap')
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
						.style('stroke', function(d) { return d.id === data.id ? '#fbc463' : '#eee'; })
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
						.style('fill', function(d) { return d.id === data.id ? '#fbc463' : '#eee'; });


					// Add text label to currrent lollipop

					d3.select('text.value').remove();

					var fontSize = parseInt(d3.select('.tick text').style('font-size').replace('px',''),10); // Font size of axis labels

					g.append('text')
						.attr('class', 'value')
						.attr('x', x(data.value) + 5) // value plus a bit of padding
						.attr('y', y(data.id) + y.bandwidth()/2 + fontSize/4) // this is how the labels align central
						.attr('font-size', fontSize)
						.attr('fill', '#fbc463')
						.attr('text-anchor', 'start')
						.text(data.value);


					// Change axis label colour

					var thisLabel = getAxisLabel(data.id);

					d3.selectAll('.tick text').attr('fill', '#eee');

					thisLabel.attr('fill', '#fbc463');

				} // buildTip()


// */

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

} // makeTreemapMultiple()
