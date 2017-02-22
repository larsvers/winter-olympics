
window.data = window.data || {}; // make the data global

d3.timeout(function(){

  d3.queue()
    .defer(d3.tsv, '/data/events.tsv')
    .defer(d3.tsv, '/data/locations.tsv')
    .defer(d3.tsv, '/data/nations.tsv')
    .defer(d3.tsv, '/data/sports.tsv')
    .defer(d3.html, '/data/info.html')
    .defer(d3.json, '/data/ne_10m_admin_0_countries.json')
    .await(dataprep);

  d3.select('.spinner').classed('hide', false); // show the loading spinner

}, 6000); // wait until most of the rings came snowing in


// === Data preperation === //

function dataprep(err, dataEvents, dataLocations, dataNations, dataSports, dataInfo, dataWorld) {
  

  // --- Reformat the type --- //

  data.events = dataEvents.map(function(el) {

    return {

      event_id: parseInt(el.event_id),
      nations: parseInt(el.nations),
      year: parseInt(el.year),

      flight_center: [parseFloat(el.flight_center_long), parseFloat(el.flight_center_lat)],
      flight_zoom: parseInt(el.flight_zoom),
      flight_pitch: parseInt(el.flight_pitch),
      flight_bearing: parseInt(el.flight_bearing),
      flight_duration: parseInt(el.flight_duration),
      flight_speed: parseInt(el.flight_speed),

      comp_total: parseInt(el.comp_total),
      comp_men: parseInt(el.comp_men),
      comp_women: parseInt(el.comp_women),
      women_ratio: parseFloat(el.women_ratio),

      sports: parseInt(el.sports),
      disciplines: parseInt(el.disciplines),
      events: parseInt(el.events),

      end_date: new Date(el.end_date),
      start_date: new Date(el.start_date),

      games: el.games,
      host_city: el.host_city,
      host_country: el.host_country,
      country_lookup: el.country_lookup,
      place_id: el.place_id,
      opened: el.opened,
      top_nation: el.top_nation,
      text: el.text,
      comment: el.comment

    };

  });

  data.locations = dataLocations.map(function(el) {

    return {

      capacity: parseInt(el.capacity),
      capacity_orig: parseInt(el.capacity_orig),
      year: parseInt(el.year),
      event_id: parseInt(el.event_id),
      lat: parseFloat(el.lat),
      long: parseFloat(el.long),
      picture_id: parseInt(el.picture_id),

      place_id: el.place_id,
      place: el.place,
      venue: el.venue,
      sports_short: el.sports_short.split(","),
      link: el.link

    };

  });
  
  data.nations = dataNations.map(function(el) {

    return {

      event_id: parseInt(el.event_id),

      gold: parseInt(el.gold),
      silver: parseInt(el.silver),
      bronze: parseInt(el.bronze),
      medals: parseInt(el.medals),

      team_size: parseInt(el.team_size),

      place: el.place,
      nation: el.nation,
      place_id: el.place_id,
      image_name: el.image_name


    };

  });
  
  data.sports = dataSports.map(function(el) {

    return {

      event_id: parseInt(el.event_id),
      events: parseInt(el.events),

      place_id: el.place_id,
      place: el.place,
      sport: el.sport,
      discipline: el.discipline

    };

  });

  data.info = dataInfo;

  console.log(data);

  // --- Converting the topjson to geojson and only keep the props we need ---//

  data.world = topojson.feature(dataWorld, dataWorld.objects.ne_10m_admin_0_countries);

  data.world.features.map(function(el) {
      el.properties.ADM0_A3_IS = el.properties.ADM0_A3_IS;
      el.properties.ADMIN = slugify(el.properties.ADMIN).toLowerCase();
  
    for(var key in el.properties){
      if (key !== 'ADM0_A3_IS' && key !== 'ADMIN'){
        delete el.properties[key];
      } // if key isn't <list of used properties>
    } // delete unused properties

  });


  // console.log('events', data.events);
  // console.log('locations', data.locations);
  // console.log('nations', data.nations);
  // console.log('sports', data.sports);
  // console.log('world', data.world);


  dataprepMap();
  dataprepText();
  dataprepGrid();
  dataprepForce();
  dataprepTreemap();

} // dataprep()


