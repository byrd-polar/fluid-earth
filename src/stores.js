import { readable } from 'svelte/store';

const mediaQuery = window.matchMedia('(max-width: 576px)');

export const mobile = readable(mediaQuery.matches, set => {

  const updateMobile = () => set(mediaQuery.matches);
  window.addEventListener('resize', updateMobile);

  return () => window.removeEventListener('resize', updateMobile);
});

export const currentDate = readable(new Date(), set => {

  const interval = window.setInterval(() => set(new Date()), 1000);

  return () => window.clearInterval(interval);
});
