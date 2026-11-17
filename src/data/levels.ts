import { BlockColorId, LevelConfig, PresetTile } from '../types/game';

function normal(row: number, col: number, color: BlockColorId = 'cobalt'): PresetTile {
  return { row, col, kind: 'normal', color };
}

function gem(row: number, col: number, color: BlockColorId = 'ochre'): PresetTile {
  return { row, col, kind: 'gem', color };
}

function stone(row: number, col: number, hp = 2): PresetTile {
  return { row, col, kind: 'stone', color: 'stone', hp };
}

export const PROGRESSIVE_LEVELS: LevelConfig[] = [
  // Capítulo 1: Fundamentos (Niveles 1–6)
  {
    id: 1,
    chapter: 'Fundamentos',
    title: 'Primer trazo',
    subtitle: 'Completa tus primeras líneas con piezas compactas.',
    objectives: [{ type: 'lines', target: 4, label: 'líneas' }],
    maxTier: 1,
    presetTiles: [
      normal(3, 0, 'cobalt'),
      normal(3, 1, 'cobalt'),
      normal(3, 2, 'cobalt'),
      normal(3, 5, 'cobalt'),
      normal(3, 6, 'cobalt'),
      normal(3, 7, 'cobalt'),
    ],
  },
  {
    id: 2,
    chapter: 'Fundamentos',
    title: 'Ritmo inicial',
    subtitle: 'Alcanza la meta de puntos enlazando filas y columnas.',
    objectives: [{ type: 'score', target: 320, label: 'puntos' }],
    maxTier: 1,
    presetTiles: [
      normal(2, 2, 'sage'),
      normal(2, 5, 'sage'),
      normal(5, 2, 'sage'),
      normal(5, 5, 'sage'),
    ],
  },
  {
    id: 3,
    chapter: 'Fundamentos',
    title: 'Primeras gemas',
    subtitle: 'Completa las líneas que atraviesan las piezas con rombo.',
    objectives: [{ type: 'gems', target: 4, label: 'gemas' }],
    maxTier: 1,
    presetTiles: [
      gem(2, 2, 'ochre'),
      gem(2, 5, 'ochre'),
      gem(5, 2, 'ochre'),
      gem(5, 5, 'ochre'),
      normal(2, 3, 'teal'),
      normal(5, 4, 'teal'),
    ],
  },
  {
    id: 4,
    chapter: 'Fundamentos',
    title: 'Cruz serena',
    subtitle: 'Despeja el eje central para liberar espacio rápido.',
    objectives: [
      { type: 'lines', target: 6, label: 'líneas' },
      { type: 'gems', target: 3, label: 'gemas' },
    ],
    maxTier: 1,
    presetTiles: [
      normal(3, 3, 'indigo'),
      normal(3, 4, 'indigo'),
      normal(4, 3, 'indigo'),
      normal(4, 4, 'indigo'),
      gem(1, 3, 'ochre'),
      gem(6, 4, 'ochre'),
      gem(4, 1, 'ochre'),
    ],
  },
  {
    id: 5,
    chapter: 'Fundamentos',
    title: 'Cuatro esquinas',
    subtitle: 'Nuevas formas de 4 bloques entran en juego.',
    objectives: [{ type: 'score', target: 500, label: 'puntos' }],
    maxTier: 2,
    presetTiles: [
      normal(0, 0, 'terracotta'),
      normal(0, 1, 'terracotta'),
      normal(1, 0, 'terracotta'),
      normal(0, 6, 'terracotta'),
      normal(0, 7, 'terracotta'),
      normal(1, 7, 'terracotta'),
      normal(6, 0, 'terracotta'),
      normal(7, 0, 'terracotta'),
      normal(7, 1, 'terracotta'),
      normal(6, 7, 'terracotta'),
      normal(7, 6, 'terracotta'),
      normal(7, 7, 'terracotta'),
    ],
  },
  {
    id: 6,
    chapter: 'Fundamentos',
    title: 'Jardín de ámbar',
    subtitle: 'Recoge las 6 gemas distribuidas en diagonal.',
    objectives: [{ type: 'gems', target: 6, label: 'gemas' }],
    maxTier: 2,
    presetTiles: [
      gem(1, 1, 'ochre'),
      gem(2, 2, 'ochre'),
      gem(3, 3, 'ochre'),
      gem(4, 4, 'ochre'),
      gem(5, 5, 'ochre'),
      gem(6, 6, 'ochre'),
      normal(1, 6, 'sage'),
      normal(6, 1, 'sage'),
    ],
  },

  // Capítulo 2: Equilibrio (Niveles 7–12)
  {
    id: 7,
    chapter: 'Equilibrio',
    title: 'Columnas gemelas',
    subtitle: 'Dos pilares verticales marcan el pulso del tablero.',
    objectives: [{ type: 'lines', target: 8, label: 'líneas' }],
    maxTier: 2,
    presetTiles: [
      normal(1, 2, 'cobalt'),
      normal(2, 2, 'cobalt'),
      normal(3, 2, 'cobalt'),
      normal(4, 2, 'cobalt'),
      normal(5, 2, 'cobalt'),
      normal(2, 5, 'cobalt'),
      normal(3, 5, 'cobalt'),
      normal(4, 5, 'cobalt'),
      normal(5, 5, 'cobalt'),
      normal(6, 5, 'cobalt'),
    ],
  },
  {
    id: 8,
    chapter: 'Equilibrio',
    title: 'Rombo interior',
    subtitle: 'Libera el núcleo con combinaciones dobles.',
    objectives: [
      { type: 'gems', target: 5, label: 'gemas' },
      { type: 'score', target: 620, label: 'puntos' },
    ],
    maxTier: 2,
    presetTiles: [
      gem(2, 3, 'ochre'),
      gem(3, 2, 'ochre'),
      gem(3, 5, 'ochre'),
      gem(5, 3, 'ochre'),
      gem(4, 4, 'ochre'),
      normal(2, 4, 'teal'),
      normal(4, 2, 'teal'),
      normal(4, 5, 'teal'),
      normal(5, 4, 'teal'),
    ],
  },
  {
    id: 9,
    chapter: 'Equilibrio',
    title: 'Piedra tallada',
    subtitle: 'Los bloques de piedra requieren dos limpiezas para romperse.',
    objectives: [{ type: 'lines', target: 9, label: 'líneas' }],
    maxTier: 2,
    presetTiles: [
      stone(3, 3, 2),
      stone(4, 4, 2),
      normal(3, 2, 'sage'),
      normal(4, 5, 'sage'),
      normal(2, 3, 'sage'),
      normal(5, 4, 'sage'),
    ],
  },
  {
    id: 10,
    chapter: 'Equilibrio',
    title: 'Puente abierto',
    subtitle: 'Despeja la franja central sin bloquear los extremos.',
    objectives: [
      { type: 'gems', target: 6, label: 'gemas' },
      { type: 'lines', target: 8, label: 'líneas' },
    ],
    maxTier: 2,
    presetTiles: [
      gem(3, 1, 'ochre'),
      gem(3, 6, 'ochre'),
      gem(4, 1, 'ochre'),
      gem(4, 6, 'ochre'),
      gem(0, 3, 'ochre'),
      gem(7, 4, 'ochre'),
      stone(3, 3, 2),
      stone(4, 4, 2),
    ],
  },
  {
    id: 11,
    chapter: 'Equilibrio',
    title: 'Escala ascendente',
    subtitle: 'Se desbloquean las piezas grandes de nivel avanzado.',
    objectives: [{ type: 'score', target: 850, label: 'puntos' }],
    maxTier: 3,
    presetTiles: [
      normal(6, 0, 'indigo'),
      normal(6, 1, 'indigo'),
      normal(5, 1, 'indigo'),
      normal(5, 2, 'indigo'),
      normal(4, 2, 'indigo'),
      normal(4, 3, 'indigo'),
      normal(3, 3, 'indigo'),
      normal(3, 4, 'indigo'),
      normal(2, 4, 'indigo'),
      normal(2, 5, 'indigo'),
    ],
  },
  {
    id: 12,
    chapter: 'Equilibrio',
    title: 'Marco arquitectónico',
    subtitle: 'Cuida los bordes al colocar escuadras y barras de 5.',
    objectives: [
      { type: 'gems', target: 6, label: 'gemas' },
      { type: 'score', target: 900, label: 'puntos' },
    ],
    maxTier: 3,
    presetTiles: [
      gem(0, 0, 'ochre'),
      gem(0, 7, 'ochre'),
      gem(7, 0, 'ochre'),
      gem(7, 7, 'ochre'),
      gem(3, 3, 'ochre'),
      gem(4, 4, 'ochre'),
      stone(1, 1, 2),
      stone(6, 6, 2),
    ],
  },

  // Capítulo 3: Geometría (Niveles 13–18)
  {
    id: 13,
    chapter: 'Geometría',
    title: 'Tablero en eco',
    subtitle: 'Patrón alterno que exige planificación a tres piezas.',
    objectives: [{ type: 'lines', target: 11, label: 'líneas' }],
    maxTier: 3,
    presetTiles: [
      normal(1, 1, 'teal'),
      normal(1, 3, 'teal'),
      normal(1, 5, 'teal'),
      normal(3, 2, 'teal'),
      normal(3, 4, 'teal'),
      normal(3, 6, 'teal'),
      normal(5, 1, 'teal'),
      normal(5, 3, 'teal'),
      normal(5, 5, 'teal'),
      stone(4, 4, 2),
    ],
  },
  {
    id: 14,
    chapter: 'Geometría',
    title: 'Bóveda de cristal',
    subtitle: 'Ocho gemas rodeadas por un anillo de bloques.',
    objectives: [{ type: 'gems', target: 8, label: 'gemas' }],
    maxTier: 3,
    presetTiles: [
      gem(2, 2, 'ochre'),
      gem(2, 3, 'ochre'),
      gem(2, 4, 'ochre'),
      gem(2, 5, 'ochre'),
      gem(5, 2, 'ochre'),
      gem(5, 3, 'ochre'),
      gem(5, 4, 'ochre'),
      gem(5, 5, 'ochre'),
      stone(3, 2, 2),
      stone(4, 5, 2),
    ],
  },
  {
    id: 15,
    chapter: 'Geometría',
    title: 'Doble compás',
    subtitle: 'Mantén espacio para cuadros 3×3 y busca combos seguidos.',
    objectives: [{ type: 'score', target: 1150, label: 'puntos' }],
    maxTier: 3,
    presetTiles: [
      stone(2, 2, 2),
      stone(2, 5, 2),
      stone(5, 2, 2),
      stone(5, 5, 2),
      normal(3, 3, 'cobalt'),
      normal(4, 4, 'cobalt'),
    ],
  },
  {
    id: 16,
    chapter: 'Geometría',
    title: 'Laberinto mínimo',
    subtitle: 'Abre corredores verticales para despejar las gemas internas.',
    objectives: [
      { type: 'gems', target: 7, label: 'gemas' },
      { type: 'lines', target: 10, label: 'líneas' },
    ],
    maxTier: 3,
    presetTiles: [
      normal(1, 2, 'terracotta'),
      normal(2, 2, 'terracotta'),
      normal(3, 2, 'terracotta'),
      normal(4, 5, 'terracotta'),
      normal(5, 5, 'terracotta'),
      normal(6, 5, 'terracotta'),
      gem(1, 5, 'ochre'),
      gem(2, 4, 'ochre'),
      gem(3, 3, 'ochre'),
      gem(4, 4, 'ochre'),
      gem(5, 3, 'ochre'),
      gem(6, 2, 'ochre'),
      gem(0, 7, 'ochre'),
    ],
  },
  {
    id: 17,
    chapter: 'Geometría',
    title: 'Piedras cardinales',
    subtitle: 'Cuatro anclas de piedra protegen los ejes principales.',
    objectives: [
      { type: 'lines', target: 13, label: 'líneas' },
      { type: 'score', target: 1200, label: 'puntos' },
    ],
    maxTier: 3,
    presetTiles: [
      stone(1, 3, 2),
      stone(6, 4, 2),
      stone(3, 6, 2),
      stone(4, 1, 2),
      normal(3, 3, 'sage'),
      normal(3, 4, 'sage'),
      normal(4, 3, 'sage'),
      normal(4, 4, 'sage'),
    ],
  },
  {
    id: 18,
    chapter: 'Geometría',
    title: 'Constelación',
    subtitle: 'Recoge las nueve gemas sin perder el ritmo de combos.',
    objectives: [{ type: 'gems', target: 9, label: 'gemas' }],
    maxTier: 3,
    presetTiles: [
      gem(0, 2, 'ochre'),
      gem(1, 6, 'ochre'),
      gem(2, 1, 'ochre'),
      gem(3, 4, 'ochre'),
      gem(4, 7, 'ochre'),
      gem(5, 2, 'ochre'),
      gem(6, 5, 'ochre'),
      gem(7, 0, 'ochre'),
      gem(7, 6, 'ochre'),
      stone(3, 3, 2),
      stone(4, 4, 2),
    ],
  },

  // Capítulo 4: Maestría (Niveles 19–24)
  {
    id: 19,
    chapter: 'Maestría',
    title: 'Monolito',
    subtitle: 'Un bloque central de piedra exige limpieza estratégica.',
    objectives: [
      { type: 'lines', target: 14, label: 'líneas' },
      { type: 'gems', target: 6, label: 'gemas' },
    ],
    maxTier: 3,
    presetTiles: [
      stone(3, 3, 2),
      stone(3, 4, 2),
      stone(4, 3, 2),
      stone(4, 4, 2),
      gem(1, 1, 'ochre'),
      gem(1, 6, 'ochre'),
      gem(6, 1, 'ochre'),
      gem(6, 6, 'ochre'),
      gem(0, 4, 'ochre'),
      gem(7, 3, 'ochre'),
    ],
  },
  {
    id: 20,
    chapter: 'Maestría',
    title: 'Tensión diagonal',
    subtitle: 'Domina los espacios reducidos para alcanzar 1,500 puntos.',
    objectives: [{ type: 'score', target: 1500, label: 'puntos' }],
    maxTier: 3,
    presetTiles: [
      stone(1, 1, 2),
      stone(2, 2, 2),
      stone(5, 5, 2),
      stone(6, 6, 2),
      normal(1, 6, 'indigo'),
      normal(2, 5, 'indigo'),
      normal(5, 2, 'indigo'),
      normal(6, 1, 'indigo'),
    ],
  },
  {
    id: 21,
    chapter: 'Maestría',
    title: 'Galería cerrada',
    subtitle: 'Diez gemas incrustadas entre muros simétricos.',
    objectives: [
      { type: 'gems', target: 10, label: 'gemas' },
      { type: 'lines', target: 12, label: 'líneas' },
    ],
    maxTier: 3,
    presetTiles: [
      gem(1, 1, 'ochre'),
      gem(1, 3, 'ochre'),
      gem(1, 5, 'ochre'),
      gem(1, 7, 'ochre'),
      gem(6, 0, 'ochre'),
      gem(6, 2, 'ochre'),
      gem(6, 4, 'ochre'),
      gem(6, 6, 'ochre'),
      gem(3, 3, 'ochre'),
      gem(4, 4, 'ochre'),
      stone(3, 4, 2),
      stone(4, 3, 2),
    ],
  },
  {
    id: 22,
    chapter: 'Maestría',
    title: 'Cadencia pura',
    subtitle: 'Dieciséis líneas completas con piezas de todos los tamaños.',
    objectives: [{ type: 'lines', target: 16, label: 'líneas' }],
    maxTier: 3,
    presetTiles: [
      stone(2, 1, 2),
      stone(2, 6, 2),
      stone(5, 1, 2),
      stone(5, 6, 2),
      normal(0, 3, 'cobalt'),
      normal(0, 4, 'cobalt'),
      normal(7, 3, 'cobalt'),
      normal(7, 4, 'cobalt'),
    ],
  },
  {
    id: 23,
    chapter: 'Maestría',
    title: 'Horizonte alto',
    subtitle: 'Combina despejes múltiples para superar la barrera de 1,800.',
    objectives: [
      { type: 'score', target: 1800, label: 'puntos' },
      { type: 'gems', target: 8, label: 'gemas' },
    ],
    maxTier: 3,
    presetTiles: [
      gem(0, 0, 'ochre'),
      gem(0, 7, 'ochre'),
      gem(7, 0, 'ochre'),
      gem(7, 7, 'ochre'),
      gem(2, 3, 'ochre'),
      gem(3, 5, 'ochre'),
      gem(4, 2, 'ochre'),
      gem(5, 4, 'ochre'),
      stone(2, 2, 2),
      stone(5, 5, 2),
      stone(2, 5, 2),
      stone(5, 2, 2),
    ],
  },
  {
    id: 24,
    chapter: 'Maestría',
    title: 'Gran mosaico',
    subtitle: 'La prueba definitiva del capítulo de maestría.',
    objectives: [
      { type: 'gems', target: 10, label: 'gemas' },
      { type: 'lines', target: 16, label: 'líneas' },
      { type: 'score', target: 2000, label: 'puntos' },
    ],
    maxTier: 3,
    presetTiles: [
      stone(1, 1, 2),
      stone(1, 6, 2),
      stone(6, 1, 2),
      stone(6, 6, 2),
      stone(3, 3, 2),
      stone(4, 4, 2),
      gem(0, 3, 'ochre'),
      gem(0, 4, 'ochre'),
      gem(7, 3, 'ochre'),
      gem(7, 4, 'ochre'),
      gem(3, 0, 'ochre'),
      gem(4, 0, 'ochre'),
      gem(3, 7, 'ochre'),
      gem(4, 7, 'ochre'),
      gem(2, 5, 'ochre'),
      gem(5, 2, 'ochre'),
    ],
  },
];

/**
 * Generates endless progressive levels beyond level 24 deterministically
 * so dedicated players always have a fresh structured level.
 */
export function getLevelConfig(levelNumber: number): LevelConfig {
  const safeNum = Math.max(1, levelNumber);
  const existing = PROGRESSIVE_LEVELS.find((l) => l.id === safeNum);
  if (existing) return existing;

  const extra = safeNum - PROGRESSIVE_LEVELS.length;
  const targetScore = 2000 + extra * 250;
  const targetLines = 15 + Math.min(12, Math.floor(extra * 1.2));
  const gemCount = 8 + (extra % 5);

  const presetTiles: PresetTile[] = [];
  const used = new Set<string>();

  // Deterministic pseudo-random placement based on level number
  let seed = safeNum * 2654435761;
  const nextRand = () => {
    seed = (seed ^ (seed << 13)) >>> 0;
    seed = (seed ^ (seed >>> 17)) >>> 0;
    seed = (seed ^ (seed << 5)) >>> 0;
    return seed / 4294967296;
  };

  // Place 4 symmetric stones
  for (let i = 0; i < 2; i++) {
    const r = 1 + Math.floor(nextRand() * 3);
    const c = 1 + Math.floor(nextRand() * 3);
    const coords = [
      [r, c],
      [7 - r, 7 - c],
    ];
    for (const [rr, cc] of coords) {
      const key = `${rr},${cc}`;
      if (!used.has(key)) {
        used.add(key);
        presetTiles.push(stone(rr, cc, 2));
      }
    }
  }

  // Place gems
  let placedGems = 0;
  let guard = 0;
  while (placedGems < gemCount && guard < 100) {
    guard++;
    const r = Math.floor(nextRand() * 8);
    const c = Math.floor(nextRand() * 8);
    const key = `${r},${c}`;
    if (!used.has(key)) {
      used.add(key);
      presetTiles.push(gem(r, c, 'ochre'));
      placedGems++;
    }
  }

  return {
    id: safeNum,
    chapter: 'Horizonte',
    title: `Desafío ${safeNum}`,
    subtitle: 'Nivel avanzado generado con metas crecientes.',
    objectives:
      extra % 2 === 0
        ? [
            { type: 'gems', target: placedGems, label: 'gemas' },
            { type: 'score', target: targetScore, label: 'puntos' },
          ]
        : [
            { type: 'lines', target: targetLines, label: 'líneas' },
            { type: 'gems', target: placedGems, label: 'gemas' },
          ],
    maxTier: 3,
    presetTiles,
  };
}
