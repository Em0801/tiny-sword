#!/usr/bin/env node
// Servidor local sin dependencias: sirve el juego y guarda las partidas en partidas.txt (JSON).
// Uso:  node server.js [puerto]   (por defecto 8000)  ->  http://localhost:8000
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, FILE = path.join(ROOT, 'partidas.txt'), PORT = +process.argv[2] || 8000;
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json','.txt':'text/plain; charset=utf-8'};
const load = () => { try { const d = JSON.parse(fs.readFileSync(FILE, 'utf8')); return Array.isArray(d) ? d : []; } catch (e) { return []; } };
const key = (a, b) => (Number(b.puntos) || 0) - (Number(a.puntos) || 0) || String(a.fecha || '').localeCompare(String(b.fecha || ''));
const clean = r => ({
  nombre: [...String(r.nombre || '')].filter(c => c >= ' ').join('').trim().slice(0, 14) || 'Anónimo',
  puntos: Math.max(0, Math.min(Math.floor(+r.puntos) || 0, 1e9)),
  nivel: String(r.nivel || '').slice(0, 40),
  oleada: Math.max(0, Math.min(Math.floor(+r.oleada) || 0, 9999)),
  fecha: String(r.fecha || '').slice(0, 19)});
const send = (res, code, obj) => { res.writeHead(code, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'}); res.end(JSON.stringify(obj)); };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url == '/api/scores') {
    if (req.method == 'GET') return send(res, 200, load().sort(key));
    if (req.method == 'POST') {
      let b = ''; req.on('data', c => { b += c; if (b.length > 4096) req.destroy(); });
      req.on('end', () => { try {
        const rec = clean(JSON.parse(b)), l = load(); l.push(rec); l.sort(key);
        fs.writeFileSync(FILE + '.tmp', JSON.stringify(l, null, 1)); fs.renameSync(FILE + '.tmp', FILE);
        send(res, 200, {ok: true, rank: l.indexOf(rec) + 1, total: l.length});
      } catch (e) { send(res, 400, {error: 'datos inválidos'}); } });
      return;
    }
    return send(res, 405, {error: 'método no permitido'});
  }
  const f = path.normalize(path.join(ROOT, url == '/' ? 'index.html' : url));
  if (f != ROOT && !f.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, {'Content-Type': MIME[path.extname(f)] || 'application/octet-stream'}); res.end(d);
  });
}).listen(PORT, '127.0.0.1', () => console.log('Tiny Swords en http://localhost:' + PORT + '   (partidas en ' + FILE + ')'));
