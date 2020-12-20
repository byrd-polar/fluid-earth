import * as d3 from 'd3-geo';
import * as d4 from 'd3-geo-projection';

// Enums for map projections
//
// ids are passed as uniforms to the gridded and vector shaders
//
// functions are used externally (outside of the Map.svelte component) to do
// projection of individual points in Javascript instead of WebGL

export default Object.freeze({
  EQUIRECTANGULAR: {
    name: 'equirectangular',
    id: 0,
    function: d3.geoEquirectangular(),
  },
  MERCATOR: {
    name: 'Mercator',
    id: 1,
    function: d3.geoMercator(),
  },
  EQUAL_EARTH: {
    name: 'Equal Earth',
    id: 2,
    function: d3.geoEqualEarth(),
  },
  ORTHOGRAPHIC: {
    name: 'orthographic',
    id: 3,
    function: d3.geoOrthographic(),
  },
  VERTICAL_PERSPECTIVE: {
    name: 'vertical perspective',
    id: 4,
    function: d4.geoSatellite(),
  },
});


// Return a d3 projection function that corresponds to the current application
// state (based on the given parameters)

export function proj(
  projection,      // one of the projection enums above
  centerLongitude, // longitude, in degrees, of where the map is centered
  centerLatitude,  // latitude,  "  "        "  "     "   "   "  "
  clientWidth,     // width of the canvas where the webgl map is rendered
  clientHeight,    // height   "   "      "     "   "     "   "  "
  zoom,            // scale at which the map is zoomed in
) {
  let f = projection.function
    .scale(clientHeight * zoom / Math.PI)
    .translate([clientWidth / 2, clientHeight / 2])
    .rotate([-centerLongitude, -centerLatitude, 0])

  // special case for vertical perspective projection, based on the constant in
  // ./vertical-perspective/forward.glsl
  if (projection.id === 4) {
    f = f.distance(1 + 7 / zoom);
  }

  return f;
}


// Determine if a point should be clipped (i.e. not shown because it is behind
// the globe) from the map

export function clipped(
  d3geoProjection, // a d3 projection function returned by proj
  lonLat, // a [longitude, latitude] array
) {
  return !d3.geoPath(d3geoProjection)({ type: 'Point', coordinates: lonLat });
}


// Check if a re-projected point matches the original coordinates

export function reproj(
  d3geoProjection, // a d3 projection function returned by proj
  point, // the original [x, y] screen coordinates
  lonLat, // the [longitude, latitude] array to which they were projected
) {
  let reprojPoint = d3geoProjection(lonLat);

  return Math.round(point[0]) === Math.round(reprojPoint[0]) &&
         Math.round(point[1]) === Math.round(reprojPoint[1]);
}
