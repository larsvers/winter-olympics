
// === Prepare Map Data === //

function dataprepMap() {

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

  makeMap();

} // dataprepMap()
