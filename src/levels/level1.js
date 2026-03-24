export const LEVEL_1 =
{
  playerSpawn: { x: 80, y: 240 },
  enemySpawns:
  [
    { x: 720, y: 180, type: 'stationary' },
    { x: 720, y: 320, type: 'stationary' },
  ],
  walls:
  [
    // Border walls
    { x: 0,   y: 0,   w: 900, h: 20  },  // top
    { x: 0,   y: 480, w: 900, h: 20  },  // bottom
    { x: 0,   y: 0,   w: 20,  h: 500 },  // left
    { x: 880, y: 0,   w: 20,  h: 500 },  // right

    // Center square — left side open
    { x: 380, y: 160, w: 140, h: 20  },  // top
    { x: 380, y: 320, w: 140, h: 20  },  // bottom
    { x: 500, y: 160, w: 20,  h: 180 },  // right side

    // Corridor wall — nudges player toward opening
    { x: 260, y: 200, w: 20,  h: 100 },
  ]
};