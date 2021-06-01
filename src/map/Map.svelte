<script context="module">
  const updateWebglResolutionFunctions = new Set();

  export function updateAllWebglResolutions() {
    updateWebglResolutionFunctions.forEach(f => f());
  }
</script>

<script>
  import { onMount } from 'svelte';
  import { resizeCanvasToDisplaySize } from 'twgl.js';

  import MapBackground from './background.js';
  import ParticleSimulator from './particle/simulator.js';
  import ParticleSimulatorMobile from './particle/mobile/simulator.js';

  import colormaps from './colormaps/';
  import projections, { proj } from './projections/';
  import dataProjections from './data-projections/';

  import { Float16Array } from '@petamoriken/float16';

  export let centerLongitude = 0; // in degrees
  export let centerLatitude = 0; // in degrees
  export let zoom = 1;
  export let projection = projections.VERTICAL_PERSPECTIVE;

  export let griddedData = {
    floatArray: new Float16Array([-Infinity]),
    width: 1,
    height: 1,
    projection: dataProjections.GFS,
  };
  export let griddedColormap = colormaps.VIRIDIS;
  export let griddedDomain = [0, 1];
  export let griddedBaseColor = [38, 38, 38, 1]; // rgba greyish color

  export let particleData = {
    uVelocities: new Float16Array([0]),
    vVelocities: new Float16Array([0]),
    width: 1,
    height: 1,
    projection: dataProjections.GFS,
  };
  export let particlesShown = true;
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

  export const updateWebglResolution = force => {
    updateResolution(backgroundGl, force);
    updateResolution(particleGl, force);
  };

  let clientWidth, clientHeight;

  export let d3geoProjection;
  let d3geoProjectionNeedsUpdate;
  // when following variables are updated, update
  $: projection,
      centerLongitude,
      centerLatitude,
      clientWidth,
      clientHeight,
      zoom,
    d3geoProjectionNeedsUpdate = true;

  export let MAX_TEXTURE_SIZE = Infinity;

  let mpcTestCanvas;
  let webgl2TestCanvas;
  let backgroundCanvas;
  let particleCanvas;

  let projectionUniforms;
  $: u_griddedDataProjection = griddedData.projection.id;
  $: u_particleDataProjection = particleData.projection.id
  $: projectionUniforms = {
    u_lon0: centerLongitude,
    u_lat0: centerLatitude,
    u_zoom: zoom,
    u_projection: projection.id,
    u_griddedDataProjection,
    u_particleDataProjection,
  };

  let backgroundGl;
  let particleGl;

  let mapBackground = {};
  $: mapBackground.data = griddedData;
  $: mapBackground.colormap = griddedColormap;
  $: mapBackground.domain = griddedDomain;
  $: mapBackground.baseColor = griddedBaseColor;
  $: mapBackground.vectorData = vectorData;

  let particleSimulator = {};
  $: particleSimulator.data = particleData;
  $: particleSimulator.count = particleCount;
  $: particleSimulator.lifetime = particleLifetime;

  let backgroundNeedsRedraw;
  // when following variables are updated, redraw
  $: projectionUniforms,
      griddedData,
      griddedColormap,
      griddedDomain,
      griddedBaseColor,
      vectorData,
    backgroundNeedsRedraw = true;

  let trailsNeedsReset;
  // when following variables are updated, reset
  $: projectionUniforms,
      particleData,
      particleCount,
      particleLifetime,
      particleDisplay,
    trailsNeedsReset = true;

  let particlesNeedClearing = false;
  $: if (!particlesShown) {
    particlesNeedClearing = true;
  }

  onMount(() => {
    // Work around an issue with software-based webgl not being able to do blend
    // particles properly with `premultipledAlpha: true` (the default). This
    // value for premultipledAlpha is needed as an additional workaround for
    // Safari, which does not properly render `premultipledAlpha: false`.
    const majorPerformanceCaveat = (mpcTestCanvas.getContext('webgl', {
      failIfMajorPerformanceCaveat: true,
    }) === null);
    mpcTestCanvas.remove();

    // Upgrade to webgl2 if supported so that the particle simulator works on
    // devices that support webgl2 but not OES_texture_float. Using a separate
    // canvas because getting context twice from the same canvas causes some
    // weird behavior across browsers.
    const webgl2 = (webgl2TestCanvas.getContext('webgl2') !== null);
    const webglVersion = webgl2 ? 'webgl2' : 'webgl';
    webgl2TestCanvas.remove();

    backgroundGl = backgroundCanvas.getContext(webglVersion, { alpha: true });
    particleGl = particleCanvas.getContext(webglVersion, {
      premultipliedAlpha: !majorPerformanceCaveat,
    });

    MAX_TEXTURE_SIZE = backgroundGl.getParameter(backgroundGl.MAX_TEXTURE_SIZE);

    mapBackground = new MapBackground(backgroundGl, {
      data: griddedData,
      colormap: griddedColormap,
      domain: griddedDomain,
      baseColor: griddedBaseColor,
      vectorData: vectorData,
      webgl2: webgl2,
    });

    let particleSimulatorOptions = {
      count: particleCount,
      lifetime: particleLifetime,
      data: particleData,
      majorPerformanceCaveat: majorPerformanceCaveat,
      webgl2: webgl2,
    }

    // Use a different particle simulator for older devices that don't support
    // rendering to float textures at all and for mobile devices because of
    // issues rendering to float textures despite supporting the extension.
    let canRenderToFloat =
      particleGl.getExtension('EXT_color_buffer_float') ||
      particleGl.getExtension('WEBGL_color_buffer_float');

    if (!canRenderToFloat || navigator.userAgent.includes("Mobi")) {
      particleSimulator =
        new ParticleSimulatorMobile(particleGl, particleSimulatorOptions);
    } else {
      particleSimulator =
        new ParticleSimulator(particleGl, particleSimulatorOptions);
    }

    updateWebglResolution(true);
    updateWebglResolutionFunctions.add(updateWebglResolution);

    requestAnimationFrame(render);

    return () => updateWebglResolutionFunctions.delete(updateWebglResolution);
  });

  // Main animation loop
  let previousTime;
  let previousCanvasRatio;
  let previousScreenRatio;
  function render(time) {
    let timeDelta = previousTime ? (time - previousTime) : 0;
    previousTime = time;

    // Update canvas and screen ratios every frame without updating resolution
    // for vastly improved performance (compared to also updating resolution
    // every frame) when opening side menus, but causes particle width to be
    // slightly incorrect until updateWebglResolution is called.
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
    let canvasRatio = clientWidth / clientHeight;
    let screenRatio = window.devicePixelRatio * clientHeight / 1080;

    let sharedUniforms = {
      u_canvasRatio: canvasRatio,
      u_screenRatio: screenRatio,
      ...projectionUniforms,
    };

    if (canvasRatio !== previousCanvasRatio ||
        screenRatio !== previousScreenRatio) {
      previousCanvasRatio = canvasRatio;
      previousScreenRatio = screenRatio;
      backgroundNeedsRedraw = true;
      trailsNeedsReset = true;
    }

    if (backgroundNeedsRedraw) {
      mapBackground.drawGriddedData(sharedUniforms);
      mapBackground.drawVectorData(sharedUniforms, vectorColors);
      backgroundNeedsRedraw = false;
    }

    if (particlesShown) {
      if (trailsNeedsReset) {
        particleSimulator.resetTrails();
      }
      if (!particlesPaused || (particlesPaused && trailsNeedsReset)) {
        particleSimulator.drawWithTrails(
          sharedUniforms,
          particleDisplay.size * (projection.particleSizeFactor || 1),
          particleDisplay.opacity,
          particleDisplay.opacitySpeedDecay,
          particleDisplay.fade
        );
      }
      if (!particlesPaused) {
        particleSimulator.step(
          sharedUniforms,
          Math.min(timeDelta, 100),
          particleDisplay.rate
        );
      }
      if (trailsNeedsReset) {
        trailsNeedsReset = false;
      }
    }

    if (particlesNeedClearing) {
      particleGl.clear(particleGl.COLOR_BUFFER_BIT);
      particlesNeedClearing = false;
    }

    // limit update of d3geoProjection to the rate of the animation loop to keep
    // pins in better sync with underlying webgl map
    if (d3geoProjectionNeedsUpdate) {
      d3geoProjection = proj(
        projection,
        centerLongitude,
        centerLatitude,
        clientWidth,
        clientHeight,
        zoom
      );
      d3geoProjectionNeedsUpdate = false;
    }

    requestAnimationFrame(render);
  }

  function updateResolution(gl, force) {
    const ratio = window.devicePixelRatio;
    if (resizeCanvasToDisplaySize(gl.canvas, ratio) || force) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      backgroundNeedsRedraw = true;
      trailsNeedsReset = true;
    }
  }
</script>

<div class="layers">
  <canvas bind:this={mpcTestCanvas} hidden/>
  <canvas bind:this={webgl2TestCanvas} hidden/>
  <slot name="background"></slot>
  <canvas bind:this={backgroundCanvas}/>
  <canvas bind:this={particleCanvas}/>
  <slot></slot>
</div>

<style>
  div.layers {
    position: relative;
    flex: 1;
  }

  div.layers > :global(*) {
    width: 100%;
    height: 100%;
    position: absolute;
  }

  /* following rules are the equivalent of the above for the web component */
  div.layers > *, ::slotted(*) {
    width: 100%;
    height: 100%;
    position: absolute;
  }
</style>

<svelte:options tag="fever-map"/>
