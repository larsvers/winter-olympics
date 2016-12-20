
// === Prepare Force Data === //

function dataprepForce() {

  var nested = d3.nest()
  	.key(function(d) { return d.place_id; })
  	.entries(data.events);

  data.events_force = {};

  nested.forEach(function(el) {

  	data.events_force[el.key] = el.values.map(function(el) {

		  return {

		    place_id: el.place_id,
		    host_country: el.host_country,
		    host_city: el.host_city,
		    top_nation: el.top_nation,
		    year: parseInt(el.year, 10),

		    comp_total: parseInt(el.comp_total, 10),
		    comp_men: parseInt(el.comp_men, 10),
		    comp_women: parseInt(el.comp_women, 10),
		    women_ratio: parseFloat(el.women_ratio, 10),

		    sports: parseInt(el.sports, 10),
		    disciplines: parseInt(el.disciplines, 10),
		    events: parseInt(el.events, 10)

		  }; // returned mapped object

		}); // map function

	}); // loop through nested

  // log('force', data.events_force);

  makeForce();


} // dataprepForce()


