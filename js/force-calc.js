

function calculateForceNodes() {

	// console.log(data);

	var width = wWidth * 0.15, height = width; // this needs to be the same as in force-multiple-precalc.js (the script building the chart) 
	var resultObj = {}; // the associative array holding the nodes with the final positions
	var n = data.events.length; // the number of events for checking when all nodes from all events have been calculated
	var checkArray = []; // the array receiving each event-name as a string after this event's nodes have been calculated


	// --- Initialise calulation of nodes for each event --- //

	data.events.forEach(function(el, i) {

		console.time(el.place_id); // debug

		resultObj[el.place_id] = getInitialData(el.place_id);

		startWorker(resultObj[el.place_id], el.place_id, i);

	});



	// --- Get the inital nodes --- //

	function getInitialData(event) {

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

		return nodes;

	} // getSimulationData()


	// --- Start the worker --- //

	function startWorker(data, event, index) {

		// console.log('data', data, 'event', event, 'index', index);

		var worker = new Worker('./js/force-worker.js'); // the worker file should always be referenced relative to the root directory (/) not relative to the current directory of this file.

		worker.postMessage({ 
			nodes: data,
			event: event,
			width: width,
			height: height
	 });

		// worker.onmessage = function(e) {
		// console.log('nodes from force-calc: event:', e.data.event, 'nodes', e.data.nodes);
		// };

		worker.onmessage = onMessage;

	} // startWorker()


	// --- Receive data from the worker --- //

	function onMessage(e) {
		
		// get the data from the worker
		var event = e.data.event;
		var nodes = e.data.nodes;
		var type = e.data.type;

		// console.log('nodes from force-calc: event:', event, 'type', type);

		// tuck the calculated nodes away in the final associative array
		resultObj[event] = nodes;
		
		// when creating the resultObject via messaging the latest nodes object gets additionally added as a [object Messageevent], which we remove here.
		if (resultObj['[object MessageEvent]']) delete resultObj['[object MessageEvent]']; 
		
		// console.log('resultObj from force-calc', resultObj);

		// For each worker message add the event name to the array
		checkArray.push(event);

		forceNodesProgress = checkArray.length / n; // is a global as we also need access to it in main.js

    // console.log('Nodes position progress: ', formatPerc(forceNodesProgress)); // debug

    d3.select('.force-text#center').html('Just some calculations away - at ' + formatPerc(forceNodesProgress)); // write the progress to the visual

    if (forceNodesProgress === 1) { // once all node positions have been calculated

    	var t = d3.timer(function(elapsed) { 

    		if (elapsed > 500) { // hide the text and turn the button greenish

    			d3.select('.force-text#center').classed('non-visible', true);
    			d3.select('#force-multiple').style('background-color', 'rgba(150, 255, 150, .7)');
				}

				if (elapsed > 2000) { // then turn it back to normal again

    			d3.select('#force-multiple').style('background-color', null);
    			t.stop();

				} // conditional on elapsed

    	}); // timer to deal with text and multiple force button

    } // what happens when nodes are calculated


		// when we received all data from the worker add it to the global data object
		if (checkArray.length === n) { 

			data.force_positions = resultObj;

			forceNodes = true;  // Set forceNodes to true indicating that the node positions for the force have been calculated. They can now be initiated from main.js

		} // conditional


		console.timeEnd(event); // debug

	} // onMessage()




} // calculateForceNodes()




