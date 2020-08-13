<script>
  import { onMount } from 'svelte';
  import * as twgl from 'twgl.js';

  import griddedVertexShader from './gridded.vert';
  import griddedFragmentShader from './gridded.frag';
  import vectorVertexShader from './vector.vert';
  import vectorFragmentShader from './vector.frag';

  import { griddedArrays } from './arrays.js';
  import { createGriddedDataLoader, getVectorData } from './loaders.js';

  import colormaps from './colormaps/';
  import projections from './projections/';

  export let projection = projections.ORTHOGRAPHIC;
  export let center = {
    longitude: 0, // in degrees
    latitude: 0, // in degrees
  };
  export let zoom = 1;
  export let griddedTextureInfo = {
    data: '/data/gfs-temperature.f32',
    colormap: colormaps.VIRIDIS,
    domain: [220, 340],
    width: 1440,
    height: 721,
  };

  let bgNeedsRedraw = true;
  // Whenever any of these variables change, ask for a redraw on next frame
  $: center, zoom, projection, griddedTexture, vectorBufferInfos,
    bgNeedsRedraw = true;

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
  let griddedDataLoader;;
  let griddedTexture;

  let griddedDataNeedsReload = true;
  // Whenever texture info changes, ask for reload on next frame
  $: griddedTextureInfo,
    griddedDataNeedsReload = true;

  let vectorProgramInfo;
  let vectorBufferInfos = {}; // temporarily empty until TopoJSON file loads

  // Begin map rendering after Svelte component has been mounted
  onMount(() => {
    gl = mapCanvas.getContext('webgl', { alpha: false });
    if (!gl) {
      return;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.getExtension('OES_texture_float'); // used to load gridded data

    griddedProgramInfo = twgl.createProgramInfo(gl, [
      griddedVertexShader,
      griddedFragmentShader,
    ]);
    griddedBufferInfo = twgl.createBufferInfoFromArrays(gl, griddedArrays);

    // quickly load a default grey texture first
    griddedTexture = twgl.createTexture(gl, {
      src: [42, 42, 42, 255],
      min: gl.LINEAR,
    });

    griddedDataLoader = createGriddedDataLoader(gl);

    vectorProgramInfo = twgl.createProgramInfo(gl, [
      vectorVertexShader,
      vectorFragmentShader,
    ]);

    (async () => vectorBufferInfos = await getVectorData(gl))();

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

    if (griddedDataNeedsReload) {
      (async () => {
        griddedTexture = await griddedDataLoader(griddedTextureInfo);
      })();
      griddedDataNeedsReload = false;
    }

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
    twgl.setUniformsAndBindTextures(griddedProgramInfo, bgUniforms);
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
