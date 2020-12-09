import tippy, { animateFill } from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // for styling
import 'tippy.js/themes/material.css'; // Material Design theme

tippy.setDefaultProps({
  theme: 'material',
  placement: 'right',
});

export let tips = new Set();

export default function tooltip(node, options) {
  let tip = tippy(node, options);
  tips.add(tip);

  return {
    destroy() {
      tips.delete(tip);
      tip.destroy();
    }
  };
}

// hide tooltips on small screens / mobile
let mediaQuery = window.matchMedia('(max-width: 36rem)');
function handleResize() {
  if (mediaQuery.matches) {
    tips.forEach(t => t.disable());
  } else {
    tips.forEach(t => t.enable());
  }
}
window.addEventListener('resize', handleResize);
handleResize();
