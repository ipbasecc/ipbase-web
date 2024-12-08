export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.includes('.')) {
      // Serve index.html for all non-file requests
      url.pathname = '/index.html';
    }
    return env.ASSETS.fetch(url);
  }
}; 