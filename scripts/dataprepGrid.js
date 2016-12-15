
// === Prepare Grid Data === //

function dataprepGrid() {

  var nested = d3.nest()
  	.key(function(d) { return d.place_id; })
  	.entries(data.nations);

  data.nations_grid = {};

  nested.forEach(function(el) {

  	data.nations_grid[el.key] = el.values.map(function(el) {

  		return {

	      event_id: el.event_id,
	      gold: el.gold,
	      silver: el.silver,
	      bronze: el.bronze,
	      medals: el.medals,
	      team_size: el.team_size,
	      place: el.place,
	      nation: el.nation,
	      place_id: el.place_id,
	      image_name: el.image_name

  		}

  	});

  });

  log('grid', data.nations_grid);

  makeGrid();

} // dataprepGrid()
