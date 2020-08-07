<script>
  import { onMount } from 'svelte';
  import * as twgl from 'twgl.js';
  import * as topojson from 'topojson-client';
  import * as d3 from 'd3-scale-chromatic';
  import { rgb } from 'd3-color';

  import griddedVertexShader from './gridded.vert';
  import griddedFragmentShader from './gridded.frag';
  import vectorVertexShader from './vector.vert';
  import vectorFragmentShader from './vector.frag';

  export let projection = 3; // TODO: make this an enum
  export let center = {
    longitude: 0, // in degrees
    latitude: 0, // in degrees
  };
  export let zoom = 1;
  export let griddedTextureInfo = {
    width: 1440,
    height: 721,
  };

  let bgNeedsRedraw = true;
  // Whenever any of these variables change, ask for a redraw on next frame
  $: center, zoom, projection, griddedTexture, bgNeedsRedraw = true;

  // Limit ranges of latitude, longitude, and zoom
  $: center.latitude = Math.min(center.latitude, 90);
  $: center.latitude = Math.max(center.latitude, -90);
  $: center.longitude = ((center.longitude + 180) % 360) - 180;
  $: zoom = Math.min(zoom, 15);
  $: zoom = Math.max(zoom, 0.5);

  let mapCanvas;
  let canvasRatio;

  let gl;

  let griddedProgramInfo;
  let griddedBufferInfo;
  let griddedTexture;

  // Attributes passed to the gridded data layer vertex shader
  const griddedArrays = {
    // A grid of points
    a_position: {
      numComponents: 2, // Indicate we are using 2-dimensional points
      data: [ // two right triangles that cover entire screen
        -1, -1,
        -1,  1,
         1, -1,
         1,  1,
         1, -1,
        -1,  1,
      ],
    },
  };

  // load the file of floats (gridded data) into texture uniform
  async function getGriddedData(gl) {
    // quickly load a default grey texture first
    griddedTexture = twgl.createTexture(gl, {
      src: [42, 42, 42, 255],
      min: gl.LINEAR,
    });

    let buffer = await fetch('/data/gfs.f32').then(res => res.arrayBuffer());
    let data = new Float32Array(buffer);
    let texture = new Uint8Array(buffer);

    for (let i = 0; i < data.length; i++) {
      let color = rgb(d3.interpolateViridis((data[i] - 240) / 80));
      texture[4*i+0] = color.r;
      texture[4*i+1] = color.g;
      texture[4*i+3] = color.b;
      texture[4*i+3] = 255;
    }

    griddedTexture = twgl.createTexture(gl, {
      src: texture,
      mag: gl.NEAREST, // show zoomed in data as individual pixels
      min: gl.LINEAR,
      width: griddedTextureInfo.width,
      height: griddedTextureInfo.height,
    });
  }

  let vectorProgramInfo;
  let vectorBufferInfos = {}; // temporarily empty until TopoJSON file loads

  // load the TopoJSON file into vectorBufferInfos
  async function getVectorData(gl) {
    let data = await fetch('/data/topology.json').then(res => res.json());

    Object.keys(data.objects).forEach(obj => {
      let mesh = topojson.mesh(data, data.objects[obj]);
      let lineLengths = mesh.coordinates.map(points => points.length - 1);

      let currentIndex = 0;
      let indices = lineLengths.map(length => {
        // creates a subrange of indices with every index except the first and
        // last doubled, e.g. [0, 1, 1, 2, 2, 3], to represent one line
        let subRange = [
          currentIndex,
          ...Array.from(Array(length - 1).keys(), x => {
            let i = x + currentIndex + 1;
            return [i, i];
          }).flat(),
          currentIndex + length,
        ];
        currentIndex += length + 1;
        return subRange;
      }).flat();

      let arrays = {
        a_latLon: {
          numComponents: 2,
          data: mesh.coordinates.flat(2),
        },
        indices: indices,
      };

      vectorBufferInfos[obj] = {
        bufferInfo: twgl.createBufferInfoFromArrays(gl, arrays),
        color: (() => {
          if (obj === 'ne_50m_rivers_lake_centerlines') {
            return [1, 1, 1, 0.5]; // light
          } else if (obj === 'ne_50m_graticules_10') {
            return [1, 1, 1, 0.2]; // lighter
          } else {
            return [1, 1, 1, 1]; // bold
          }
        })(),
      }
    });
    bgNeedsRedraw = true;
  }

  // Begin map rendering after Svelte component has been mounted
  onMount(() => {
    gl = mapCanvas.getContext('webgl', { alpha: false });
    if (!gl) {
      return;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    griddedProgramInfo = twgl.createProgramInfo(gl, [
      griddedVertexShader,
      griddedFragmentShader,
    ]);
    griddedBufferInfo = twgl.createBufferInfoFromArrays(gl, griddedArrays);

    getGriddedData(gl);

    vectorProgramInfo = twgl.createProgramInfo(gl, [
      vectorVertexShader,
      vectorFragmentShader,
    ]);
    getVectorData(gl);

    // ensure correct the initial size of canvas and viewport
    gl.canvas.width = 0;
    gl.canvas.height = 0;
    updateSizeVariables(gl);

    requestAnimationFrame(render);
  });

  function updateSizeVariables(gl) {
    const ratio = window.devicePixelRatio;
    if (twgl.resizeCanvasToDisplaySize(gl.canvas, ratio)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      canvasRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
      bgNeedsRedraw = true;
    }
  }

  // Main animation loop
  function render(time) {
    updateSizeVariables(gl);

    if (bgNeedsRedraw) {
      drawMapBackground();
      bgNeedsRedraw = false;
    }

    requestAnimationFrame(render);
  }

  function drawMapBackground() {
    const bgUniforms = {
      u_texture: griddedTexture,
      u_gridWidth: griddedTextureInfo.width,
      u_gridHeight: griddedTextureInfo.height,
      u_canvasRatio: canvasRatio,
      u_lon0: center.longitude,
      u_lat0: center.latitude,
      u_zoom: zoom,
      u_projection: projection,
    };

    gl.useProgram(griddedProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, griddedProgramInfo, griddedBufferInfo);
    twgl.setUniforms(griddedProgramInfo, bgUniforms);
    twgl.drawBufferInfo(gl, griddedBufferInfo);

    // texture info not needed for vector layer
    delete bgUniforms.u_texture;
    delete bgUniforms.u_gridWidth;
    delete bgUniforms.u_gridHeight;

    gl.useProgram(vectorProgramInfo.program);

    Object.values(vectorBufferInfos).forEach(data => {
      bgUniforms.u_color = data.color;
      twgl.setBuffersAndAttributes(gl, vectorProgramInfo, data.bufferInfo);
      twgl.setUniforms(vectorProgramInfo, bgUniforms);
      twgl.drawBufferInfo(gl, data.bufferInfo, gl.LINES);
    });
  }
</script>

<canvas bind:this={mapCanvas}/>

<style>
  canvas {
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: -1;
  }
</style>
