<script>
  import { onMount } from 'svelte';
  import { resizeCanvasToDisplaySize } from 'twgl.js';

  import MapBackground from './background.js';
  import ParticleSimulator from './particle/simulator.js';
  import ParticleSimulatorMobile from './particle/mobile/simulator.js';

  import colormaps from './colormaps/';
  import projections from './projections/';

  export let projection = projections.ORTHOGRAPHIC;
  export let center = {
    longitude: 0, // in degrees
    latitude: 0, // in degrees
  };
  export let zoom = 1;

  export let griddedOptions = {
    data: {
      float32Array: new Float32Array([0.2]),
      width: 1,
      height: 1,
    },
    colormap: colormaps.VIRIDIS,
    domain: [0, 1],
  };
  export let vectorFieldOptions = {
    data: {
      uVelocities: new Float32Array([0.2]),
      vVelocities: new Float32Array([0.2]),
      width: 1,
      height: 1,
    },
    particles: {
      rate: 5e4,
      count: 1,
      opacity: 0.1,
      fade: 0.96,
      lifetime: 1000, // milliseconds
      enabled: true,
    },
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
  $: mapBackground.data = griddedOptions.data;
  $: mapBackground.colormap = griddedOptions.colormap;
  $: mapBackground.domain = griddedOptions.domain;

  let particleSimulator = {};
  $: particleSimulator.data = vectorFieldOptions.data;
  $: particleSimulator.count = vectorFieldOptions.particles.count;
  $: particleSimulator.lifetime = vectorFieldOptions.particles.lifetime;

  let backgroundNeedsRedraw;
  let vectorDataLoaded = false;
  // when following variables are updated, redraw
  $: sharedUniforms, griddedOptions, vectorDataLoaded,
    backgroundNeedsRedraw = true;

  let simulatorNeedsReset;
  // when following variables are updated, reset
  $: sharedUniforms, vectorFieldOptions, simulatorNeedsReset = true;

  onMount(() => {
    // work around an issue with iOS / Safari
    const webkit = navigator.userAgent.includes("WebKit");

    backgroundGl = backgroundCanvas.getContext('webgl', { alpha: false });
    particleGl = particleCanvas.getContext('webgl', {
      premultipliedAlpha: webkit,
    });

    updateSizeVariables(backgroundGl, true);
    updateSizeVariables(particleGl, true);

    mapBackground = new MapBackground(backgroundGl, griddedOptions);

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

    updateSizeVariables(backgroundGl);
    updateSizeVariables(particleGl);

    vectorDataLoaded = mapBackground.vectorDataLoaded;

    if (backgroundNeedsRedraw) {
      mapBackground.drawGriddedData(sharedUniforms);
      mapBackground.drawGraticules(sharedUniforms);
      mapBackground.drawRivers(sharedUniforms);
      mapBackground.drawLakes(sharedUniforms);
      mapBackground.drawCoastlines(sharedUniforms);
      backgroundNeedsRedraw = false;
    }

    if (simulatorNeedsReset) {
      particleSimulator.resetTrails();
      simulatorNeedsReset = false;
    }

    if (vectorFieldOptions.particles.enabled) {
      particleSimulator.drawWithTrails(
        sharedUniforms,
        vectorFieldOptions.particles.opacity,
        vectorFieldOptions.particles.fade
      );
      particleSimulator.step(
        Math.min(timeDelta, 100),
        vectorFieldOptions.particles.rate
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

  function clamp(x, min, max) {
    return x > max ? max : (x < min ? min : x);
  }
</script>

<canvas bind:this={backgroundCanvas}/>
<canvas bind:this={particleCanvas}/>
