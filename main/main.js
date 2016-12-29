
// === The Main script === //


// --- Utilities --- //

var log = console.log.bind(console);
var dir = console.dir.bind(console);
var formatPerc = d3.format('.0%');

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

var modal = false;

var forceNodes = false; // are the force node positions calculated already?

var forceNodesProgress = 0;

// --- Responisve redraw --- //

window.onresize = function() {

	wWidth = window.innerWidth;
	wHeight = window.innerHeight;

	makeGrid();
	makeForce();
	makeTreemap();

} // onresize()

// --- Build multiple button --- //

function makeMultipleButton(selection, canvas, paddingFactor) {

  paddingFactor = paddingFactor || 1; // === 1 if 3rd argument empty

  var buttonDim = selection.node().getBoundingClientRect();
  var canvasDim = canvas.node().getBoundingClientRect();
  var canvasPos = getWindowOffset(canvas.node());
  var padding = { top: 10 * paddingFactor, left: 10 }

  // log('selection', selection.node(), 'canvas', canvas.node(), 'buttonDim', buttonDim, 'canvasDim', canvasDim, 'canvasPos', canvasPos, 'padding', padding)
  // log('top', canvasPos.top + canvasDim.height - buttonDim.height - padding);
  // log('left', canvasPos.left + canvasDim.width - buttonDim.width - padding);

  selection
    .style('top', canvasPos.top + canvasDim.height - buttonDim.height - padding.top + 'px')
    .style('left', canvasPos.left + canvasDim.width - buttonDim.width - padding.left + 'px');

} // makeMultipleButton() - used in each of the 3 vises


// --- Show multiple button --- //

d3.selectAll('.multiple-button').on('mousedown', function() {

    // Which visual ?

    var vis = d3.select(this).attr('id');

    showModal();

    if (vis === 'grid-multiple') {
      d3.select('#modal-container h3').html('Nations and medals');
      d3.select('#modal').call(makeGridMultiple);
    }
    
    if (vis === 'force-multiple') { 
      if (forceNodes) { // if the forceNodes positions are already calculated
        d3.select('#modal-container h3').html('Athletes and gender');
        d3.select('#modal').call(makeForceMultiple);        
      } else { // if the forceNodes still need calculation (the rest is handled in force-calc.js)
        removeModal();
        d3.select('.force-text#center').classed('non-visible', false);
        // console.log('Just some calculations away - at', formatPerc(forceNodesProgress)); // debug
      }
    }

    if (vis === 'treemap-multiple') {
      d3.select('#modal-container h3').html('Sports and events');
      d3.select('#modal').call(makeTreemapMultiple);
    }

    // add script to html

});
    
d3.select('#modal-header button').on('mousedown', removeModal);


function showModal() {

  d3.selectAll('#main').classed('blurred', true);
  d3.selectAll('#map').classed('blurred', true);
  d3.selectAll('#force-info').classed('blurred', true);

  d3.select('#modal-container').classed('showFlex', true);
  d3.select('#modal-container').classed('hide', false);

} // showModal()

function removeModal() {

  d3.selectAll('#modal *').remove();

  d3.selectAll('#main').classed('blurred', false);
  d3.selectAll('#map').classed('blurred', false);
  d3.selectAll('#force-info').classed('blurred', false);

  d3.select('#modal-container').classed('show', false);
  d3.select('#modal-container').classed('hide', true);

  makeGrid(); // this re-draw is a dirty but not very perf-costly hack ! If we don't re-run, the position values of the multiple grid squares (much lower) will overwrite the position values of the normal grid and the tooltip for the main grid will show on the multiple grid positions. No f*&%ing idea why. Probably connected to the join, but I've changed all variable and custom-element naming without effect so I just don't know. Eventually worked with this hack and removing the if (!d.hidden) conditional when adding the generated colours to the object's data.

} // removeModal()

// star dots HTML-code: &#4968;
// four dots in square - proportion: HTML-code: &#8759;
// braille pattern six full dots: HTML-code: &#10495;


