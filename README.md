# Tiny Swords – Prototipo

Juego de acción 2D por oleadas, estilo Zelda, hecho con HTML + JavaScript (Canvas) y sin dependencias.

## Cómo ejecutarlo

Usa el servidor incluido: sirve el juego **y guarda las partidas en `partidas.txt`** (raíz del proyecto).

    python server.py        # Python 3
    node server.js          # o Node.js

Abre http://localhost:8000 (puerto opcional: `python server.py 8080`).
Con otro servidor, doble clic en `index.html` o la versión online, todo funciona igual pero el ranking
se guarda solo en el navegador (localStorage). La pantalla de estadísticas indica de dónde vienen los datos.

## Controles

| Acción | Teclado | Mando (Xbox) | Táctil |
|---|---|---|---|
| Mover | WASD / flechas | Stick izq. / cruceta | Joystick (mitad izquierda) |
| Atacar | Espacio / J | A, X o RT | Botón Atacar |
| Esquivar | L / E | B o RB | Botón Esquiva |
| Guardia | Shift / K (mantener) | LB o LT (mantener) | Botón Guardia |
| Pausa | Esc / P | Start | Botón II |

Golpeas en la dirección en la que te mueves (se ve el arco del tajo). El juego se pausa solo si pierdes el foco.

## Combate

- **Esquiva**: rueda invulnerable. Tienes cargas que se recargan solas (HUD bajo la vida). Si un golpe
  iba a darte mientras esquivas ("esquiva perfecta") el tiempo se ralentiza, ganas puntos y recuperas una carga.
  Se puede cancelar la recuperación de un ataque con una esquiva.
- **Guardia y parada**: bloquear reduce el daño un 80% pero gasta la barra de guardia (si se agota queda rota
  1 s). Si pulsas guardia justo antes del golpe (primeros 0,2 s) haces una **parada**: sin daño, aturdes al enemigo y puntúas.
- **Combo**: cada baja seguida (3,2 s) sube el multiplicador de puntos hasta x4; recibir daño lo rompe.
- Los enemigos cuerpo a cuerpo atacan por turnos (máx. 2-4 a la vez) y los demás te rodean. Cada ataque avisa con "!".
- Sensación de golpe: micro-pausa al impactar, partículas, sacudida y destello al recibir daño, viñeta de vida baja.

## Enemigos

Guerrero rojo, peón (rápido y frágil), guerrero amarillo (tanque), morado (veloz), **arquero** (dispara flechas,
se cubre con árboles y se bloquea/para), **lancero** (embiste tras aviso), **monje** (cura a los demás; elimínalo primero)
y ovejas (sueltan carne). Algunas oleadas tienen tema: Horda de peones, Lluvia de flechas o Legión blindada.

## Jefe: Coloso Férreo (cada 5 oleadas)

Puñetazo, brazos extensibles (aviso rojo, enfriamiento 9 s) y, por debajo del 50% de vida, **furia**: más rápido,
ataques más seguidos y **pisotón** de área con aviso (círculo rojo). Se aturde brevemente con una parada.

## Progresión

- **Tras cada oleada** eliges 1 de 3 mejoras al azar: Fuerza, Velocidad, Vida, Esquiva (+1 carga), Alcance,
  Vampirismo, Crítico y Esquiva cortante. Al caer un jefe eliges entre Fuerza, Velocidad y Vida (y luego la de la oleada).
- **Oleada perfecta** (sin recibir daño): bonus de puntos.
- **Oro y Taller**: al morir ganas oro; en el Taller (menú, tecla T / Y) lo gastas en mejoras permanentes
  (vida inicial, daño, velocidad y más oro).
- **Reto diario** (menú, tecla R / LB): una arena y oleadas iguales para todos ese día, con ranking propio.

## Arenas y dificultad

Prado del Alba (campo abierto), Bosque Espeso (niebla), Ruinas al Atardecer, Fortaleza (muchos arqueros) e
Islote Helado (suelo helado: patinas). La obstáculos cambian en cada partida (fijos en el reto diario).
Dificultad Fácil / Normal / Difícil: daño recibido x0,6 / x1 / x1,5; puntuación x0,75 / x1 / x1,5.

## Estadísticas y `partidas.txt`

Puntuación por enemigo (60 a 1500) x combo x dificultad, más bonus de oleada. Al morir escribes tu nombre con el teclado
en pantalla (mando: stick/cruceta, A letra, Y espacio, B borrar, Start guardar; o clic/teclado). El ranking
(menú, tecla E / X) muestra puesto, nombre, puntos, nivel, dificultad y día, con filtros (Todas, Fácil, Normal, Difícil,
Diario), de mayor a menor y hasta 20 filas. `partidas.txt` guarda todas en JSON (puedes vaciarlo con `[]`):

    [{"nombre":"Ana","puntos":4200,"nivel":"Fortaleza","oleada":7,"dificultad":"Normal","modo":"normal","fecha":"2026-09-29T14:32:10"}]

## Ajustes y ayuda

Menú Ajustes (O / RB, también desde la pausa): sacudida de cámara, destellos, números de daño, vibración del mando
y consejos de ayuda. La primera partida muestra un tutorial contextual.

## Estructura

    index.html · css/style.css · js/game.js    El juego
    server.py / server.js                      Servidor local + guardado en partidas.txt
    partidas.txt                               Partidas guardadas (JSON)
    assets/                                    Sprites (units, boss, creatures, buildings, terrain, items, fx)
    tools/boss_gen.py                          Generador de los sprites del jefe (Pillow)

## Dónde ajustar (js/game.js)

- Dificultad: `DIFS` · Mejoras: `UPG` · Taller: `SHOP` · Arenas: `AR_` · Temas de oleada: `roll()` y `nextWave()`
- Esquiva, parada y guardia: `updP()`, `hurtP()`, `parry()`, `perfectDodge()`
- Enemigos: `enemy()`, `aiA/aiL/aiM/aiB()`, `updE()` (turnos de ataque: `G.lim`)
- Jefe: `aiB()` (furia, pisotón, brazos) · Sensación: `hitstop()`, `burst()`, `shake()`

## Créditos y licencia

Sprites: "Tiny Swords" de Pixel Frog (el jefe se generó por código con el mismo estilo). Revisa la licencia del
pack original antes de publicar o distribuir el juego.
