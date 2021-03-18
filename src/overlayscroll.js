import OverlayScrollbars from 'overlayscrollbars/js/OverlayScrollbars.js';
import 'overlayscrollbars/css/OverlayScrollbars.css';

export default function overlayscroll(node) {
  let scrollbars = OverlayScrollbars(node, { className: 'os-theme-light' });

  return {
    destroy() {
      scrollbars.destroy();
    }
  };
}
