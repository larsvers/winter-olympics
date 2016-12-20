
// === The Main script === //


// --- Utilities --- //

var log = console.log.bind(console);
var dir = console.dir.bind(console);

var replace = function(string) { return string.replace(/[^a-z0-9]/gi,"").toLowerCase(); };

var getAxisLabel = function(name) { return d3.selectAll('.tick > text').filter(function(d) { return d === name; }); }; // takes a string and returns a selection of the text element of the same string

var getWindowOffset = function(elem) {

  // from http://javascript.info/tutorial/coordinates
  // Note that there are 2 coordinate systems: The document (the page) and the window (the screen).
  // The document origin can be beyond the top of  the screen - the screens origin will always be the upper left corner.
  // getBoundingClientRect gets us the position relative to the document. 
  // To get from the document coords to the window coords, we need to add the scroll offset...

  // (1) get key elements
  var box = elem.getBoundingClientRect()
  
  var body = document.body
  var docElem = document.documentElement
  
  // (2) get the scroll offset
  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
  
  // (3) get the document offset (which should be 0 apart from some Firefox peculiarity) 
  var clientTop = docElem.clientTop || body.clientTop || 0
  var clientLeft = docElem.clientLeft || body.clientLeft || 0
  
  // (4) get the position of the element from the document top, add the scroll position to get to the window coordinate system (and subtract the FF peculiarity)
  var top  = box.top + scrollTop - clientTop
  var left = box.left + scrollLeft - clientLeft
  
  return { top: Math.round(top), left: Math.round(left) }

} // getWindowOffset()


// --- Globals --- //

var wWidth = window.innerWidth;
var wHeight = window.innerHeight;

var startChapter = 'chamonix_1924'; // this is the global holding the current place_id

var updateGrid, updateForce, updateTreemap; // functions to update visuals



// --- Responisve redraw --- //

window.onresize = function() {

	wWidth = window.innerWidth;
	wHeight = window.innerHeight;

	makeGrid();
	makeForce();
	makeTreemap();

}


// --- Show multiple button --- //

d3.selectAll('.flex-grid#bottom .col').on('mousedown', function() {


    var vis = d3.select(this).attr('id');

    d3.selectAll('#main').classed('blurred', true);
    d3.selectAll('#map').classed('blurred', true);
    d3.selectAll('#force-info').classed('blurred', true);
    // d3.selectAll('.tooltip.tooltip-center.tooltip-left').classed('blurred', false);

    d3.select('#modal-container').classed('show', true);
    d3.select('#modal-container').classed('hide', false);

    d3.select('#modal-container h3').html('Nations and medals');
    // d3.select('#modal').call(makeForceMultiple);
    d3.select('#modal').call(makeGridMultiple);

    // add script to html

});
    
d3.select('#modal-header button').on('mousedown', function() {

    d3.selectAll('#modal *').remove();

    d3.selectAll('#main').classed('blurred', false);
    d3.selectAll('#map').classed('blurred', false);
    d3.selectAll('#force-info').classed('blurred', false);

    d3.select('#modal-container').classed('show', false);
    d3.select('#modal-container').classed('hide', true);



});