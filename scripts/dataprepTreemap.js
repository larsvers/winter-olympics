
// === Prepare Treemap Data === //

function dataprepTreemap() {

	// --- Get a map-object with events as key --- // 

  var nested = d3.nest()
  	.key(function(d) { return d.place_id; })
  	.entries(data.sports);

  data.sports_treemap = {};

  nested.forEach(function(el) {

  	data.sports_treemap[el.key] = el.values.map(function(el) {

		  return {

	      event_id: parseInt(el.event_id),
	      events: parseInt(el.events),

	      place: el.place,
	      sport: el.sport,
	      discipline: el.discipline

		  }; // returned mapped object

		}); // map function

	}); // loop through nested

  // log(data.sports_treemap);
  
  makeTreemap();

} // dataprepTreemap()

