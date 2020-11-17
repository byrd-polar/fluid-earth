<script>
  import { onMount } from 'svelte';
  import { resizeCanvasToDisplaySize } from 'twgl.js';

  import MapBackground from './background.js';
  import ParticleSimulator from './particle/simulator.js';
  import ParticleSimulatorMobile from './particle/mobile/simulator.js';

  import colormaps from './colormaps/';
  import projections from './projections/';
  import topology from '../../public/data/topology.json';

  import { Float16Array } from '@petamoriken/float16';

  export let projection = projections.VERTICAL_PERSPECTIVE;
  export let center = {
    longitude: 0, // in degrees
    latitude: 0, // in degrees
  };
  export let zoom = 1;

  export let griddedData = {
    floatArray: new Float16Array([0.2]),
    width: 1,
    height: 1,
  };
  export let griddedColormap = colormaps.VIRIDIS;
  export let griddedDomain = [0, 1];

  export let particleData = {
    uVelocities: new Float16Array([0.2]),
    vVelocities: new Float16Array([0.2]),
    width: 1,
    height: 1,
  };
  export let particleLifetime = 1000; // milliseconds
  export let particleCount = 1e5;
  export let particleDisplay = {
    size: 0.8,
    rate: 5e4,
    opacity: 0.1,
    fade: 0.96,
    enabled: true,
  };

  const _FEV2R_WC = false; // set to true by webcomponent rollup config
  export let vectorData = _FEV2R_WC ? topology : { objects: {} };
  export let vectorColors = {
    // update the following if sources for topology.json change
    ne_50m_coastline: [1, 1, 1, 1],
    ne_50m_lakes: [1, 1, 1, 1],
    ne_50m_rivers_lake_centerlines: [1, 1, 1, 0.5],
    ne_50m_graticules_10: [1, 1, 1, 0.1],
  };

  export const updateWebglSize = force => {
    updateSizeVariables(backgroundGl, force);
    updateSizeVariables(particleGl, force);
  };

  let webgl2TestCanvas;
  let backgroundCanvas;
  let particleCanvas;
  let canvasRatio; // aspect ratio (width / height) of the canvas
  let screenRatio; // ratio of canvas height to our reference height

  let sharedUniforms;
  $: sharedUniforms = {
    u_canvasRatio: canvasRatio,
    u_screenRatio: screenRatio,
    u_lon0: center.longitude,
    u_lat0: center.latitude,
    u_zoom: zoom,
    u_projection: projection.id,
  };

  let backgroundGl;
  let particleGl;

  let mapBackground = {};
  $: mapBackground.data = griddedData;
  $: mapBackground.colormap = griddedColormap;
  $: mapBackground.domain = griddedDomain;
  $: mapBackground.vectorData = vectorData;

  let particleSimulator = {};
  $: particleSimulator.data = particleData;
  $: particleSimulator.count = particleCount;
  $: particleSimulator.lifetime = particleLifetime;

  let backgroundNeedsRedraw;
  // when following variables are updated, redraw
  $: sharedUniforms,
      griddedData,
      griddedColormap,
      griddedDomain,
      vectorData,
    backgroundNeedsRedraw = true;

  let trailsNeedsReset;
  // when following variables are updated, reset
  $: sharedUniforms,
      particleData,
      particleCount,
      particleLifetime,
      particleDisplay,
    trailsNeedsReset = true;

  onMount(() => {
    // work around an issue with iOS / Safari
    const webkit = navigator.userAgent.includes("WebKit");

    // Upgrade to webgl2 if supported so that the particle simulator works on
    // devices that support webgl2 but not OES_texture_float. Using a separate
    // canvas because getting context twice from the same canvas causes some
    // weird behavior across browsers.
    const webgl2 = (webgl2TestCanvas.getContext('webgl2') !== null);
    const webglVersion = webgl2 ? 'webgl2' : 'webgl';

    backgroundGl = backgroundCanvas.getContext(webglVersion, { alpha: false });
    particleGl = particleCanvas.getContext(webglVersion, {
      premultipliedAlpha: webkit,
    });

    mapBackground = new MapBackground(backgroundGl, {
      data: griddedData,
      colormap: griddedColormap,
      domain: griddedDomain,
      vectorData: vectorData,
      webgl2: webgl2,
    });

    let particleSimulatorOptions = {
      count: particleCount,
      lifetime: particleLifetime,
      data: particleData,
      webkit: webkit,
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

    updateWebglSize(true);
    requestAnimationFrame(render);
  });

  // Main animation loop
  let previousTime;
  function render(time) {
    let timeDelta = previousTime ? (time - previousTime) : 0;
    previousTime = time;

    // partial update of size variables for vastly improved performance when
    // opening side menus, but causes particle width to be slightly incorrect
    //
    // manually updating here instead of relying on $: notation to ensure
    // frame-by-frame accuracy
    canvasRatio = backgroundCanvas.clientWidth / backgroundCanvas.clientHeight;
    if (sharedUniforms.u_canvasRatio !== canvasRatio) {
      sharedUniforms.u_canvasRatio = canvasRatio;
    }

    if (backgroundNeedsRedraw) {
      mapBackground.drawGriddedData(sharedUniforms);
      mapBackground.drawVectorData(sharedUniforms, vectorColors);
      backgroundNeedsRedraw = false;
    }

    if (trailsNeedsReset) {
      particleSimulator.resetTrails();
      trailsNeedsReset = false;
    }

    if (particleDisplay.enabled) {
      particleSimulator.drawWithTrails(
        sharedUniforms,
        particleDisplay.size,
        particleDisplay.opacity,
        particleDisplay.fade
      );
      particleSimulator.step(
        Math.min(timeDelta, 100),
        particleDisplay.rate
      );
    }

    requestAnimationFrame(render);
  }

  function updateSizeVariables(gl, force) {
    const ratio = window.devicePixelRatio;
    if (resizeCanvasToDisplaySize(gl.canvas, ratio) || force) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      canvasRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

      // We want our particles to be sized relative to the scale of the map,
      // which by our design shrinks when we decrease the canvas height (see the
      // draw.vert files). A height of 1080 pixels is chosen as reference for
      // developer convenience, but this only really changes the units of the
      // particleDisplay.size variable.
      screenRatio = gl.canvas.height / 1080;

      backgroundNeedsRedraw = true;
    }
  }
</script>

<div class="layers">
  <canvas bind:this={webgl2TestCanvas} hidden/>
  <canvas bind:this={backgroundCanvas}/>
  <canvas bind:this={particleCanvas}/>
  <slot></slot>
</div>

<style>
  div.layers {
    position: relative;
    flex: 1;
  }

  :global(div.layers > *) {
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
