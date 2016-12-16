
// === The Text and narrative === //



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



	// emit data upon scroll

	var containerPos = getWindowOffset(d3.select('div.col#text').node());
	var containerDim = d3.select('div.col#text').node().getBoundingClientRect();

	// On every scroll event, check which element is on screen
	
	d3.select('div.col#text').on('scroll', function() {

	  var chapterNames = Object.keys(data.segments);

	  for (var i = 0; i < chapterNames.length; i++) {

	 	  var chapterName = chapterNames[i];

	    if (isElementOnScreen(chapterName)) {

        setActiveChapter(chapterName);
        break;

	    }

	  }

	}); // scroll listener



	function isElementOnScreen(id) {

    var element = document.getElementById(id);
    var bounds = element.getBoundingClientRect();

    // log(id, 'bounds.top', Math.round(bounds.top), 'bounds.bottom', Math.round(bounds.bottom), 'test', bounds.top < containerDim.height && bounds.bottom > 0);

    return bounds.top < containerDim.height && bounds.bottom > 0;

	} // isElementOnScreen()


	var activeChapterName = startChapter;

	function setActiveChapter(chapterName) {

    if (chapterName === activeChapterName) return;

    d3.select('#' + chapterName).classed('active', true);
    d3.select('#' + activeChapterName).classed('active', false);

    var country = d3.select('#' + chapterName).node().dataset.country.split(',');

    updateGrid(chapterName);

    updateForce(chapterName);

    updateTreemap(chapterName);

    changeCircleSize(chapterName); // turns the respective circles on / off

    map.flyTo(data.segments[chapterName]); // fly to the right location

    changeCountryBackground(country);


    activeChapterName = chapterName;

	} // setActiveChapter()


  function changeCircleSize(event) {

    // --- Turn the respective circles on and off --- //

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

    });

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


  function changeCountryBackground(country) {

    // --- Turn the respective country background on and off --- //

    data.world.features.forEach(function(el) {

      map.setPaintProperty(el.properties.ADMIN, 'fill-opacity', 0);

    });  // set all backgrounds to see-through


    // turn background of selected country on

    country.forEach(function(el) {
    	log(el);
      map.setPaintProperty(el, 'fill-opacity', 0.1);

    }); // loop for sarajevo_1984

  } // changeCountryBackground()





} // makeText()