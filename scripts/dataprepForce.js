
// === Prepare Force Data === //

function dataprepForce() {

  var nested = d3.nest()
  	.key(function(d) { return d.place_id; })
  	.entries(data.events);

  data.events_force = {};

  nested.forEach(function(el) {

  	data.events_force[el.key] = el.values.map(function(el) {

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

  makeForce();
  
} // dataprepForce()


