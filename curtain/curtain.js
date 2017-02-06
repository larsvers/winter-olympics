// === Curtain removal === //
// the intro screen will be the curtain and upon scroll we also want to trigger zoom-in from finished scroll //


function unwrap(selector) {

	var el = document.querySelector(selector); // select element to unwrap (the container element)

	var parent = el.parentNode; // get the element's parent node

	while (el.firstChild) parent.insertBefore(el.firstChild, el); // move all children out of the element

	parent.removeChild(el); // remove the empty element

} // unwrap()


function removeCurtain() {

	d3.select('div#container').style('position', 'relative');
	d3.select('div#curtain').remove();

} // set the container to fixed

function dimCurtain(percent) {

	d3.select('div#curtain').style('opacity', percent);

} // dim the curtain while scrolling

function scrollHandler() {

	var bodyHeight = document.body.scrollHeight;
  var scrollTop = document.body.scrollTop;
  var winHeight = window.innerHeight;

  var progress = 1.25 - (scrollTop / winHeight);
  if (progress > 1) progress = 1; // start dimming after 25% page-scroll

  dimCurtain(progress);

	if (bodyHeight*0.99 < scrollTop + winHeight) {

		removeCurtain();
		unwrap('#container'); // remove #container as it's unneccessary markup and doesn't allow operation of its children for reasons I am to tired to explore
		document.removeEventListener('scroll', scrollHandler);

	}


} // scrollHandler()


document.addEventListener('scroll', scrollHandler);



// === Globals === //


var data, nodes = {};
var width = window.innerWidth, height = window.innerHeight;
var simulation;


// === Olympic ring position calculations === //

var ringCalculations = function() {

	// --- Algorithm to calculate Olympic ring positions and sizes --- //

	// height/width ratio = 0.45 (measured from Olympic rings)
	// radius = height / 3

	// 1. Calculate Olympic ring area width = width/2
	// 2. Calculate height =  width * 0.45
	// 3. Calculate radius = height / 3
	// 4. Establish area orign = 0 + window.innerWidth / 4

	// 5. Calculate top left ring center: x = origin + radius, y = origin + radius
	// 6. Caluclate top middle ringe center: x = origin + area width/2, y = origin + radius
	// 7. Calculate top right ring center: x = origin + area width - radius, y = origin + radius

	// 8. Calculate ring distance = top middle center x - top left center x

	// 9. Calculate bottom left ring center: x = origin + radius + (ring distance)/2, y = area height - radius 
	// 10. Calculate bottom right ring center: x = origin + area width/2 + (ring distance)/2, y = area height - radius 

	// Result object

	var result = {};

	// Position variables

	var margin = 20;

	result.clusterN = 5;
	result.n = 200;


	// Ring area

	var origin = {};

	var areaWidth = window.innerWidth * 0.75 > 750 ? 750 : window.innerWidth * 0.75; // change to change overall ring area size
	var areaHeight = areaWidth * 0.45;
	result.radius = areaHeight / 3;
	origin.x = (window.innerWidth - areaWidth)/2; // change to change position
	origin.y = (window.innerHeight - areaHeight)/2;

	// Ring centers

	var rings = { topLeft: {}, topMiddle: {}, topRight: {}, bottomLeft: {}, bottomRight: {} };

	rings.topLeft.x = origin.x + result.radius;
	rings.topLeft.y = origin.y + result.radius;
	rings.topMiddle.x = origin.x + areaWidth/2;
	rings.topMiddle.y = origin.y + result.radius;
	rings.topRight.x = origin.x + areaWidth - result.radius;
	rings.topRight.y = origin.y + result.radius;

	var ringDistance = rings.topMiddle.x - rings.topLeft.x;

	rings.bottomLeft.x = origin.x + areaWidth/2 - ringDistance/2;
	rings.bottomLeft.y = origin.y + areaHeight - result.radius;
	rings.bottomRight.x = origin.x + areaWidth/2 + ringDistance/2;
	rings.bottomRight.y = origin.y + areaHeight - result.radius;

	result.olympic = {
		0: [rings.topLeft.x, rings.topLeft.y],
		1: [rings.topMiddle.x, rings.topMiddle.y],
		2: [rings.topRight.x, rings.topRight.y],
		3: [rings.bottomLeft.x, rings.bottomLeft.y],
		4: [rings.bottomRight.x, rings.bottomRight.y]
	};

	result.start = {
		0: [rings.topLeft.x, 0],
		1: [rings.topMiddle.x, 0],
		2: [rings.topRight.x, 0],
		3: [rings.bottomLeft.x, 0],
		4: [rings.bottomRight.x, 0]
	};

	return result;

}; // ringCalculations()


// === Set up canvas and elements === //

var canvas = d3.select('#curtain .top').append('canvas').attr('id', 'curtain').attr('width', width).attr('height', height);

var context = canvas.node().getContext('2d');

var customBase = document.createElement('custom');

var custom = d3.select(customBase);


// === Get simulation data === //

function getData(clusterNumber, nodeNumber, clusterCenter, circleRadius) {

	var nodes = [];

	d3.range(clusterNumber).forEach(function(el) {

		d3.range(nodeNumber).forEach(function(elt) {

			var obj = {};
			obj.cluster = el;
			obj.radius = 2;
			obj.colour = '#fff';
			obj.x = clusterCenter[el][0] + circleRadius * Math.cos((2*Math.PI)*(elt/nodeNumber)) + Math.random()*10;
			obj.y = clusterCenter[el][1] + circleRadius * Math.sin((2*Math.PI)*(elt/nodeNumber)) + Math.random()*10;

			nodes.push(obj);

		}); // create circle

	}); // loop through each cluster

	return nodes;

} // getData()



// === databind options === //

function databind(data) {

	var join = custom.selectAll('custom.circles')
		.data(data);

	var enterSel = join.enter()
		.append('custom')
		.classed('circles', true)
		.attr('cx', function(d) { return d.x; })
		.attr('cy', -10)
		.attr('r', function(d) { return d.radius; })
		.attr('fillStyle', '#5892A9');

	join
		.merge(enterSel)
		.transition().duration(5000)
		.delay(function(d,i) { return (Math.random()*i) / nodes.pos.n * 1000; })
		.attr('fillStyle', function(d) { return d.colour; })
		.attr('cy', function(d) { return d.y; });

	var exitSel = join.exit()
		.transition().duration(5000)
		.delay(function(d,i) { return (Math.random()*i) / n * 1000; })
		.attr('cy', height + 10)
		.remove();

} // databind()


function draw() {

	context.clearRect(0, 0, width, height);

	var elements = custom.selectAll('custom.circles');

	elements.each(function(d,i) {

		var node = d3.select(this);

		context.beginPath();
		context.moveTo(node.attr('cx') + node.attr('r'), node.attr('cy'));
		context.arc(node.attr('cx'), node.attr('cy'), node.attr('r'), 0, 2 * Math.PI);
		context.fillStyle = node.attr('fillStyle');
		context.fill();

	});

} // draw()




function initSimulation(nodes) {

	simulation = d3.forceSimulation(nodes)
		.force('charge', d3.forceManyBody().strength(-0.04));
		
	simulation.on('tick', function() { ticked(nodes); });

} // Set up the simulation 

function contractSim(strength, alpha) {

	simulation.stop();

	simulation
		.force('charge', d3.forceManyBody().strength(strength)) 
		.force('collide', d3.forceCollide().strength(0));

	simulation.alpha(alpha).restart();

} // Set up the simulation 

function expandSim(strength, alpha) {

	simulation.stop();

	simulation
		.force('charge', d3.forceManyBody().strength(strength)) 
		.force('collide', d3.forceCollide().strength(0));

	simulation.alpha(alpha).restart();

} // Set up the simulation 


function ticked(nodes) {

	context.clearRect(0, 0, width, height);
	context.save();
	nodes.forEach(drawNode);
	context.restore()

} // ticked()


function drawNode(d) {

	context.beginPath();
	context.moveTo(d.x + d.radius, d.y);
	context.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
	context.fillStyle = d.colour;
	context.fill();

} // drawNode()




// === Calls === //

nodes.pos = ringCalculations();

nodes.center = getData(nodes.pos.clusterN, nodes.pos.n, nodes.pos.olympic, nodes.pos.radius);

databind(nodes.center);

var t = d3.timer(function(elapsed) {
	draw(); 
	if (elapsed > 15000) t.stop();
}); // timer()




function remove() {

	databind([]);

	var t = d3.timer(function(elapsed) {
		draw(); 
		if (elapsed > 15000) t.stop();
	}); // timer()


} // remove() - yet unused
