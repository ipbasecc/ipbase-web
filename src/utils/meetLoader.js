let loadPromise = null;

export const preloadMeetAPI = (meetSite) => {
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://${meetSite}/external_api.js`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => {
        loadPromise = null;
        reject(new Error('Failed to load Jitsi Meet API'));
      };
      
      document.head.appendChild(script);
    });
  }
  return loadPromise;
};

export const isMeetAPILoaded = () => {
  return typeof JitsiMeetExternalAPI !== 'undefined';
}; 