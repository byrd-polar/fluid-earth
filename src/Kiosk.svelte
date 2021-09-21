<script>
  export let kioskMode;

  const minutesBeforeReload = 5;
  const resetEvents = ['pointermove', 'keydown', 'scroll'];

  let timeout;

  $: if (kioskMode) {
    restartTimer();
    resetEvents.forEach(e => document.addEventListener(e, restartTimer));
    document.addEventListener('contextmenu', disableContextMenu);
  } else {
    stopTimer();
    resetEvents.forEach(e => document.removeEventListener(e, restartTimer));
    document.removeEventListener('contextmenu', disableContextMenu);
  }

  function restartTimer() {
    stopTimer();
    timeout = window.setTimeout(reloadPage, minutesBeforeReload * 60 * 1000);
  }

  function stopTimer() {
    window.clearTimeout(timeout);
  }

  function reloadPage() {
    window.history.replaceState(null, '', '#kmode=true');
    window.location.reload();
  }

  function disableContextMenu(e) {
    e.preventDefault();
  }
</script>
