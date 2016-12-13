// === Globals === //

var log = console.log.bind(console);
var dir = console.dir.bind(console);

var capExt, radiusScale, colExt, colourScale;
var listen = {};
var data = {};


var replace = function(string) { return string.replace(/[^a-z0-9]/gi,""); };

var createColourStops = function(extent, scale) {

  var delta = extent[1] - extent[0];
  var outer = [];

  d3.range(delta + extent[0]).forEach(function(el, i) {

    if (i % 4 === 0) {
      var inner = [i, scale(i)];
      outer.push(inner);
    }

  });

  return outer;

};

var createRadiusStops = function(extent, scale, setToZero) {

  // Boolean setToZero sets all radii created to 0 for switching them off when moving from place to place

  var delta = extent[1] - extent[0];

  var outer = [];

  d3.range(delta + extent[0]).forEach(function(el, i) {

    if (i % 1000 === 0) {
      
      d3.range(3).forEach(function(elt) { // number in d3.range() defines how many zoom levels we include

        var zoom = elt === 0 ? 3 : elt === 1 ? 8 : 12; // define zoom levels

        // build data struture as in [{ zoom: x, value: y }, z] (x = soom level, y = data-value, z = radius at that value)
        
        var inner = [];
        var obj = {};
        obj.zoom = zoom;
        obj.value = i + extent[0];

        var radius = scale(i + extent[0]);
        radius = elt === 0 ? radius / 3 : elt === 1 ? radius : radius * 1.5;
        radius = setToZero === true ? 0 : radius;

        inner = [obj, radius];

        outer.push(inner);

      }); // loop to guarantee different values for different zoom levels

    } // only trigger every 1000 steps

  }); // loop through all capacity values

  return outer;

}; // createRadiusStops()




// var createRadiusStops = function(extent, scale) { // version without zoom stops

//   var extent = extent || capExt;
//   var scale = scale || radiusScale;

//   var delta = extent[1] - extent[0];

//   var outer = [];

//   d3.range(delta + extent[0]).forEach(function(el, i) {

//     if (i % 1000 === 0) {
      
//       var inner = [i + extent[0], scale(i + extent[0])];
//       outer.push(inner);
//     }

//   });

//   return outer;

// };




// === Initialise map === //

var outdoor = 'mapbox://styles/larsvers/civ13lwyh01lc2hpbgr74oyus';
var satDesat = 'mapbox://styles/larsvers/civ2lcn1i000h2jjuo2iq8ykm';
var dark = 'mapbox://styles/larsvers/civ2srn83000f2iozmv6h5ym5';
var sat = 'mapbox://styles/larsvers/civ2tags1000k2iodkxhum370';
var light = 'mapbox://styles/larsvers/civ9ubamu002d2jpymehvthja';
var ski = 'mapbox://styles/larsvers/civfpazh700302kl8diskf9vr';


mapboxgl.accessToken = 'pk.eyJ1IjoibGFyc3ZlcnMiLCJhIjoiY2l2MTAxY2pjMDA0aTJ6dDVudXIyeTBrayJ9.-zz4eMd83tjFyz4OITkZFw';
var map = new mapboxgl.Map({
    container: 'map',
    style: ski,
   	center: [6.874011, 45.926747],
    zoom: 6,
    pitch: 0
});


// === Load data === //
// xls saved as Unicode .txt files, file ending changeto to .tsv

d3.queue()
  .defer(d3.tsv, '../data/events.tsv')
  .defer(d3.tsv, '../data/locations.tsv')
  .defer(d3.tsv, '../data/nations.tsv')
  .defer(d3.tsv, '../data/sports.tsv')
  .defer(d3.json, '../data/ne_10m_admin_0_countries.json')
  .await(dataprep);


// === Data preperation === //

function dataprep(err, dataEvents, dataLocations, dataNations, dataSports, dataWorld) {
  

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
      year: parseInt(el.year),
      event_id: parseInt(el.event_id),
      lat: parseFloat(el.lat),
      long: parseFloat(el.long),
      picture_id: parseInt(el.picture_id),

      place_id: el.place_id,
      place: el.place,
      venue: el.venue,
      sports_short: el.sports_short.split(","),
      venue: el.venue,
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

      place: el.place,
      sport: el.sport,
      discipline: el.discipline

    };

  });

  // --- Converting the topjson to geojson and only keep the props we need ---//

  data.world = topojson.feature(dataWorld, dataWorld.objects.ne_10m_admin_0_countries);

  data.world.features.map(function(el) {
      el.properties.ADM0_A3_IS = el.properties.ADM0_A3_IS;
      el.properties.ADMIN = replace(el.properties.ADMIN).toLowerCase();
  
    for(var key in el.properties){
      if (key !== 'ADM0_A3_IS' && key !== 'ADMIN'){
        delete el.properties[key];
      } // if key isn't <list of used properties>
    } // delete unused properties

  });


  // log('events', data.events);
  log('locations', data.locations);
  // log('nations', data.nations);
  // log('sports', data.sports);
  // log('world', data.world);



  // --- Scales --- //

  // Circle radius scale to calculate based on capacity (minus the maximum outlier)
  capExt = d3.extent(data.locations.filter(function(d) { return d.capacity < d3.max(data.locations, function(dd) { return dd.capacity; })}), function(d) { return d.capacity; });
  radiusScale = d3.scaleSqrt().domain(d3.extent(data.locations, function(d) { return d.capacity; })).range([3,20]);

  // Colour scale based on 
  colExt = d3.extent(data.locations, function(d) { return d.event_id; });
  var colours = ['#639afb', '#1367f9', '#0723e8'];
  colourScale = d3.scaleLinear().domain([colExt[0], d3.quantile(colExt, 0.5), colExt[1]]).range(colours);




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
        "venue": el.venue,
        "sports_short": el.sports_short,
        "capacity": el.capacity,
        "link": el.link
      }
    }

    data.geo_locations.features.push(obj);
      
  });

  log('geo_locations', data.geo_locations);


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

} // dataprep()




mapIt();


function mapIt() {

  // === Add entire map === //

  map.on('load', function() {

    map.addSource('places', {
      'type': 'geojson',
      'data': data.geo_locations
    });

    map.addSource('world', {
      'type': 'geojson',
      'data': data.world
    });


    data.world.features.forEach(function(el) {

      var country = replace(el.properties.ADMIN).toLowerCase();

      // log(country);

      if (!map.getLayer(country)) {

        map.addLayer({
          'id': country,
          'type': 'fill',
          'source': 'world',
          'paint': {
            'fill-color': '#adceff',
            'fill-opacity': 0
          },
          'filter': ['==', 'ADMIN', country]
        }, 'country borders');

      }

    }); // add countries as fill-layer (as in polygons) in order to individually show them as background


    data.geo_locations.features.forEach(function(el) {

      var id = el.properties.place_id;

      // If there's no layer set yet, add a layer for each event. 
      // Filter the data so that only event-relevant data gets added to this layer.



      if (!map.getLayer(id)) {

        // circle-radius: capacity
        // circle-radius zoom-levels: 
        // zoom level 0: fully zoomed out to world
        // zoom level 6: full view of a medium-sized country
        // zoom level 11: metropolitan-region-sized area
        // zoom level 16: neighborhood scale.
        // so: keep circles small from top to 8 and then increase by factor of 2

        map.addLayer({
          'id': id,
          'type': 'circle',
          'source': 'places',
          'paint': {
              'circle-color': {
                'property': 'event_id',
                'type': 'exponential',
                'stops': createColourStops(colExt, colourScale)
              },
              'circle-blur': 0.8,
              'circle-radius': {
                'property': 'capacity',
                'type': 'exponential',
                'stops': createRadiusStops(capExt, radiusScale, false)
              }
            },
            'filter': ["==", "place_id", id]
        });




        map.addLayer({
          'id': id + 'glow',
          'type': 'circle',
          'source': 'places',
          'paint': {
              'circle-color': '#fff',
              'circle-blur': 1,
              'circle-opacity': 0.75,
              'circle-radius': {
                'property': 'capacity',
                'type': 'exponential',
                'stops': [
                  [{ zoom: 3, value: capExt[1] }, 0 ],
                  [{ zoom: 8, value: capExt[1] }, 2 ],
                  [{ zoom: 12, value: capExt[1] }, 3 ],
                ]
              }
            },
            'filter': ["==", "place_id", id]
        });

      } // if layer doesn't exist yet, add it

    }); // add the event-locations as circle-layers

  }); // map.on('load') 

} // mapIt()









// === Buttons === //

d3.selectAll('button.fly').on('mousedown', function() {
    

    var l = this.id; // the place_id of the button (as in 'chamonix_1924')
    var c = [this.dataset.country];

    
    // Specific logic

    if (l === 'sarajevo_1984') {
    
      c = ['bosniaandherzegovina', 'republicofserbia', 'croatia', 'slovenia', 'kosovo', 'montenegro', 'macedonia']
    
    }

    listen.changeCircleSize(l); // turns the respective circles on / off

    map.flyTo(data.segments[l]); // fly to the right location

    listen.changeCountryBackground(c);
  
}); // button listener / handler



// === Listener === //



listen.changeCircleSize = function(event) {

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


} // listener to change circle-size





listen.changeCountryBackground = function(country) {

  // --- Turn the respective country background on and off --- //

  data.world.features.forEach(function(el) {
  
    map.setPaintProperty(el.properties.ADMIN, 'fill-opacity', 0);
    
  });  // set all backgrounds to see-through


  // turn background of selected country on
  
  country.forEach(function(el) {

    map.setPaintProperty(el, 'fill-opacity', 0.1);

  }); // loop for sarajevo_1984

};





