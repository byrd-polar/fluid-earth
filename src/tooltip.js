import tippy, {animateFill} from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // for styling
import 'tippy.js/themes/material.css'; // Material Design theme

tippy.setDefaultProps({
  theme: 'material',
  placement: 'right',
});

export let tips = [];

export function tooltip(node, options) {
  let tip = tippy(node, options);
  tips.push(tip);

  return {
    destroy() {
      tip.destroy();
    }
  };
}
