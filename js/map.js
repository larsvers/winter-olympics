
// === The Map === //


// --- Globals --- //

var map;

var capExt, radiusScale, colExt, colourScale;

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

}; // createColourStops()

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

        var radius = scale(i + extent[0]) + 4; // + 4 increases circle radius
        radius = elt === 0 ? radius / 3 : elt === 1 ? radius : radius * 1.5;
        radius = setToZero === true ? 0 : radius;

        inner = [obj, radius];

        outer.push(inner);

      }); // loop to guarantee different values for different zoom levels

    } // only trigger every 1000 steps

  }); // loop through all capacity values

  return outer;

}; // createRadiusStops()


// --- Main function --- //

function makeMap() {


  // === Initialise map === //

  var satDesat = 'mapbox://styles/larsvers/civ2lcn1i000h2jjuo2iq8ykm';
  var sat = 'mapbox://styles/larsvers/civ2tags1000k2iodkxhum370';
  var ski = 'mapbox://styles/larsvers/civfpazh700302kl8diskf9vr';
  
  mapboxgl.accessToken = 'pk.eyJ1IjoibGFyc3ZlcnMiLCJhIjoiY2l2MTAxY2pjMDA0aTJ6dDVudXIyeTBrayJ9.-zz4eMd83tjFyz4OITkZFw';

  map = new mapboxgl.Map({

    container: 'map',
    style: ski,
   	center: [6.874011, 45.926747],
    zoom: 2,
    pitch: 0

  }); // add map

  // move mapbox attribution from bottom- to top-right. Didn't waork with AttributionControl() as suggested by mapbox
  moveElement('.mapboxgl-ctrl-bottom-right', '.mapboxgl-ctrl-top-right'); 


  mapIt();


  function mapIt() {

    // === Add entire map === //

    map.on('load', function() {

      // --- Scales --- //

      // Circle radius scale to calculate based on capacity (minus the maximum outlier)
      capExt = d3.extent(data.locations.filter(function(d) { return d.capacity < d3.max(data.locations, function(dd) { return dd.capacity; }); }), function(d) { return d.capacity; });
      radiusScale = d3.scaleSqrt().domain(d3.extent(data.locations, function(d) { return d.capacity; })).range([3,20]);

      // Colour scale based on 
      colExt = d3.extent(data.locations, function(d) { return d.event_id; });
      var colours = ['#639afb', '#3758a6', '#081D59']; // light to dark blue
      colourScale = d3.scaleLinear().domain([colExt[0], d3.quantile(colExt, 0.5), colExt[1]]).range(colours);


      // --- Add sources --- //

      map.addSource('places', {
        'type': 'geojson',
        'data': data.geo_locations
      }); // add the location data 

      map.addSource('world', {
        'type': 'geojson',
        'data': data.world
      }); // add the world data


      // --- Add layers --- //

      data.world.features.forEach(function(el) {

        var country = slugify(el.properties.ADMIN).toLowerCase();

        // console.log(country);

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

          // add coloured circles
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




          // add white center
          map.addLayer({
            'id': id + 'glow',
            'type': 'circle',
            'source': 'places',
            'paint': {
                'circle-color': '#fff',
                'circle-blur': 0.75,
                'circle-opacity': 0.75,
                'circle-radius': {
                  'property': 'capacity',
                  'type': 'exponential',
                  'stops': [
                    [{ zoom: 3, value: capExt[1] }, 1 ],
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





  // === Tooltip === //

  map.on('mousemove', function(e) {

    var features = map.queryRenderedFeatures(e.point);
    var feature = features[0];

    map.getCanvas().style.cursor = feature && feature.layer.source === 'places' ? 'default' : '';

    if (feature && feature.layer.source === 'places') {

      var prop = feature.properties;

      var sports = prop.sports_short.replace(/,/g, ' &middot; ').replace(/[\[\]"]/g, '');


      var html =            
        '<div id="tip-header-map">' +
          prop.venue + '<br>' +
          '<span class="small">' + prop.place + ' ' + prop.year +
        '</div>' +
        '<div id="tip-body-map">' +
          '<img src="/images/locations/' + prop.picture_id + '.jpg"><br>' +
          '<span class="small">Events: ' + sports + '</span>' +
          (isNaN(prop.capacity_orig) ? '' : '<br><span class="small">Capacity: ' + d3.format(',')(prop.capacity) + '</span>') +
        '</div>';

      d3.select('.tooltip')
        .style('opacity', 0.99)
        .style('top', e.point.y + 'px')
        .style('left', e.point.x + 'px')
        .html(html);

    } else {

      d3.select('.tooltip')
        .transition().duration(50)
        .style('opacity', 0);

    }

  }); // mousemove listener

 } // makeMap()
