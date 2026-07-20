const http = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = http.request(url, { method: 'HEAD' }, (res) => {
      resolve({ url, status: res.statusCode, contentType: res.headers['content-type'] });
    });
    req.on('error', (e) => resolve({ url, status: 500, error: e.message }));
    req.end();
  });
}

async function main() {
  const tests = [
    'https://vteamfitjuly2026.b-cdn.net/defensa-lateral.mp4?thumbnail=1',
    'https://vteamfitjuly2026.b-cdn.net/defensa-lateral.jpg',
    'https://vteamfitjuly2026.b-cdn.net/defensa-lateral.png',
    'https://vteamfitjuly2026.b-cdn.net/defensa-lateral.mp4'
  ];

  for (const t of tests) {
    const res = await checkUrl(t);
    console.log(`[${res.status}] ${res.url} (Type: ${res.contentType})`);
  }
}

main();
