<script>
  import { onMount } from 'svelte';
  import { reproj } from '../map/projections/';
  import { clamp, modulo } from '../math.js';
  import { genericLabel } from '../utility.js';

  export let minZoom;
  export let maxZoom;

  export let centerLongitude;
  export let centerLatitude;
  export let zoom;
  export let portraitBasedZoom;
  export let canvasRatio;

  export let inverseProjectionFunction;
  export let pins;
  export let cursor;

  export let kioskMode;

  let clientHeight = 1080;
  let dragPointers = new Map();
  let hoverPointer = null;
  let animationId = null;

  // For ensuring scale of gestures is properly relative to actual size of
  // rendered map; see the screenRatio variable in Map.svelte for details
  $: screenRatio = clientHeight / 1080;
  $: computedZoom = (portraitBasedZoom ? canvasRatio : 1) * zoom;
  $: panFactor = 0.25 / computedZoom / screenRatio;

  $: cursor = hoverPointer
    ? getLocation(hoverPointer, inverseProjectionFunction)
    : null;

  function handlePointerdown(e) {
    cancelCurrentFlick();
    e.target.setPointerCapture(e.pointerId);
    dragPointers.set(e.pointerId, new PointerHistory(e));
    hoverPointer = null;
  }

  function handlePointerup(e) {
    let pointerHistory = dragPointers.get(e.pointerId);
    if (!dragPointers.delete(e.pointerId)) return;

    e.target.releasePointerCapture(e.pointerId);
    if (dragPointers.size === 0) {
      hoverPointer = e;
      cancelCurrentFlick();
      pointerHistory.add(e);
      flick(pointerHistory.velocity);
    }
  }

  // Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1684355
  function clearDragpointers(e) {
    for (let id of dragPointers.keys()) {
      dragPointers.delete(id);
      e.target.releasePointerCapture(id);
    }
  }

  function handlePointermove(e) {
    let o1 = dragPointers.get(e.pointerId)?.latest;
    if (!o1) {
      if (dragPointers.size === 0) hoverPointer = e;
      return;
    }
    switch (dragPointers.size) {
      case 1:
        let lon = centerLongitude - panFactor * (e.clientX - o1.clientX);
        let lat = centerLatitude + panFactor * (e.clientY - o1.clientY);
        centerLongitude = modulo(lon, 360, -180);
        centerLatitude = clamp(lat, -90, 90);
        break;
      case 2:
        let o2Key = [...dragPointers.keys()].find(id => id !== e.pointerId);
        let o2 = dragPointers.get(o2Key).latest;
        let d1 = Math.hypot(o1.clientX - o2.clientX, o1.clientY - o2.clientY);
        let d2 = Math.hypot(e.clientX - o2.clientX, e.clientY - o2.clientY);
        zoom = clamp((1 + 0.005 * (d2 - d1)) * zoom, minZoom, maxZoom);
        break;
    }
    dragPointers.get(e.pointerId).add(e);
  }

  function handlePointerleave(e) {
    if (e.pointerId === hoverPointer?.pointerId) {
      hoverPointer = null;
    }
  }

  function handleWheel(e) {
    let z = e.deltaY > 0 ? zoom / 1.1 : zoom * 1.1;
    zoom = clamp(z, minZoom, maxZoom);
  }

  function getLocation(e, inverseProjectionFunction) {
    let rect = e.target.getBoundingClientRect();
    let point = [e.clientX - rect.left, e.clientY - rect.top];
    let lonLat = inverseProjectionFunction(point);
    return lonLat ? { longitude: lonLat[0], latitude: lonLat[1] } : null;
  }

  class PointerHistory {
    constructor(event) {
      this.arr = [];
      this.add(event);
    }

    add(event) {
      this.arr.push({ event, time: performance.now()});
    }

    get latest() {
      return this.arr[this.arr.length - 1].event;
    }

    get velocity() {
      let now = performance.now();
      let start = this.arr.find(o => now - o.time < 50);
      let dt = now - start.time;
      return [
        this.latest.clientX - start.event.clientX,
        this.latest.clientY - start.event.clientY,
      ].map(d => dt === 0 ? 0 : d / dt);
    }
  }

  function flick(velocity) {
    let startTime;
    let [lonSpeed, latSpeed] = velocity.map(v => panFactor * Math.abs(v));
    let [lonSign, latSign] = velocity.map(v => Math.sign(v));
    if (lonSpeed === 0 && latSpeed === 0) return;

    let accelFactor = 0.008 / (lonSpeed + latSpeed);
    let [lonAccel, latAccel] = [lonSpeed, latSpeed].map(v => v * accelFactor);

    let step = time => {
      let dt = startTime ? (time - startTime) : 0;
      startTime = time;

      let dLon = dt * lonSign * lonSpeed;
      let dLat = dt * latSign * latSpeed;

      centerLongitude = modulo(centerLongitude - dLon, 360, -180);
      centerLatitude = clamp(centerLatitude + dLat, -90, 90);

      lonSpeed -= dt * lonAccel;
      latSpeed -= dt * latAccel;

      if (lonSpeed <= 0 && latSpeed <= 0) return;

      animationId = requestAnimationFrame(step);
    }
    animationId = requestAnimationFrame(step);
  }

  function cancelCurrentFlick() {
    if (animationId !== null) cancelAnimationFrame(animationId);
  }
</script>

<div
  bind:clientHeight
  on:pointerdown={handlePointerdown}
  on:pointerup={handlePointerup}
  on:contextmenu={clearDragpointers}
  on:mouseup={clearDragpointers}
  on:pointermove={handlePointermove}
  on:pointerleave={handlePointerleave}
  on:wheel={handleWheel}
></div>

<style>
  div {
    touch-action: none;
    pointer-events: auto;
  }

  div:active {
    cursor: grabbing;
  }
</style>
