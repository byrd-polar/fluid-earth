import tippy, { animateFill } from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // for styling
import 'tippy.js/themes/material.css'; // Material Design theme

tippy.setDefaultProps({
  theme: 'material',
  placement: 'right',
});

export let tips = new Set();

export default function tooltip(node, options) {
  if (!options.content) return;

  let tip;

  function addTip() {
    tip = tippy(node, options);
    tips.add(tip);
  }

  function removeTip() {
    tips.delete(tip);
    tip.destroy();
  }

  addTip();

  if (mediaQuery.matches) tip.disable();

  return {
    update(newOptions) {
      removeTip();
      options = newOptions;
      addTip();
    },
    destroy() {
      removeTip();
    }
  };
}

// hide tooltips on small screens / mobile
let mediaQuery = window.matchMedia('(max-width: 36rem)');

window.addEventListener('resize', () => {
  if (mediaQuery.matches) {
    tips.forEach(t => t.disable());
  } else {
    tips.forEach(t => t.enable());
  }
});
