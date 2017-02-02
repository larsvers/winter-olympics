
function scrollTo(chapter) {

	var elem = d3.select('section#' + chapter).node(); // get the scroll position of the chapter relative to the document top 

	var cont = d3.select('div#text').node(); // get the scroll container

	cont.scrollTop = elem.offsetTop; // the top position of the scroll shall equal the document offset position of the chosen element

} // makeMenu()

// makeMenu();


function makeMenu() {

	// log(data.events);

	var dropdown = 	d3.select('div#dropdown').append('ul');

	dropdown.selectAll('li.menu')
		.data(data.events)
		.enter()
		.append('li')
		.classed('menu', true)
		.attr('id', function(d) { return 'button-' + d.place_id; })
		.html(function(d) { return d.year + ' ' + d.host_city; })


	d3.select('li#button-' + activeChapterName).classed('active', true);


	// --- Interactivity --- //



	// &#9650; up-triangle
	// &#9660; down-triangle


	// switch menu on and off dependning on single- or double-click //

	function menuOpacity() {

		if (d3.select('div#dropdown').style('opacity') == 0) {

			d3.select('#menu-button').html('&#9650;'); // up-triangle

			d3.select('div#dropdown').classed('slider-show', true);
			d3.select('div#dropdown').classed('slider-hide', false);

		} else {

			d3.select('#menu-button').html('&#9660;'); // down-triangle

			d3.select('div#dropdown').classed('slider-show', false)
			d3.select('div#dropdown').classed('slider-hide', true);

		} // conditional

	} // menuOpacity()

	function single() {

		menuOpacity();

	} // what happens on single-click

	function double() {

		menuLock = d3.select('div#dropdown').style('opacity') == 0 ? true : false;
		log('double-click', menuLock)
		menuOpacity();

	} // what happens on double-click

	d3.select('button#menu-button').on('click', function() {

		singleDouble(this, single, double);

	}); // listener triggering hanlder singleDouble() (lives in main.js)



	// scroll to event //

	d3.selectAll('li.menu').on('mousedown', function() {

		// remove menu only if user double-clicked the select button
		if (!menuLock) {

			d3.select('#menu-button').html('&#9660;'); // down-triangle

			d3.select('div#dropdown').classed('slider-show', false);
			d3.select('div#dropdown').classed('slider-hide', true);

		} 

		var id = d3.select(this).attr('id').replace('button-','');

		scrollTo(id);

    if (isElementOnScreen(id)) {

      log('from menu.js', id);

	    changeActiveStatus(id); // function sets menu and section items on active - lives in main.js

      setActiveChapter(id);

    } // condition

	}); // li.menu mousedown event


} // makeMenu()