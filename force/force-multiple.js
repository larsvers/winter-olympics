

function makeForceMultiple(container) {


	var formatPerc = d3.format('.0%');

	var chartIndex = {}; 

	data.events.forEach(function(d, i) {

		container.append('div').attr('class', 'force container' + i).attr('id', d.place_id);

		chartIndex[i] = chart().event(d.place_id);

		d3.select('.container' + i).datum(data).call(chartIndex[i]);

	}); // create html structure


	// d3.select('.container21').datum(data).call(chartIndex[21]); // debug


	// === Main function === //

	function chart(selection) {

		// log(node_data);

		var width = wWidth * 0.15;
		var height = width;

		var event = 'chamonix_1924';

		function my(selection){


			selection.each(function(data,i) {

				// === Set up canvas === //

				var simulation;
				var padding, canvasPos = {}, canvasDim;

				// === Set up canvas === //

				var canvas = d3.select(this).append('canvas').attr('id', event).attr('width', width).attr('height', height);
				var context = canvas.node().getContext('2d');




				// === Get simulation data === //

				getSimulationData(event); // this will move to the select handler later

				function getSimulationData(event) {


					var simulationData = data.events_force[event][0]; // get data, taken from the global data object

					var nodes = [];

					d3.range(simulationData.comp_men).forEach(function(el, i) {

						var obj = {};
						obj.gender = 'men';
						obj.cluster = 0;
						obj.radius = 1.5;
						obj.colour = '#639afb';
						obj.x = width/2 + (Math.random() - 10);
						obj.y = height/2 + (Math.random());

						nodes.push(obj);

					}); // get men nodes


					d3.range(simulationData.comp_women).forEach(function(el, i) {

						var obj = {};
						obj.gender = 'women';
						obj.cluster = 1;
						obj.radius = 1.5;
				    obj.colour = '#fbc463';
						obj.x = width/2 + (Math.random() + 10);
						obj.y = height/2 + (Math.random());

						nodes.push(obj);

					}); // get women nodes

					initSimulation(nodes);
					initLabels() // draw labels

				} // getSimulationData()




				// === Set up simulation params === //

				function initSimulation(nodes) {

					// log(nodes);

					simulation = d3.forceSimulation(nodes)
						.alpha(0.3)
						.force('charge', d3.forceManyBody().strength(-1.5))
						.force('xPos', d3.forceX(width/2).strength(1))
						.force('yPos', d3.forceY(height/2).strength(1))
						.force('collide', d3.forceCollide(1.5));

					simulation.on('tick', ticked);

					function ticked() {


						context.clearRect(0, 0, width, height);
						context.save();

						nodes.forEach(drawNode);

						context.restore()

						// stop the simulation at alpha 0.1
						if (simulation.alpha() < 0.1) {
							simulation.stop()		
						}

					} // ticked()


					function drawNode(d) {

						// keep the nodes with the canvas bounds. Remove to let them free...
						d.x = Math.max(d.radius, Math.min(width - d.radius, d.x));
						d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));

						context.beginPath();
						context.moveTo(d.x + d.radius, d.y);
						context.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
						context.fillStyle = d.colour;
						context.fill();

					} // drawNode()


				} // initSimulation()




				// === Add labels === //

				function initLabels(){

					var d = data.events_force[event][0];
					// log(data);

					// --- Add text --- //

					var htmlHeader = d.host_city  + ' ' + d.year;
					var htmlFooter = d3.format(',')(d.comp_total) + ' athletes ' + '<span class="blue">' + formatPerc(1-d.women_ratio) + ' male</span>';

					d3.select('div#' + event).append('div').attr('class', 'multiple header').attr('id', event).html(htmlHeader);
					d3.select('div#' + event).append('div').attr('class', 'multiple footer').attr('id', event).html(htmlFooter);

					// --- Add button --- //

					var button = d3.select('div#' + event).append('button').attr('class', 'force-multiple').attr('id', event).html('&#9903;');


					// --- Position text and buttons (after waiting for canvases to be built) --- //
					
					var t = d3.timer(function(elapsed){

						if (elapsed > 150) {

							// --- Calculate positions (non-responsive !) --- //

							padding = 4;
							canvasPos = { top: d3.select('canvas#' + event).node().offsetTop, left: d3.select('canvas#' + event).node().offsetLeft }; // relative to the #modal div (which is { position: relative; })
							canvasDim = d3.select('canvas#' + event).node().getBoundingClientRect();
							var headerDim = d3.select('.multiple.header#' + event).node().getBoundingClientRect();
							var footerDim = d3.select('.multiple.footer#' + event).node().getBoundingClientRect();
							var buttonDim = d3.select('button.force-multiple#' + event).node().getBoundingClientRect();

							// log(event, 'canvasPos', canvasPos, 'canvasDim', canvasDim, 'headerDim', headerDim, 'footerDim', footerDim, '\n--------------------------------------------------\n ')
							// log(event, 'top', canvasPos.top, 'left', canvasPos.left, '\n--------------------------------------------------\n ')

							// --- Position text --- //

							d3.select('.multiple.header#' + event)
								.style('top', canvasPos.top + padding + 'px')
								.style('left', canvasPos.left + canvasDim.width/2 - headerDim.width/2 + 'px');

							d3.select('.multiple.footer#' + event)
								.style('top', canvasPos.top + headerDim.height + 'px')
								.style('left', canvasPos.left + canvasDim.width/2 - footerDim.width/2 + 'px');




							// --- Position button --- //

							button
								.style('top', canvasPos.top + canvasDim.height - buttonDim.height - padding + 'px')
								.style('left', canvasPos.left + canvasDim.width/2 - buttonDim.width/2 + 'px');


							// --- Register button listener --- //

							var toggle = true;

							button.on('mousedown', function() {

								toggle ? split() : unite();
								toggle ? d3.select(this).html('&#9901;') : d3.select(this).html('&#9903;');
								toggle = !toggle;

							}); // split button listener


							t.stop();

						}


					}); // d3.timer()



				} // initLabels()




				// === Updates === //


				// --- Initial animation --- //

				var t = d3.timer(function(elapsed) {

					if (elapsed > 100) split();
					if (elapsed > 8000) unite();
					if (elapsed > 8500) t.stop();

				}); // timer







				// --- Handlers --- //

				function split() {

					simulation.stop();

					simulation
						.force('xPos', d3.forceX(function(d) { return d.cluster === 0 ? width * 0.3 : width * 0.7; }).strength(0.7) )
						.force('yPos', d3.forceY(height/2).strength(0.7));

					simulation.alpha(0.2);

					simulation.restart();

				} // split()


				function unite() {

					simulation.stop();

					simulation
						.force('xPos', d3.forceX(function(d) { return d.cluster === 0 ? width * 0.5 : width * 0.5; }).strength(0.5))
						.force('yPos', d3.forceY(height/2).strength(0.5));

					simulation.alpha(0.2);

					simulation.restart();

				} // unite()



			}); // selection.each()

		} // my()



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


} // makeForce()