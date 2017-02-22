
// === The Force === //


// --- Main function --- //

function makeForce() {

	// console.log(node_data);
	
	// === Remove and reset width for redraw === //

	d3.selectAll('#force *').remove();


	// === Set up canvas === //

	var width = wWidth * 0.325, height = wHeight * 0.29;
	var simulation;
	var padding, canvasPos, canvasDim;

	// === Set up canvas === //

	var canvas = d3.select('#force').append('canvas').attr('class', 'main-canvas force').attr('width', width).attr('height', height);
	var context = canvas.node().getContext('2d');


	// === Get simulation data === //

	getSimulationData(startChapter); // this will move to the select handler later

	function getSimulationData(event) {


		var simulationData = data.events_force[event][0]; // get data

		var nodes = [];

		d3.range(simulationData.comp_men).forEach(function(el, i) {

			var obj = {};
			obj.gender = 'men';
			obj.cluster = 0;
			obj.radius = 2;
			obj.colour = '#639afb';
			obj.x = width/2 + (Math.random() - 10);
			obj.y = height/2 + (Math.random());

			nodes.push(obj);

		}); // get men nodes


		d3.range(simulationData.comp_women).forEach(function(el, i) {

			var obj = {};
			obj.gender = 'women';
			obj.cluster = 1;
			obj.radius = 2;
	    obj.colour = '#fbc463';
			obj.x = width/2 + (Math.random() + 10);
			obj.y = height/2 + (Math.random());

			nodes.push(obj);

		}); // get women nodes

		initSimulation(nodes);
		initLabels(simulationData); // draw labels

	} // getSimulationData()



	// === Set up simulation params === //

	function initSimulation(nodes) {

		// console.log(nodes);

		simulation = d3.forceSimulation(nodes)
			.alpha(0.3)
			.force('charge', d3.forceManyBody().strength(-5))
			.force('xPos', d3.forceX(width/2).strength(1))
			.force('yPos', d3.forceY(height/2).strength(1))
			.force('collide', d3.forceCollide(2));

		simulation.on('tick', ticked);

		function ticked() {


			context.clearRect(0, 0, width, height);
			context.save();

			nodes.forEach(drawNode);

			context.restore();

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


	} // Set up the simulation 





	// === Add labels === //

	function initLabels(data){

		// console.log(data);

		// --- Add text --- //

		var leftText = data.comp_men + ' <span class="blue">men</span> competing &middot; ' + formatPerc(1 - data.women_ratio) +' of total';
		var rightText = data.comp_women + ' <span class="orange">women</span> competing &middot; ' + formatPerc(data.women_ratio) +' of total';
		
		d3.select('.force-text#left').html(leftText);
		d3.select('.force-text#right').html(rightText);
		d3.select('.force-text#center').html('Just some calculations away - at 0%');

		// --- Position text --- //

		padding = 4;
		canvasPos = getWindowOffset(canvas.node());
		canvasDim = canvas.node().getBoundingClientRect();
		var leftDim = d3.select('#left').node().getBoundingClientRect();
		var rightDim = d3.select('#right').node().getBoundingClientRect();
		var centerDim = d3.select('#center').node().getBoundingClientRect();


		var positions = {
			leftText: {
				top: {
					wide: canvasPos.top + canvasDim.height - leftDim.height - padding + 'px',
					tight: canvasPos.top + canvasDim.height - 2 * leftDim.height - 2 * padding + 'px'
				},
				left: {
					wide: canvasPos.left + padding + 'px',
					tight: canvasPos.left + canvasDim.width/2 - leftDim.width/2 + 'px'
				}
			},
			rightText: {
				top: {
					wide: canvasPos.top + canvasDim.height - rightDim.height - padding + 'px',
					tight: canvasPos.top + canvasDim.height - rightDim.height - padding + 'px'
				},
				left: {
					wide: canvasPos.left + canvasDim.width - rightDim.width - padding + 'px',
					tight: canvasPos.left + canvasDim.width/2 - rightDim.width/2 + 'px'
				}
			},
			centerText: {
				top: canvasPos.top + canvasDim.height/2 - centerDim.height/2 + 'px',
				left: canvasPos.left + canvasDim.width/2 - centerDim.width/2 + 'px'
			}
		};


		var wide = leftDim.width + rightDim.width + 2 * padding < canvasDim.width ? true : false;

		d3.select('.force-text#left')
			.style('top', wide ? positions.leftText.top.wide : positions.leftText.top.tight)
			.style('left', wide ? positions.leftText.left.wide : positions.leftText.left.tight);

		d3.select('.force-text#right')
			.style('top', wide ? positions.rightText.top.wide : positions.rightText.top.tight)
			.style('left', wide ? positions.rightText.left.wide : positions.rightText.left.tight);

		d3.select('.force-text#center')
			.style('top', positions.centerText.top)
			.style('left', positions.centerText.left);


	} // initLabels()


	// --- Make header --- //

	var forceHeader = makeVisLabel().canvas(canvas).text('Athletes and Gender').position('top');

	d3.select('.vis-header#force').call(forceHeader);


	// --- Make multiple button --- //

	var forceMultiButton = makeMultipleButton().canvas(canvas).paddingFactor(3);
	
	d3.select('#force-multiple').call(forceMultiButton);


	// === Updates === //


	// --- Initial animation --- //
	// switched off due to perf reasons mainly.
	// switch on if you want the force to split on init. 

	var t = d3.timer(function(elapsed) {
		
		// if (elapsed > 2000) split();
		// if (elapsed > 4000) unite();
		// if (elapsed > 4500) t.stop();

	}); // timer


	// --- Updating the force when chapter changes (as in 'chamonix_1924' to 'stmoritz_1928' --- //

	updateForce = function(chapter) {

		getSimulationData(chapter);

	}; // updateForce()


	// --- Button listener --- //

	var buttonDim = {};
	buttonDim.split = d3.select('button#split').node().getBoundingClientRect();

	d3.select('button#split')
		.style('top', canvasPos.top + padding + 'px')
		.style('left', canvasPos.left + canvasDim.width - buttonDim.split.width - padding + 'px');


	var toggle = true;

	d3.select('button#split').on('mousedown', function() {

		toggle ? split() : unite();
		toggle ? d3.select(this).html('unite') : d3.select(this).html('split');
		toggle = !toggle;


	}); // split button listener


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


} // makeForce()

