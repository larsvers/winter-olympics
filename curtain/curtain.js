
// === Curtain removal === //
// the intro screen will be the curtain and upon scroll we also want to trigger zoom-in from finished scroll //

function removeCurtain() {

	log('removing?');
	d3.select('div#container').style('position', 'relative');
	d3.select('div#curtain').remove();

} // set the container to fixed

function dimCurtain(percent) {

	log('scroll')
	d3.select('div#curtain').style('opacity', percent);

}

function scrollHandler() {

	var bodyHeight = document.body.scrollHeight;
  var scrollTop = document.body.scrollTop;
  var winHeight = window.innerHeight;

  var progress = 1.5 - (scrollTop / winHeight);
  if (progress > 1) progress = 1;

  dimCurtain(progress);

	if (bodyHeight*0.99 < scrollTop + winHeight) {

		removeCurtain();
		document.removeEventListener('scroll', scrollHandler);

	}


} // scrollHandler()

document.addEventListener('scroll', scrollHandler);



// === Globals === //


var data, nodes = {};
var width = window.innerWidth, height = window.innerHeight;
var simulation;

var margin = 20;

// position variables

var clusterN = 5;
var n = 200;
var ringRadius = 100;

var center = {}; // object to hold different circle-centers

center.olympic = {
	0: [(width-2*margin)*0.21+margin, (height-2*margin)*0.415+margin], 
	1: [(width-2*margin)*0.5+margin, (height-2*margin)*0.415+margin],
	2: [(width-2*margin)*0.79+margin, (height-2*margin)*0.415+margin],
	3: [(width-2*margin)*0.355+margin, (height-2*margin)*0.585+margin],
	4: [(width-2*margin)*0.645+margin, (height-2*margin)*0.585+margin]
};

center.start = {
	0: [(width-2*margin)*0.21+margin, -2*ringRadius],
	1: [(width-2*margin)*0.5+margin, -2*ringRadius],
	2: [(width-2*margin)*0.79+margin, -2*ringRadius],
	3: [(width-2*margin)*0.355+margin, -2*ringRadius],
	4: [(width-2*margin)*0.645+margin, -2*ringRadius]
};


// === Set up canvas and elements === //

// d3.select('#curtain .top').style('width', width + 'px').style('height', height + 'px');
// d3.select('#text-wrap').style('width', width + 'px').style('height', height + 'px');

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
		// .attr('fillStyle', '#ADCEFF');
		.attr('fillStyle', '#5892A9');

	join
		.merge(enterSel)
		.transition().duration(5000)
		.delay(function(d,i) { return (Math.random()*i) / n * 1000; })
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

		// log(node.attr('cx'), node.attr('cy'), node.attr('r'), node.attr('fillStyle'));

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

nodes.center = getData(clusterN, n, center.olympic, ringRadius);

// log(nodes.center);

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
