#pragma glslify: p0 = require(./equirectangular/forward.glsl)
#pragma glslify: p1 = require(./mercator/forward.glsl)
#pragma glslify: p2 = require(./equal-earth/forward.glsl)
#pragma glslify: p3 = require(./orthographic/forward.glsl)
#pragma glslify: p4 = require(./vertical-perspective/forward.glsl)
#pragma glslify: p5 = require(./stereographic/forward.glsl)
#pragma glslify: p6 = require(./mollweide/forward.glsl)
#pragma glslify: p7 = require(./winkel-tripel/forward.glsl)
#pragma glslify: p8 = require(./robinson/forward.glsl)

#pragma glslify: export(forwardProject)

void forwardProject(
    out vec2 displayCoord,
    in vec2 lonLat0,
    in vec2 lonLat,
    out bool clip,
    in float zoom,
    in int projection,
    in bool translateY
) {
  float yTranslate = 0.0;

  if (translateY) {
    yTranslate = lonLat0.y;
    lonLat0.y = 0.0;
  }

  clip = false;

  if (projection == 0) {
    p0(displayCoord, lonLat0, lonLat);
  } else if (projection == 1) {
    p1(displayCoord, lonLat0, lonLat);
  } else if (projection == 2) {
    p2(displayCoord, lonLat0, lonLat);
  } else if (projection == 3) {
    p3(displayCoord, lonLat0, lonLat, clip);
  } else if (projection == 4) {
    p4(displayCoord, lonLat0, lonLat, clip, zoom);
  } else if (projection == 5) {
    p5(displayCoord, lonLat0, lonLat);
  } else if (projection == 6) {
    p6(displayCoord, lonLat0, lonLat);
  } else if (projection == 7) {
    p7(displayCoord, lonLat0, lonLat);
  } else if (projection == 8) {
    p8(displayCoord, lonLat0, lonLat);
  }

  displayCoord.y -= yTranslate;
}
