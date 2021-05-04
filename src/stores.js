import { readable } from 'svelte/store';

const mediaQuery = window.matchMedia('(max-width: 36rem)');

export const mobile = readable(mediaQuery.matches, set => {

  const updateMobile = () => set(mediaQuery.matches);
  window.addEventListener('resize', updateMobile);

  return () => window.removeEventListener('resize', updateMobile);
});
