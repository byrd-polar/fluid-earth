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
    distortionProperty: 'compromise',
    translateY: true,
  },
  MERCATOR: {
    name: 'Mercator',
    id: 1,
    function: d3.geoMercator(),
    distortionProperty: 'conformal',
    translateY: true,
  },
  EQUAL_EARTH: {
    name: 'Equal Earth',
    id: 2,
    function: d3.geoEqualEarth(),
    distortionProperty: 'equal-area',
    translateY: true,
  },
  ORTHOGRAPHIC: {
    name: 'orthographic',
    id: 3,
    function: d3.geoOrthographic(),
    distortionProperty: 'other',
    starfield: true,
  },
  VERTICAL_PERSPECTIVE: {
    name: 'vertical perspective',
    id: 4,
    function: d4.geoSatellite(),
    distortionProperty: 'other',
    starfield: true,
  },
  STEREOGRAPHIC: {
    name: 'stereographic',
    id: 5,
    function: d3.geoStereographic().clipAngle(null),
    distortionProperty: 'conformal',
    particleSizeFactor: 0.5,
  },
  MOLLWEIDE: {
    name: 'Mollweide',
    id: 6,
    function: d4.geoMollweide(),
    distortionProperty: 'equal-area',
    translateY: true,
  },
  WINKEL_TRIPEL: {
    name: 'Winkel tripel',
    id: 7,
    function: d4.geoWinkel3(),
    distortionProperty: 'compromise',
    translateY: true,
  },
  ROBINSON: {
    name: 'Robinson',
    id: 8,
    function: d4.geoRobinson(),
    distortionProperty: 'compromise',
    translateY: true,
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
  let scale = clientHeight * zoom / Math.PI;
  let radians = Math.PI / 180;
  let yTranslate = projection.translateY ? scale * centerLatitude * radians : 0;
  let yRotate = projection.translateY ? 0 : -centerLatitude;

  let f = projection.function
    .scale(scale)
    .translate([clientWidth / 2, clientHeight / 2 + yTranslate])
    .rotate([-centerLongitude, yRotate, 0]);

  // special case for vertical perspective projection, based on the constant in
  // ./vertical-perspective/forward.glsl
  if (projection.id === 4) {
    let dist = 1 + 7 / zoom;
    f = f.distance(dist).clipAngle(Math.acos(1 / dist) * 180 / Math.PI);
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

  return Math.round(point[0]) === Math.round(reprojPoint[0])
      && Math.round(point[1]) === Math.round(reprojPoint[1])
      && lonLat[1] >= -90 && lonLat[1] <= 90;
}
