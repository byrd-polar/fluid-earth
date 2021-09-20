<script>
  export let displayMode;

  const minutesBeforeReload = 5;
  const resetEvents = ['pointermove', 'keydown', 'scroll'];

  let timeout;

  $: if (displayMode) {
    restartTimer();
    resetEvents.forEach(e => document.addEventListener(e, restartTimer));
  } else {
    stopTimer();
    resetEvents.forEach(e => document.removeEventListener(e, restartTimer));
  }

  function restartTimer() {
    stopTimer();
    timeout = window.setTimeout(reloadPage, minutesBeforeReload * 60 * 1000);
  }

  function stopTimer() {
    window.clearTimeout(timeout);
  }

  function reloadPage() {
    window.history.replaceState(null, '', '#dmode=true');
    window.location.reload();
  }
</script>
