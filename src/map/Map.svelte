<script>
  import { onMount } from 'svelte';
  import * as twgl from 'twgl.js';
  import * as topojson from 'topojson-client';

  import griddedVertexShader from './gridded.vert';
  import griddedFragmentShader from './gridded.frag';
  import vectorVertexShader from './vector.vert';
  import vectorFragmentShader from './vector.frag';

  export let projection = 3; // TODO: make this an enum
  export let latitude = 0; // in degrees
  export let longitude = 0; // in degrees
  export let zoom = 1;

  let bgNeedsRedraw = true;
  // Whenever any of these variables change, ask for a redraw on next frame
  $: latitude, longitude, zoom, bgNeedsRedraw = true;

  // Limit ranges of latitude, longitude, and zoom
  $: latitude = Math.min(latitude, 90);
  $: latitude = Math.max(latitude, -90);
  $: longitude = ((longitude + 180) % 360) - 180;
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
            return [0.5, 0.5, 0.5, 1]; // gray
          } else if (obj === 'ne_50m_graticules_10') {
            return [0.25, 0.25, 0.25, 1]; // darker gray
          } else {
            return [1, 1, 1, 1]; // white
          }
        })(),
      }
    });
    bgNeedsRedraw = true;
  }

  // Begin map rendering after Svelte component has been mounted
  onMount(() => {
    gl = mapCanvas.getContext('webgl');
    if (!gl) {
      return;
    }

    griddedProgramInfo = twgl.createProgramInfo(gl, [
      griddedVertexShader,
      griddedFragmentShader,
    ]);
    griddedBufferInfo = twgl.createBufferInfoFromArrays(gl, griddedArrays);

    // loads actual texture asynchronously; will be rendered when available,
    // should be a plate carée map projection with aspect ratio 2:1
    griddedTexture = twgl.createTexture(gl, {
      src: [
        42, 42, 42, 255,
        42, 42, 42, 255,
      ],
      min: gl.LINEAR,
    }, () => bgNeedsRedraw = true);


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
      u_canvasRatio: canvasRatio,
      u_lon0: longitude,
      u_lat0: latitude,
      u_zoom: zoom,
      u_projection: projection,
    };

    gl.useProgram(griddedProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, griddedProgramInfo, griddedBufferInfo);
    twgl.setUniforms(griddedProgramInfo, bgUniforms);
    twgl.drawBufferInfo(gl, griddedBufferInfo);

    delete bgUniforms.u_texture; // texture not needed for vector layer

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
    background-color: black;
  }
</style>
