
// === Prepare Text Data === //

function dataprepText() {


  // --- Build the JSON for the flyTo destinations --- //

  data.segments = {};

  data.events.forEach(function(el) {

    data.segments[el.place_id] = {

      place_id: el.place_id,
      country_lookup: el.country_lookup,
      center: el.flight_center,
      zoom: el.flight_zoom,
      pitch: el.flight_pitch,
      bearing: el.flight_bearing,
      duration: el.flight_duration,
      speed: el.flight_speed,
      text: el.text

    };

  }); // loop

  // console.log('data.segments', data.segments);

  makeText();

  makeMenu();

}