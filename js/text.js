
// === The Text and narrative === //

// initial sequence of events (approximate code-line numbers)
// map.js  108     curtain allowed to be removed
// curtain.js 24   disallow map zoom
// curtain.js 24   disallow scroll on text
// curtain.js 22   once curtain is removed start zoom
// text.js 192     after 2sec's allow scroll on text
// text.js 192     after 2 sec's show zoom triangle
// text.js 37      once scrolled allow map zoom
// text.js 39      once scrolled a while remove triangle 

// --- Main function --- //

function makeText() {


	d3.select('div.col#text')
		.selectAll('.text-section')
		.data(d3.values(data.segments))
		.enter()
		.append('section')
		.attr('class', 'text-section')
		.attr('id', function(d) { return d.place_id; })
		.attr('data-country', function(d) { return d.country_lookup; })
		.html(function(d) { return d.text; });

  timeGreeting(); // time dependent greeting (lives in main.js)

  d3.select('section#' + activeChapterName).classed('active', true);


	// emit data upon scroll

	var containerPos = getWindowOffset(d3.select('div.col#text').node());
	var containerDim = d3.select('div.col#text').node().getBoundingClientRect();

	// On every scroll event, check which element is on screen

	d3.select('div.col#text').on('scroll', function() {

    // allow zooming of map
    var introTop = d3.select('.text-section-intro').node().getBoundingClientRect().top; // get first section element
    if (introTop < 0) map.scrollZoom.enable(); // allow map zoom/pan after first text scroll
    if (introTop < -500) d3.select('.scroll-afford').transition().style('opacity', 0).remove(); // remove scroll call to action after some scrolling

    
	  var chapterNames = Object.keys(data.segments);
	  for (var i = 0; i < chapterNames.length; i++) {

	 	  var chapterName = chapterNames[i];

	    if (isElementOnScreen(chapterName)) {
        setActiveChapter(chapterName);
        break;
	    } // condition

	  } // for loop

	}); // scroll listener


  // note: global as used by the buttons in text.js
	isElementOnScreen = function(id) {

    var element = d3.select('section#' + id).node();
    var bounds = element.getBoundingClientRect();

    // console.log(id, 'bounds.top', Math.round(bounds.top), 'bounds.bottom', Math.round(bounds.bottom), 'test', bounds.top < containerDim.height && bounds.bottom > 0);

    return bounds.top < containerDim.height && bounds.bottom > 0;

	}; // isElementOnScreen()

	activeChapterName = startChapter;

  // note: global as used by the buttons in text.js
	setActiveChapter = function(chapterName) {

    if (chapterName === activeChapterName) return;

    changeActiveStatus(chapterName); // function sets menu and section items on active - lives in main.js

    activeChapterName = chapterName;

    var country = d3.select('section#' + chapterName).node().dataset.country.split(',');

    var t = d3.timer(function(elapsed) {

      if (elapsed > 500) {

        updateGrid(chapterName);
        updateForce(chapterName);
        updateTreemap(chapterName);
        t.stop();

      } // timer conditional

    }); // some build-in latency without which the transitions don't work

    changeCircleSize(chapterName); // turns the respective circles on / off

    map.flyTo(data.segments[chapterName]); // fly to the right location

    changeCountryBackground(country);

	}; // setActiveChapter()



  function removeAllCircles() {

    // --- Turn all circles off --- //

    // Set all circle-radii to 0

    data.geo_locations.features.forEach(function(el) {

      // remove all blue circles

      var p = el.properties.place_id; // the place_id of each element equals the layer id for the blue circles

      map.setPaintProperty(p, 'circle-radius', {
        'property': 'capacity', 
        'type': 'exponential', 
        'stops': createRadiusStops(capExt, radiusScale, true)
      });


      // remove all white circles

      var g = el.properties.place_id + 'glow'; // the place_id of each element + 'glow' equals the layer id for the white circles

      map.setPaintProperty(g, 'circle-radius', {
        'property': 'capacity', 
        'type': 'exponential', 
        'stops': [
          [{ zoom: 3, value: capExt[1] }, 0 ],
          [{ zoom: 8, value: capExt[1] }, 0 ],
          [{ zoom: 12, value: capExt[1] }, 0 ],
        ]
      });

    }); // loop to turn off

  } // removeAllCircles()

  function mapZoomOutFull() {
    
    var config = {
      bearing: 0,
      center: [90, 0],
      duration: 10000,
      pitch: 0,
      zoom: 0.9
    };

    map.flyTo(config);

  } // mapZoomOutFull()

  function showAllCircles() {

    // Turn on all circles (first the blue then the white circles)

    data.locations.forEach(function(event) {
      
      var eventId = event.place_id;

      map.setPaintProperty(eventId, 'circle-radius', {
        'property': 'capacity', 
        'type': 'exponential', 
        'stops': createRadiusStops(capExt, radiusScale, false)
      });

      map.setPaintProperty(eventId + 'glow', 'circle-radius', {
        'property': 'capacity', 
        'type': 'exponential', 
        'stops': [
          [{ zoom: 3, value: capExt[1] }, 0 ],
          [{ zoom: 8, value: capExt[1] }, 2 ],
          [{ zoom: 12, value: capExt[1] }, 3 ],
        ]
      });    

    }); // loop through all events

  } // showAllCircles()



  // note: global as used by the buttons in menu.js
  showFullMap = function() {
    
    mapZoomOutFull(); // zoom out map 
    removeCountryBackground(); // turn off all countr backgrounds
    removeAllCircles(); // turn all circles off
    showAllCircles(); // turn all circles on

  } // showFullMap()


  function changeCircleSize(event) {

    removeAllCircles(); // turn all circles off

    // Set the circle-radii of the visited location to the appropriate values (first the blue then the white circles)

    map.setPaintProperty(event, 'circle-radius', {
      'property': 'capacity', 
      'type': 'exponential', 
      'stops': createRadiusStops(capExt, radiusScale, false)
    });

    map.setPaintProperty(event + 'glow', 'circle-radius', {
      'property': 'capacity', 
      'type': 'exponential', 
      'stops': [
        [{ zoom: 3, value: capExt[1] }, 0 ],
        [{ zoom: 8, value: capExt[1] }, 2 ],
        [{ zoom: 12, value: capExt[1] }, 3 ],
      ]
    });

  } // changeCircleSize()


  function removeCountryBackground() {
        
    // --- Turn the respective country background off --- //
    data.world.features.forEach(function(el) {
      map.setPaintProperty(el.properties.ADMIN, 'fill-opacity', 0);
    });  // set all backgrounds to see-through

  } // removeCountryBackground()


  function changeCountryBackground(country) {

    removeCountryBackground();

    // turn background of selected country on

    country.forEach(function(el) {

      map.setPaintProperty(el, 'fill-opacity', 0.1);

    }); // loop for sarajevo_1984

  } // changeCountryBackground()


  map.on('moveend', function() {

  });

} // makeText()