# Tiny Swords – Prototipo

Mini juego de acción 2D estilo Zelda hecho con HTML + JavaScript (Canvas), sin dependencias.

## Cómo ejecutarlo

Usa el servidor incluido: sirve el juego **y guarda las partidas en `partidas.txt`** (en la raíz del proyecto).

    python server.py        # Python 3
    node server.js          # o Node.js (sin dependencias)

Luego abre http://localhost:8000 (puerto opcional: `python server.py 8080`).

Si abres el juego con otro servidor (p. ej. `python -m http.server`, Live Server o doble clic en
`index.html`), todo funciona igual, pero las partidas se guardan solo en el navegador (localStorage)
y no en `partidas.txt`. La pantalla de estadísticas indica de dónde vienen los datos.

## Puntuación y estadísticas

Puntos por enemigo: guerrero 100, peón 60, amarillo 200, morado 150, arquero 150, lancero 250,
monje 200, jefe 1500. Al empezar cada oleada N (desde la 2) sumas 100 x (N-1).

Al morir puedes escribir tu nombre y guardar la partida (Enter; Esc para omitir; con mando, A guarda
el último nombre usado). En el selector de arenas, el botón "Estadísticas" (o la tecla E / X del mando)
muestra el ranking: puesto, nombre, puntos, nivel (arena y oleada) y día, ordenado de mayor a menor
puntuación con un máximo de 20 filas.

`partidas.txt` contiene un arreglo JSON (se guardan todas las partidas, ordenadas; solo se muestran 20):

    [
     {"nombre":"Ana","puntos":4200,"nivel":"Fortaleza","oleada":7,"fecha":"2026-09-29T14:32:10"}
    ]

Puedes editarlo a mano o borrarlo (déjalo como `[]`) para reiniciar el ranking.

## Controles

- WASD / flechas: mover
- Espacio / J: atacar (combo de 2 golpes)
- Shift / K: guardia
- Enter: reintentar tras morir · T: estadísticas · E (en el selector): estadísticas

Mando (Xbox y otros compatibles con el estándar de navegador):

- Stick izquierdo o cruceta: mover (el stick es analógico: inclinación suave = caminar más lento)
- A / X / RT: atacar
- B / LB / LT: guardia
- A o Start: reintentar tras morir
- Vibración al recibir daño (si el navegador lo soporta)

Conecta el mando y pulsa cualquier botón para que el navegador lo detecte.

## Arenas

Al abrir el juego eliges arena (flechas / A-D + Enter, clic, o cruceta + A con mando).
Esc o M (Y con mando) vuelve al selector. Están definidas en `AR_` al inicio de `js/game.js`:

- Prado del Alba: campo abierto, ideal para aprender
- Bosque Espeso: muchos árboles como cobertura
- Ruinas al Atardecer: casas y torres, luz cálida
- Fortaleza: castillo central y muchos arqueros
- Islote Helado: espacio reducido y de noche

Para crear otra arena añade un objeto a `AR_` (tileset `tiles1`..`tiles5`, tamaño en tiles,
obstáculos, sesgo de arqueros y tinte de color).

## Enemigos

- Guerrero rojo: cuerpo a cuerpo básico
- Peón (cuchillo): rápido y frágil, ataca en enjambre
- Guerrero amarillo: tanque lento (oleada 2+)
- Arquero: mantiene distancia y dispara flechas que puedes esquivar, bloquear con guardia
  o parar tras árboles y edificios (oleada 2+)
- Guerrero morado: muy rápido, poca vida (oleada 3+)
- Lancero: avisa con una línea roja y "!" y embiste; tras el golpe queda expuesto (oleada 3+)
- Monje: cura a sus aliados heridos y huye de ti; conviene eliminarlo primero (oleada 4+)
- Ovejas: criaturas pasivas; golpéalas para que suelten carne

Los tipos y sus pesos por oleada están en `WT`; sus estadísticas en `enemy()`; su IA en
`aiA()` (arquero), `aiL()` (lancero), `aiM()` (monje) y `updE()` (cuerpo a cuerpo).

## Jefe: Coloso Férreo (cada 5 oleadas)

En las oleadas 5, 10, 15... aparece un jefe más grande que las tropas (más alto y bastante más ancho que un guerrero) junto a
la mitad de los enemigos habituales. Vida: 450 y +250 por cada jefe anterior. Se mueve pesado
(velocidad 68, con temblor de cámara en cada pisada) y apenas retrocede al recibir golpes.

- Puñetazo: 28 de daño, con aviso de medio segundo y onda de choque. Atraviesa parte de la guardia (50%).
- Brazos extensibles: carga con línea roja y "!" (0,9 s), estira ambos brazos hasta 220 px en la
  dirección donde estabas y golpea a lo largo de esa línea (32 de daño). Tiene enfriamiento de 9 s
  para que no se abuse de él. Puedes esquivarlo moviéndote de lado.
- Al caer suelta 3 power-ups y 2 carnes. Su barra de vida aparece abajo, en el centro.

Ajustes: `enemy()` (tipo 'B': velocidad y daño), `nextWave()` (vida del jefe y frecuencia),
`aiB()` (tiempos, alcance y enfriamiento `e.scd=9`).

Los sprites del jefe (assets/boss) se generan por código con `tools/boss_gen.py`
(requiere Pillow: `pip install pillow`). Si cambias las poses, ejecútalo desde la carpeta tools y
copia el arreglo que imprime en la constante `BSH` de `js/game.js`.

## Mecánicas

- Oleadas: 3 enemigos en la primera y +2 por oleada (máximo 16), según el tamaño de la arena.
- Enemigos: rojo (normal), amarillo (tanque: aguanta el doble, lento, daño 18, desde la oleada 2)
  y morado (rápido: poca vida, daño 8, desde la oleada 3).
- Power-ups (se recogen caminando sobre ellos; desaparecen a los 18 s):
  - Fuerza: daño x2 durante 10 s
  - Velocidad: movimiento +40% y ataque más rápido durante 10 s
  - Escudo: inmune durante 6 s
  - Onda: daño de 45 a todos los enemigos cercanos
  Salen de los enemigos caídos (los élite sueltan más) y aparece uno al inicio de cada oleada desde la 2.
- La carne sigue curando 25 de vida.

## Estructura

    server.py / server.js  Servidor local (juego + guardado en partidas.txt)
    partidas.txt      Partidas guardadas (JSON)
    index.html        Página que carga el canvas
    css/style.css     Estilos (escala el canvas a la pantalla)
    js/game.js        Toda la lógica del juego
    tools/boss_gen.py Generador de los sprites del jefe
    assets/           Sprites usados (recortados del pack Tiny Swords)
      units/          Warrior azul (jugador) y enemigos: guerreros, arquero, lancero, monje, peón
      boss/           Coloso Férreo: hojas de animación, puño, segmento de brazo y anillo
      creatures/      Ovejas
      buildings/      Casas, torres y castillo

      terrain/        Tileset de hierba, agua y árbol
      items/          Carne (cura)
      fx/             Explosión

## Dónde tocar para ajustar el juego (js/game.js)

- Vida y daño del jugador: función `reset()` (vida 100) y `swing()` (20/25 de daño)
- Power-ups: objeto `PT` (duración, nombre, color), `take()` (efecto) y `hurtE()` (probabilidad de drop)
- Mando: función `pollPad()` (mapeo de botones y zona muerta del stick)
- Velocidad del jugador: `updP()` (210 normal, 70 con guardia)
- Mapa: constantes `MW`, `MH`, `BX`, `BY` y `drawTerrain()`
- Animaciones: tabla `S` (frames y fps de cada animación)
- Añadir sprites nuevos: agrégalos al objeto `A` al inicio del archivo

## Créditos y licencia

Sprites: "Tiny Swords" de Pixel Frog. Revisa la licencia del pack original antes de
publicar o distribuir el juego, y conserva sus créditos.
