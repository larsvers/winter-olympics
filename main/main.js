
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
var activeChapterName = startChapter;

var updateGrid, updateForce, updateTreemap; // functions to update visuals

var modal = false;

var forceNodes = false; // are the force node positions calculated already?

var forceNodesProgress = 0;

var menuLock = false; // locking (true) and unlicking (false) the menu on double-click



// --- Responisve redraw --- //

window.onresize = function() {

	wWidth = window.innerWidth;
	wHeight = window.innerHeight;

	makeGrid();
	makeForce();
	makeTreemap();

} // onresize()



// --- Make visual labels --- //

// Composition variant

function makeVisLabel() {

  var canvas, text = 'headline', position = 'top';

  function my(selection) {

    selection.html(text);

    var labelDim = selection.node().getBoundingClientRect();
    var canvasDim = canvas.node().getBoundingClientRect();
    var canvasPos = getWindowOffset(canvas.node());
    var padding = 5;

    // log('selection', selection.node(), 'canvas', canvas.node(), 'labelDim', labelDim, 'canvasDim', canvasDim, 'canvasPos', canvasPos, 'padding', padding)

    selection
      .style('top', position === 'top' 
        ? canvasPos.top + padding + 'px' 
        : canvasPos.top + canvasDim.height - labelDim.height - padding + 'px')
      .style('left', position === 'top' 
        ? canvasPos.left + canvasDim.width/2 - labelDim.width/2 + 'px'
        : canvasPos.left + canvasDim.width - labelDim.width - padding + 'px');

  } // my()

  my.canvas = function(_) { if (!arguments.length) return canvas; canvas = _; return my; }
  my.text = function(_) { if (!arguments.length) return text; text = _; return my; }
  my.position = function(_) { if (!arguments.length) return position; position = _; return my; }

  return my;

} // makeVisLabel()



// --- Build multiple button --- //

function makeMultipleButton() {

  var canvas, paddingFactor = 1;

  function my(selection) {

    var buttonDim = selection.node().getBoundingClientRect();
    var canvasDim = canvas.node().getBoundingClientRect();
    var canvasPos = getWindowOffset(canvas.node());
    var padding = { top: 10 * paddingFactor, left: 10 }

    // log('selection', selection.node(), 'canvas', canvas.node(), 'buttonDim', buttonDim, 'canvasDim', canvasDim, 'canvasPos', canvasPos, 'padding', padding)

    selection
      .style('top', canvasPos.top + padding.top + 'px')
      .style('left', canvasPos.left + canvasDim.width - buttonDim.width - padding.left + 'px');

  } // my()

  my.canvas = function(_) { if (!arguments.length) return canvas; canvas = _; return my; }
  my.paddingFactor = function(_) { if (!arguments.length) return paddingFactor; paddingFactor = _; return my; }

  return my;

} // makeMultipleButton()



// --- Show multiple button --- //

d3.selectAll('.multiple-button').on('mousedown', function() {

    // Which visual ?

    var vis = d3.select(this).attr('id');

    removeModal();
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
        calculateForceNodes();
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

  d3.selectAll('.multiple-button').classed('blurred', true);

  d3.select('#modal-container').classed('showFlex', true);
  d3.select('#modal-container').classed('hide', false);

} // showModal()

function removeModal() {

  d3.selectAll('#modal *').remove();

  d3.selectAll('#main').classed('blurred', false);
  d3.selectAll('#map').classed('blurred', false);
  d3.selectAll('#force-info').classed('blurred', false);

  d3.selectAll('.multiple-button').classed('blurred', false);

  d3.select('#modal-container').classed('show', false);
  d3.select('#modal-container').classed('hide', true);

  makeGrid(); // this re-draw is a dirty but not very perf-costly hack ! If we don't re-run, the position values of the multiple grid squares (much lower) will overwrite the position values of the normal grid and the tooltip for the main grid will show on the multiple grid positions. No f*&%ing idea why. Probably connected to the join, but I've changed all variable and custom-element naming without effect so I just don't know. Eventually worked with this hack and removing the if (!d.hidden) conditional when adding the generated colours to the object's data.

} // removeModal()

// star dots HTML-code: &#4968;
// four dots in square - proportion: HTML-code: &#8759;
// braille pattern six full dots: HTML-code: &#10495;


// setting active menu items and text sections in text.js and menu.js



function changeActiveStatus(id) {

    d3.selectAll('section').classed('active', false);
    d3.select('section#' + id).classed('active', true);

    d3.selectAll('li').classed('active', false);
    d3.select('li#button-' + id).classed('active', true);

} // changeActiveStatus()


// --- Handling single vs double-click --- //

function singleDouble(el, onsingle, ondouble) {

  if (el.getAttribute('data-dblclick') == null) {

    el.setAttribute('data-dblclick', 1);

    d3.timeout(function () {

      if (el.getAttribute('data-dblclick') == 1) {

        onsingle();

      }

      el.removeAttribute('data-dblclick');

    }, 250);

  } else {

    el.removeAttribute('data-dblclick');

    ondouble();

  }

} // singleDouble()




function moveElement(oldSelector, newSelector) {

  var oldParent = d3.select(oldSelector).node();
  var child = oldParent.childNodes[0];
  var newParent = d3.select(newSelector).node();
  newParent.appendChild(child);

} // moveElement() from one parent to another parent
