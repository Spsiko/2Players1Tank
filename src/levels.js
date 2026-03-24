export const LEVEL_1 =
{
  playerSpawn: { x: 80, y: 240 },
  enemySpawns:
  [
    { x: 720, y: 180, type: 'brown' },
    { x: 720, y: 320, type: 'brown' },
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

export const LEVEL_2 = {
  playerSpawn: { x: 80, y: 240 },
  enemySpawns: [
    { x: 700, y: 100, type: 'brown' },
    { x: 700, y: 380, type: 'brown' },
    { x: 500, y: 240, type: 'gray' },
    { x: 780, y: 240, type: 'gray' },
    { x: 400, y: 100, type: 'teal' },
  ],
  walls: [
    // borders
    { x: 0,   y: 0,   w: 900, h: 20  },
    { x: 0,   y: 480, w: 900, h: 20  },
    { x: 0,   y: 0,   w: 20,  h: 500 },
    { x: 880, y: 0,   w: 20,  h: 500 },

    // left corridor divider
    { x: 200, y: 20,  w: 20,  h: 180 },
    { x: 200, y: 300, w: 20,  h: 180 },

    // center divider with gap
    { x: 450, y: 20,  w: 20,  h: 160 },
    { x: 450, y: 320, w: 20,  h: 160 },

    // right side cover
    { x: 650, y: 150, w: 20,  h: 200 },
  ]
};

export const LEVEL_3 = {
  playerSpawn: { x: 80, y: 240 },
  enemySpawns: [
    { x: 700, y: 100, type: 'gray' },
    { x: 700, y: 380, type: 'gray' },
    { x: 500, y: 240, type: 'teal' },
    { x: 780, y: 150, type: 'teal' },
    { x: 780, y: 350, type: 'teal' },
    { x: 400, y: 380, type: 'black' },
  ],
  walls: [
    // borders
    { x: 0,   y: 0,   w: 900, h: 20  },
    { x: 0,   y: 480, w: 900, h: 20  },
    { x: 0,   y: 0,   w: 20,  h: 500 },
    { x: 880, y: 0,   w: 20,  h: 500 },

    // left room
    { x: 200, y: 20,  w: 20,  h: 160 },
    { x: 200, y: 320, w: 20,  h: 160 },
    { x: 20,  y: 180, w: 180, h: 20  },
    { x: 20,  y: 300, w: 180, h: 20  },

    // center cross
    { x: 420, y: 140, w: 20,  h: 100 },
    { x: 420, y: 260, w: 20,  h: 100 },
    { x: 340, y: 220, w: 100, h: 20  },
    { x: 480, y: 220, w: 100, h: 20  },

    // right cover
    { x: 650, y: 20,  w: 20,  h: 140 },
    { x: 650, y: 340, w: 20,  h: 140 },
  ]
};

export const LEVEL_4 = {
  playerSpawn: { x: 80, y: 140 },
  enemySpawns: [
    { x: 650, y: 100, type: 'teal' },
    { x: 650, y: 380, type: 'teal' },
    { x: 780, y: 240, type: 'black' },
    { x: 600, y: 240, type: 'black' },
    { x: 780, y: 100, type: 'black' },
    { x: 400, y: 380, type: 'white' },
  ],
  walls: [
    // borders
    { x: 0,   y: 0,   w: 900, h: 20  },
    { x: 0,   y: 480, w: 900, h: 20  },
    { x: 0,   y: 0,   w: 20,  h: 500 },
    { x: 880, y: 0,   w: 20,  h: 500 },

    // player side cover
    { x: 150, y: 100, w: 20,  h: 120 },
    { x: 150, y: 280, w: 20,  h: 120 },
    { x: 20,  y: 220, w: 130, h: 20  },

    // center barriers
    { x: 380, y: 20,  w: 20,  h: 120 },
    { x: 380, y: 360, w: 20,  h: 120 },
    { x: 380, y: 220, w: 120, h: 20  },

    // right side obstacles
    { x: 560, y: 120, w: 80,  h: 20  },
    { x: 560, y: 360, w: 80,  h: 20  },
  ]
};

export const LEVEL_5 = {
  playerSpawn: { x: 80, y: 240 },
    enemySpawns: [
    { x: 500, y: 150, type: 'gray'  },
    { x: 500, y: 350, type: 'gray'  },
    { x: 650, y: 240, type: 'teal'  },
    { x: 780, y: 150, type: 'black' },
    { x: 780, y: 350, type: 'black' },
    { x: 820, y: 240, type: 'white' },
  ],
  walls: [
    // borders
    { x: 0,   y: 0,   w: 900, h: 20  },
    { x: 0,   y: 480, w: 900, h: 20  },
    { x: 0,   y: 0,   w: 20,  h: 500 },
    { x: 880, y: 0,   w: 20,  h: 500 },

    // left maze
    { x: 150, y: 20,  w: 20,  h: 140 },
    { x: 150, y: 340, w: 20,  h: 140 },
    { x: 20,  y: 160, w: 130, h: 20  },
    { x: 20,  y: 320, w: 130, h: 20  },

    // center island
    { x: 360, y: 160, w: 120, h: 20  },
    { x: 360, y: 320, w: 120, h: 20  },
    { x: 360, y: 180, w: 20,  h: 140 },
    { x: 460, y: 180, w: 20,  h: 140 },

    // right corridors
    { x: 580, y: 20,  w: 20,  h: 100 },
    { x: 580, y: 200, w: 20,  h: 100 },
    { x: 580, y: 380, w: 20,  h: 100 },
    { x: 700, y: 120, w: 20,  h: 100 },
    { x: 700, y: 280, w: 20,  h: 100 },
  ]
};