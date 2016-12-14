
// === Utils === //

// var log = console.log.bind(console);
// var dir = console.dir.bind(console);
// var replace = function(string) { return string.replace(/[^a-z0-9]/gi,""); };


// === Globals === //

var data;
var width = 500, height = 250;
var simulation;
var formatPerc = d3.format('.0%')

// === Set up canvas === //

var canvas = d3.select('#container').append('canvas').attr('width', width).attr('height', height);

var context = canvas.node().getContext('2d');


// === Data === //

d3.tsv('../data/events.tsv', function(err, data) {

  var nested = d3.nest()
  	.key(function(d) { return d.place_id; })
  	.entries(data);

  data = {};

  nested.forEach(function(el) {

  	data[el.key] = el.values.map(function(el) {

		  return {

		    comp_total: parseInt(el.comp_total),
		    comp_men: parseInt(el.comp_men),
		    comp_women: parseInt(el.comp_women),
		    women_ratio: parseFloat(el.women_ratio),

		    sports: parseInt(el.sports),
		    disciplines: parseInt(el.disciplines),
		    events: parseInt(el.events),

		  }; // returned mapped object

		}); // map function

	}); // loop through nested


	log(data);
	makeDropdown(data);
	getSimulationData(data, 'chamonix_1924'); // this will move to the select handler later

}); // d3.tsv() load


// === Make dropdown === //

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


	d3.select('select').on('change', function() {

		getSimulationData(data, this.value);

	}); // select listener/handler


} // makeDropdown()


// === Get simulation data === //

function getSimulationData(data, event) {

	data = data[event][0]; // get data

	var nodes = [];

	d3.range(data.comp_men).forEach(function(el, i) {

		var obj = {};
		obj.gender = 'men';
		obj.cluster = 0;
		obj.radius = 2;
		obj.colour = '#639afb';
		obj.x = width/2 + (Math.random() - 10);
		obj.y = height/2 + (Math.random());

		nodes.push(obj);

	}); // get men nodes
	

	d3.range(data.comp_women).forEach(function(el, i) {

		var obj = {};
		obj.gender = 'women';
		obj.cluster = 1;
		obj.radius = 2;
    obj.colour = '#fbc463';
		obj.x = width/2 + (Math.random() + 10);
		obj.y = height/2 + (Math.random());

		nodes.push(obj);

	}); // get women nodes

	initSimulation(nodes); // kick off simulation
	initLabels(data)

} // getSimulationData()


// === Add labels === //

function initLabels(data){

	log(data);

	// --- Add text --- //

	var leftText = data.comp_men + ' men competing &middot; ' + formatPerc(1 - data.women_ratio) +' of total';
	var rightText = data.comp_women + ' women competing &middot; ' + formatPerc(data.women_ratio) +' of total';
	
	d3.select('#left').html(leftText);
	d3.select('#right').html(rightText);

	// --- Position elements --- //

	var canvasPos = canvas.node().getBoundingClientRect();
	var leftPos = d3.select('#left').node().getBoundingClientRect();
	var rightPos = d3.select('#right').node().getBoundingClientRect();
	var padding = 4;

	d3.select('#left')
		.style('top', canvasPos.top + canvasPos.height - leftPos.height - padding + 'px')
		.style('left', canvasPos.left + padding + 'px');

	d3.select('#right')
		.style('top', canvasPos.top + canvasPos.height - rightPos.height - padding + 'px')
		.style('left', canvasPos.left + canvasPos.width - rightPos.width - padding + 'px');

}


// === Set up simulation params === //

function initSimulation(nodes) {

	// log(nodes);

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

		context.restore()

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


// === Listeners / Handlers === //

d3.select('button#split').on('mousedown', function(d) {

		simulation.stop();

		simulation
			.force('xPos', d3.forceX(function(d) { return d.cluster === 0 ? width * 0.3 : width * 0.7; }).strength(0.7) )
			.force('yPos', d3.forceY(height/2).strength(0.7));
			
		simulation.alpha(0.2);

		simulation.restart();


}); // split button listener/handler


d3.select('button#unite').on('mousedown', function(d) {

		simulation.stop();

		simulation
			.force('xPos', d3.forceX(function(d) { return d.cluster === 0 ? width * 0.5 : width * 0.5; }).strength(0.5))
			.force('yPos', d3.forceY(height/2).strength(0.5));
			
		simulation.alpha(0.2);

		simulation.restart();


}); // unite button listener/handler

