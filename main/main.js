var log = console.log.bind(console);
var dir = console.dir.bind(console);

var wWidth = window.innerWidth;
var wHeight = window.innerHeight;


var replace = function(string) { return string.replace(/[^a-z0-9]/gi,""); };

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


window.onresize = function(e) {

	wWidth = window.innerWidth;
	wHeight = window.innerHeight;

	// log(wWidth);
	makeGrid();

}