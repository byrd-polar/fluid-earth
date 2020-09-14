<script>
  import { onMount } from 'svelte';
  import { resizeCanvasToDisplaySize } from 'twgl.js';

  import MapBackground from './background.js';
  import ParticleSimulator from './particle/simulator.js';
  import ParticleSimulatorMobile from './particle/mobile/simulator.js';

  import colormaps from './colormaps/';
  import projections from './projections/';

  export let projection = projections.EQUIRECTANGULAR;
  export let center = {
    longitude: 0, // in degrees
    latitude: 0, // in degrees
  };
  export let zoom = 1;

  export let griddedData = {
    float32Array: new Float32Array([0.2]),
    width: 1,
    height: 1,
  };
  export let griddedColormap = colormaps.VIRIDIS;
  export let griddedDomain = [0, 1];

  export let particleData = {
    uVelocities: new Float32Array([0.2]),
    vVelocities: new Float32Array([0.2]),
    width: 1,
    height: 1,
  };
  export let particleLifetime = 1000; // milliseconds
  export let particleCount = 1e5;
  export let particleDisplay = {
    rate: 5e4,
    opacity: 0.1,
    fade: 0.96,
    enabled: true,
  };

  let backgroundCanvas;
  let particleCanvas;
  let canvasRatio;

  let sharedUniforms;
  $: sharedUniforms = {
    u_canvasRatio: canvasRatio,
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

  let particleSimulator = {};
  $: particleSimulator.data = particleData;
  $: particleSimulator.count = particleCount;
  $: particleSimulator.lifetime = particleLifetime;

  let backgroundNeedsRedraw;
  let vectorDataLoaded = false;
  // when following variables are updated, redraw
  $: sharedUniforms,
      griddedData,
      griddedColormap,
      griddedDomain,
      vectorDataLoaded,
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

    backgroundGl = backgroundCanvas.getContext('webgl', { alpha: false });
    particleGl = particleCanvas.getContext('webgl', {
      premultipliedAlpha: webkit,
    });

    updateSizeVariables(backgroundGl, true);
    updateSizeVariables(particleGl, true);

    window.addEventListener('resize', () => {
      updateSizeVariables(backgroundGl);
      updateSizeVariables(particleGl);
    });

    mapBackground = new MapBackground(backgroundGl, {
      data: griddedData,
      colormap: griddedColormap,
      domain: griddedDomain,
    });

    let vectorFieldOptions = {
      count: particleCount,
      lifetime: particleLifetime,
      data: particleData,
    }

    // use a different particle simulator for mobile devices because of issues
    // rendering to float textures
    if (navigator.userAgent.includes("Mobi")) {
      particleSimulator =
        new ParticleSimulatorMobile(particleGl, vectorFieldOptions, webkit);
    } else {
      particleSimulator =
        new ParticleSimulator(particleGl, vectorFieldOptions, webkit);
    }

    requestAnimationFrame(render);
  });

  // Main animation loop
  let previousTime;
  function render(time) {
    let timeDelta = previousTime ? (time - previousTime) : 0;
    previousTime = time;

    updateCanvasRatio(backgroundGl);
    updateCanvasRatio(particleGl);

    vectorDataLoaded = mapBackground.vectorDataLoaded;

    if (backgroundNeedsRedraw) {
      mapBackground.drawGriddedData(sharedUniforms);
      mapBackground.drawGraticules(sharedUniforms);
      mapBackground.drawRivers(sharedUniforms);
      mapBackground.drawLakes(sharedUniforms);
      mapBackground.drawCoastlines(sharedUniforms);
      backgroundNeedsRedraw = false;
    }

    if (trailsNeedsReset) {
      particleSimulator.resetTrails();
      trailsNeedsReset = false;
    }

    if (particleDisplay.enabled) {
      particleSimulator.drawWithTrails(
        sharedUniforms,
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
      backgroundNeedsRedraw = true;
    }
  }

  // partial update of size variables for vastly improved performance when
  // opening side menus, but causes particle width to be slightly incorrect
  function updateCanvasRatio(gl) {
    canvasRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
  }
</script>

<canvas bind:this={backgroundCanvas}/>
<canvas bind:this={particleCanvas}/>
