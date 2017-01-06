
var log = console.log.bind(console);
var dir = console.dir.bind(console);


// Import scripts 

importScripts("https://d3js.org/d3-collection.v1.min.js");
importScripts("https://d3js.org/d3-dispatch.v1.min.js");
importScripts("https://d3js.org/d3-quadtree.v1.min.js");
importScripts("https://d3js.org/d3-timer.v1.min.js");
importScripts("https://d3js.org/d3-force.v1.min.js");

// Pick up messages from the main script

onmessage = function(e) {

	// This is all running synchronously

	// Get the data

	var nodes = e.data.nodes;
	var event = e.data.event;
	var width = e.data.width;
	var height = e.data.height;

	// Base simulation - 1

	var simulation = d3.forceSimulation(nodes)
		.alpha(0.85)
    .alphaMin(0.001) // <-- default
    .alphaDecay(1 - Math.pow(0.001, 1 / 50)) // we save a lot of time by adjusting the denominator (and hence reducing the max ticks from 300 to 50). Reduced calculation time for 22 forces from c. 220 sec to 22 sec - yay !
		.force('charge', d3.forceManyBody().strength(-3.125))
		.force('xPos', d3.forceX(width/2).strength(1))
		.force('yPos', d3.forceY(height/2).strength(1))
		.force('collide', d3.forceCollide(1.5))
		.stop();


	// Calculate the position for each tick manually (n explained: default total number of ticks per simulation (300, see https://github.com/d3/d3-force#simulation_alphaMin))

	for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {

    simulation.tick();

  }


  // // We could let it calculate the final positions but for performance reasons let it be like that

	// // Split simulation - 2 | time to complete: 135 sec's

	// simulation
	// 	.force('xPos', d3.forceX(function(d) { return d.cluster === 0 ? width * 0.3 : width * 0.7; }).strength(0.7) )
	// 	.force('yPos', d3.forceY(height/2).strength(0.7));

	// simulation.alpha(0.2).restart();


	// for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {

 //    simulation.tick();

 //  }


	// // Unite simulation - 3 | time to complete: 202 sec's

	// simulation
	// 	.force('xPos', d3.forceX(width/2).strength(0.5))
	// 	.force('yPos', d3.forceY(height/2).strength(0.5));

	// simulation.alpha(0.2).restart();


	// for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {

 //    simulation.tick();

 //  } 


	// log('from worker: event', event, 'result', nodes);

  // Send the calculated positions back to the main script in a new nodes object for drawing

  postMessage({ type: 'end', event: event, nodes: nodes });

  close();


}; // onmessage()