#!/usr/bin/env python3
"""Servidor local de Tiny Swords: sirve el juego y guarda las partidas en partidas.txt (JSON).
Uso:  python server.py [puerto]     (por defecto 8000)  ->  http://localhost:8000
"""
import json, os, sys, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.join(ROOT, 'partidas.txt')
LOCK = threading.Lock()

def load():
    try:
        with open(FILE, encoding='utf-8') as f:
            d = json.load(f)
        return d if isinstance(d, list) else []
    except Exception:
        return []

def key(r):  # mayor puntuación primero; en empate, la más antigua
    try: p = int(r.get('puntos', 0) or 0)
    except Exception: p = 0
    return (-p, str(r.get('fecha', '')))

def clean(r):
    nombre = ''.join(c for c in str(r.get('nombre', '')) if c.isprintable()).strip()[:14] or 'Anónimo'
    return {'nombre': nombre,
            'puntos': max(0, min(int(r.get('puntos', 0)), 10**9)),
            'nivel': str(r.get('nivel', ''))[:40],
            'oleada': max(0, min(int(r.get('oleada', 0)), 9999)),
            'modo': 'diario' if r.get('modo') == 'diario' else 'normal',
            'dificultad': r.get('dificultad') if r.get('dificultad') in ('Fácil', 'Normal', 'Difícil') else 'Normal',
            'fecha': str(r.get('fecha', ''))[:19]}

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def _json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        if self.path.split('?')[0] == '/api/scores':
            return self._json(sorted(load(), key=key))
        super().do_GET()

    def do_POST(self):
        if self.path.split('?')[0] != '/api/scores':
            return self._json({'error': 'no encontrado'}, 404)
        try:
            n = int(self.headers.get('Content-Length', 0))
            rec = clean(json.loads(self.rfile.read(min(n, 4096))))
        except Exception:
            return self._json({'error': 'datos inválidos'}, 400)
        with LOCK:
            lista = load(); lista.append(rec); lista.sort(key=key)
            tmp = FILE + '.tmp'
            with open(tmp, 'w', encoding='utf-8') as f:
                json.dump(lista, f, ensure_ascii=False, indent=1)
            os.replace(tmp, FILE)
        self._json({'ok': True, 'rank': lista.index(rec) + 1, 'total': len(lista)})

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f'Tiny Swords en http://localhost:{port}   (partidas en {FILE})')
    ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
