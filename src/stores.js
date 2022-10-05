import { readable } from 'svelte/store';

const mediaQuery = window.matchMedia('(max-width: 576px)');

export const mobile = readable(mediaQuery.matches, set => {

  const updateMobile = () => set(mediaQuery.matches);
  window.addEventListener('resize', updateMobile);
  window.addEventListener('orientationchange', updateMobile);

  return () => {
    window.removeEventListener('resize', updateMobile);
    window.removeEventListener('orientationchange', updateMobile);
  }
});

export const currentDate = readable(new Date(), set => {

  const interval = window.setInterval(() => set(new Date()), 1000);

  return () => window.clearInterval(interval);
});
