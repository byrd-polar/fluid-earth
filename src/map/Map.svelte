<script>
  import { onMount } from 'svelte';
  import { resizeCanvasToDisplaySize } from 'twgl.js';

  import MapBackground from './background.js';
  import ParticleSimulator from './particle/simulator.js';

  import projections, { proj, clipped, reproj } from './projections/';
  import dataProjections from './data-projections/';

  import { Float16Array } from '@petamoriken/float16';

  export { projections };
  export { dataProjections };

  export let centerLongitude = 0; // in degrees
  export let centerLatitude = 0; // in degrees
  export let zoom = 1;
  export let portraitBasedZoom = false;
  export let projection = projections.VERTICAL_PERSPECTIVE;

  export let griddedData = {
    floatArray: new Float16Array([-Infinity]),
    width: 1,
    height: 1,
    projection: dataProjections.GFS,
  };
  export let griddedColormap = {
    lut: [
      [0, 0, 0],
      [127, 127, 127],
    ],
  };
  export let griddedDomain = [0, 1];
  export let griddedScale = 'linear';
  export let griddedBaseColor = [38, 38, 38, 1]; // rgba greyish color

  export let particleData = {
    uVelocities: new Float16Array([0]),
    vVelocities: new Float16Array([0]),
    width: 1,
    height: 1,
    projection: dataProjections.GFS,
  };

  function isEmptyDataArray(arr) {
    return arr.length === 1 && arr[0] === -Infinity;
  }

  export let particlesPaused = false;
  export let particleLifetime = 1000; // milliseconds
  export let particleCount = 1e5;
  export let particleDisplay = {
    size: 0.8,
    rate: 5e4,
    opacity: 0.4,
    opacitySpeedDecay: 0.8,
    fade: 0.96,
  };

  export let vectorData = { objects: {} };
  export let vectorColors = {};

  let clientWidth, clientHeight;

  let d3geoProjection = projection.function;
  let d3geoProjectionNeedsUpdate;
  // when following variables are updated, update
  $: projection,
      centerLongitude,
      centerLatitude,
      clientWidth,
      clientHeight,
      zoom,
    d3geoProjectionNeedsUpdate = true;

  export let forwardProjectionFunction;
  export let inverseProjectionFunction;

  $: forwardProjectionFunction = lonLat => {
    if (clipped(d3geoProjection, lonLat)) return null;

    return d3geoProjection(lonLat);
  };

  $: inverseProjectionFunction = point => {
    let lonLat = d3geoProjection.invert(point);

    if (!reproj(d3geoProjection, point, lonLat)) return null;

    return lonLat;
  };

  export let syncWithAnimationHook = () => {};
  export let canvasRatio = 1;

  let backgroundCanvas;
  let particleCanvas;

  let projectionUniforms;
  $: projectionUniforms = {
    u_lon0: centerLongitude,
    u_lat0: centerLatitude,
    u_projection: projection.id,
    u_translateY: projection.translateY,
  };

  let backgroundGl;
  let particleGl;

  let webglError = false;

  let mapBackground = {};
  $: mapBackground.data = griddedData;
  $: mapBackground.colormap = griddedColormap;
  $: mapBackground.domain = griddedDomain;
  $: mapBackground.scale = griddedScale;
  $: mapBackground.baseColor = griddedBaseColor;
  $: mapBackground.vectorData = vectorData;

  let particleSimulator = {};
  $: particleSimulator.data = particleData;
  $: particleSimulator.count = particleCount || 1;
  $: particleSimulator.lifetime = particleLifetime;

  let backgroundNeedsRedraw;
  // when following variables are updated, redraw
  $: projectionUniforms,
      zoom,
      griddedData,
      griddedColormap,
      griddedDomain,
      griddedScale,
      griddedBaseColor,
      vectorData,
      vectorColors,
    backgroundNeedsRedraw = true;

  let trailsNeedReset;
  // when following variables are updated, reset
  $: projectionUniforms,
      zoom,
      particleData,
      particleCount,
      particleLifetime,
      particleDisplay,
    trailsNeedReset = true;

  onMount(() => {
    backgroundGl = backgroundCanvas.getContext('webgl2', { alpha: true });
    particleGl = particleCanvas.getContext('webgl2');

    if (!backgroundGl) {
      webglError = true;
      return;
    }

    mapBackground = new MapBackground(backgroundGl, {
      data: griddedData,
      colormap: griddedColormap,
      domain: griddedDomain,
      scale: griddedScale,
      baseColor: griddedBaseColor,
      vectorData: vectorData,
    });

    particleSimulator = new ParticleSimulator(particleGl, {
      count: particleCount || 1,
      lifetime: particleLifetime,
      data: particleData,
    });

    updateResolution(backgroundGl, true);
    updateResolution(particleGl, true);

    requestAnimationFrame(render);
  });

  // Main animation loop
  let previousTime;
  let previousWidth, previousHeight, previousPixelRatio, resizing = false;
  function render(time) {
    // Avoid hot module reloading throwing (recoverable) error in development
    if (!backgroundCanvas) return;

    let timeDelta = previousTime ? (time - previousTime) : 0;
    previousTime = time;

    // Update canvas and screen ratios every frame without updating resolution
    // for vastly improved performance (compared to also updating resolution
    // every frame) when opening side menus, but causes particle width to be
    // slightly incorrect until canvas dimensions stop changing.
    //
    // canvasRatio is aspect ratio (width / height) of the canvas
    // screenRatio is ratio of canvas height to our reference height
    //
    // We want our particles to be sized relative to the scale of the map, which
    // by our design shrinks when we decrease the canvas height (see the
    // draw.vert files). A height of 1080 pixels is chosen as reference for
    // developer convenience, but this only really changes the units of the
    // particleDisplay.size variable.
    clientWidth = backgroundCanvas.clientWidth;
    clientHeight = backgroundCanvas.clientHeight;
    canvasRatio = clientWidth / clientHeight;
    let pixelRatio = window.devicePixelRatio;
    let screenRatio = pixelRatio * clientHeight / 1080;
    let computedZoom = (portraitBasedZoom ? canvasRatio : 1) * zoom;

    let sharedUniforms = {
      u_canvasRatio: canvasRatio,
      u_screenRatio: screenRatio,
      u_zoom: computedZoom,
      u_griddedDataProjection: griddedData.projection.id,
      u_particleDataProjection: particleData.projection.id,
      ...projectionUniforms,
    };

    if ( clientWidth !== previousWidth
      || clientHeight !== previousHeight
      || pixelRatio !== previousPixelRatio
    ) {
      backgroundNeedsRedraw = true;
      trailsNeedReset = true;
      resizing = true;

    } else if (resizing) {
      resizing = false;
      // dimensions have stopped changing each frame, so perform expensive
      // resolution operations here
      updateResolution(backgroundGl);
      updateResolution(particleGl);
    }

    previousWidth = clientWidth;
    previousHeight = clientHeight;
    previousPixelRatio = pixelRatio;

    // limit update of d3geoProjection to the rate of the animation loop to keep
    // pins in better sync with underlying webgl map
    if (d3geoProjectionNeedsUpdate) {
      d3geoProjection = proj(
        projection,
        centerLongitude,
        centerLatitude,
        clientWidth,
        clientHeight,
        computedZoom,
      );
      d3geoProjectionNeedsUpdate = false;
    }

    if (backgroundNeedsRedraw) {
      mapBackground.drawGriddedData(sharedUniforms);
      mapBackground.drawVectorData(sharedUniforms, vectorColors);
      syncWithAnimationHook();
      backgroundNeedsRedraw = false;
    }

    if (trailsNeedReset) {
      particleSimulator.resetTrails();
      trailsNeedReset = false;
    }

    if (!particlesPaused && particleCount !== 0) {
      particleSimulator.drawWithTrails(
        sharedUniforms,
        particleDisplay.size * (projection.particleSizeFactor || 1),
        particleDisplay.opacity,
        particleDisplay.opacitySpeedDecay,
        particleDisplay.fade
      );
      particleSimulator.step(
        sharedUniforms,
        Math.min(timeDelta, 100),
        particleDisplay.rate
      );
    }

    requestAnimationFrame(render);
  }

  function updateResolution(gl, force) {
    const ratio = window.devicePixelRatio;
    if (resizeCanvasToDisplaySize(gl.canvas, ratio) || force) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      backgroundNeedsRedraw = true;
      trailsNeedReset = true;
    }
  }

  const arrayCache = new Map();
</script>

<div class="layers">
  <slot name="background"></slot>
  <canvas bind:this={backgroundCanvas}/>
  <canvas bind:this={particleCanvas}/>
  <slot></slot>
  {#if webglError}
    <div class="error">
      <p>Could not display globe.</p>
      <p>
        Please
        <a href="https://get.webgl.org/webgl2/">upgrade for WebGL2</a>.
      </p>
    </div>
  {/if}
</div>

<style>
  :host {
    display: flex !important;
    width: 300px;
    height: 300px;
  }

  div.layers {
    position: relative;
    flex: 1;
  }

  div.layers > :global(*),
  div.layers > :global(::slotted(*)) { /* for the webcomponent */
    width: 100%;
    height: 100%;
    position: absolute;
  }

  div.error {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    pointer-events: none;
  }

  p {
    pointer-events: auto;
    margin-top: 0;
  }
</style>

<svelte:options customElement="earth-map" />
