import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // for styling

tippy.setDefaultProps({
  placement: 'top',
  aria: {
    content: 'labelledby',
  },
  hideOnClick: false,
});

export let tips = new Set();

export default function tooltip(node, options) {
  let tip = tippy(node, options);
  if (!options.content) tip.disable();
  tips.add(tip);

  return {
    update(newOptions) {
      tip.setProps(newOptions);
      if (newOptions.content) {
        tip.enable();
      } else {
        tip.disable();
      }
    },
    destroy() {
      tip.destroy();
      tips.delete(tip);
    }
  };
}
