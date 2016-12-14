
function dataprepMap() {

  // log(createRadiusStops(capExt, radiusScale, false));
  // log(createRadiusStops(capExt, radiusScale, true));

  // ---- Build the GeoJson for the points --- //

  data.geo_locations = {

    "type": "FeatureCollection",
    "features": []
  
  };

  data.locations.forEach(function(el) {

    var obj = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [el.long, el.lat]
      },
      "properties": {
        "picture_id": el.picture_id,
        "event_id": el.event_id,
        "place_id": el.place_id,
        "place": el.place,
        "year": el.year,
        "venue": el.venue,
        "sports_short": el.sports_short,
        "capacity": el.capacity,
        "capacity_orig": el.capacity_orig,
        "link": el.link
      }
    }

    data.geo_locations.features.push(obj);
      
  });

  // log('geo_locations', data.geo_locations);


  // --- Build the JSON for the flyTo destinations --- //

  data.segments = {};

  data.events.forEach(function(el) {

    data.segments[el.place_id] = {

      center: el.flight_center,
      zoom: el.flight_zoom,
      pitch: el.flight_pitch,
      bearing: el.flight_bearing,
      duration: el.flight_duration,
      speed: el.flight_speed

    };

  });

  // log('data.segments', data.segments);

  mapVis();

} // dataprepMap()
