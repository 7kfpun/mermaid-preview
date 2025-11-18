export const trackEvent = (name, params) => {
  if (window.gtag) {
    window.gtag("event", name, params);
  }
};
