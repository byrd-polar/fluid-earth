import tippy, { animateFill } from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // for styling

tippy.setDefaultProps({
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
