<script>
  import { onMount } from 'svelte';
  import { resizeCanvasToDisplaySize } from 'twgl.js';

  import MapBackground from './background.js';
  import ParticleSimulator from './particle/simulator.js';

  export let projection = projections.ORTHOGRAPHIC;
  export let center = {
    longitude: 0, // in degrees
    latitude: 0, // in degrees
  };
  export let zoom = 1;

  $: center.latitude = clamp(center.latitude, -90, 90);
  $: center.longitude = ((center.longitude + 180) % 360) - 180;
  $: zoom = clamp(zoom, 0.5, 15);

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
      count: 1e5,
      lifetime: 1000, // milliseconds
      enabled: true,
    },
  };

  let backgroundCanvas;
  let particleCanvas;
  let canvasRatio;

  let backgroundNeedsRedraw;
  $: projection, center, zoom, griddedOptions, backgroundNeedsRedraw = true;

  let backgroundGl;
  let particleGl;

  let mapBackground = {};
  $: mapBackground.data = griddedOptions.data;
  $: mapBackground.colormap = griddedOptions.colormap;
  $: mapBackground.domain = griddedOptions.domain;

  let particleSimulator = {};
  $: particleSimulator.rate = vectorFieldOptions.particles.rate;
  $: particleSimulator.count = vectorFieldOptions.particles.count;
  $: particleSimulator.lifetime = vectorFieldOptions.particles.lifetime;
  $: particleSimulator.data = vectorFieldOptions.data;

  onMount(() => {
    backgroundGl = backgroundCanvas.getContext('webgl', { alpha: false });
    particleGl = particleCanvas.getContext('webgl');

    mapBackground = new MapBackground(backgroundGl, griddedOptions);
    particleSimulator = new ParticleSimulator(particleGl, vectorFieldOptions);

    updateSizeVariables(backgroundGl);
    updateSizeVariables(particleGl);

    requestAnimationFrame(render);
  });

  // Main animation loop
  let previousTime;
  function render(time) {
    let timeDelta = previousTime ? (time - previousTime) : 0;
    previousTime = time;

    updateSizeVariables(backgroundGl);
    updateSizeVariables(particleGl);

    const sharedUniforms = {
      u_canvasRatio: canvasRatio,
      u_lon0: center.longitude,
      u_lat0: center.latitude,
      u_zoom: zoom,
      u_projection: projection.id,
    };

    if (backgroundNeedsRedraw) {
      mapBackground.drawGriddedData(sharedUniforms);
      mapBackground.drawGraticules(sharedUniforms);
      mapBackground.drawRivers(sharedUniforms);
      mapBackground.drawLakes(sharedUniforms);
      mapBackground.drawCoastlines(sharedUniforms);
      backgroundNeedsRedraw = false;
    }

    if (vectorFieldOptions.particles.enabled) {
      particleSimulator.draw(sharedUniforms);
      particleSimulator.step(Math.min(timeDelta, 100));
    }

    requestAnimationFrame(render);
  }

  function updateSizeVariables(gl) {
    const ratio = window.devicePixelRatio;
    if (resizeCanvasToDisplaySize(gl.canvas, ratio)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      canvasRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
      backgroundNeedsRedraw = true;
    }
  }

  function clamp(x, min, max) {
    return x > max ? max : (x < min ? min : x);
  }
</script>

<div>
  <canvas bind:this={backgroundCanvas}/>
  <canvas bind:this={particleCanvas}/>
</div>

<style>
  canvas {
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: -1;
  }
</style>
