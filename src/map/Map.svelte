<script>
  import { onMount } from 'svelte';
  import { resizeCanvasToDisplaySize } from 'twgl.js';

  import MapBackground from './background.js';
  import ParticleSimulator from './particle/simulator.js';
  import ParticleSimulatorMobile from './particle/mobile/simulator.js';

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
  export let particlesShown = false;
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
  export let MAX_TEXTURE_SIZE = Infinity;

  let mpcTestCanvas;
  let webgl2TestCanvas;
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

  let mapBackground = {};
  $: mapBackground.data = splitIfNeeded(griddedData);
  $: mapBackground.colormap = griddedColormap;
  $: mapBackground.domain = griddedDomain;
  $: mapBackground.scale = griddedScale;
  $: mapBackground.baseColor = griddedBaseColor;
  $: mapBackground.vectorData = vectorData;

  let particleSimulator = {};
  $: particleSimulator.data = particleData;
  $: particleSimulator.count = particleCount;
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
      scale: griddedScale,
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
    let canRenderToFloat = particleGl.getExtension('EXT_color_buffer_float')
                        || particleGl.getExtension('WEBGL_color_buffer_float');

    if (!canRenderToFloat || navigator.userAgent.includes("Mobi")) {
      particleSimulator =
        new ParticleSimulatorMobile(particleGl, particleSimulatorOptions);
    } else {
      particleSimulator =
        new ParticleSimulator(particleGl, particleSimulatorOptions);
    }

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

    if (particlesShown) {
      if (trailsNeedReset) {
        particleSimulator.resetTrails();
      }
      if (!particlesPaused || (particlesPaused && trailsNeedReset)) {
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
      if (trailsNeedReset) {
        trailsNeedReset = false;
      }
    }

    if (particlesNeedClearing) {
      particleGl.clear(particleGl.COLOR_BUFFER_BIT);
      particlesNeedClearing = false;
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

  function splitIfNeeded(griddedData) {
    if ( griddedData.width <= MAX_TEXTURE_SIZE
      || griddedData.width % 2 !== 0) return griddedData;

    let array;
    if (arrayCache.has(griddedData.floatArray)) {
      array = arrayCache.get(griddedData.floatArray);
    } else {
      array = new Uint16Array(griddedData.floatArray.buffer)
        .filter((_, i) => i % 2 === 0);
      arrayCache.set(griddedData.floatArray, array);
    }

    return {
      ...griddedData,
      floatArray: array,
      width: griddedData.width / 2,
    };
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
  :host {
    display: flex !important;
    width: 300px;
    height: 300px;
  }

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

<svelte:options tag="earth-map"/>
