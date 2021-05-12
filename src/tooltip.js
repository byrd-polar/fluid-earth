import tippy, { animateFill } from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // for styling
import 'tippy.js/themes/material.css'; // Material Design theme

import { get } from 'svelte/store';
import { mobile } from './stores.js';

tippy.setDefaultProps({
  theme: 'material',
  placement: 'top',
  aria: {
    content: 'labelledby',
  },
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

  if (get(mobile)) tip.disable();

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
mobile.subscribe(val => {
  if (val) {
    tips.forEach(t => t.disable());
  } else {
    tips.forEach(t => t.enable());
  }
});
