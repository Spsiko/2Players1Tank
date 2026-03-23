import { InputManager } from './input.js';
import { Level } from './level.js';
import { LEVEL_1 } from './levels/level1.js';
import { Player } from './playerTank.js';
import { overlapAABB } from './collision/index.js'
const STATE = {
  MENU:     'menu',
  PLAYING:  'playing',
  PAUSED:   'paused',
  GAMEOVER: 'gameover',
};

export class Game {
  constructor(canvasId)
  {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.state = STATE.PLAYING;
    this.lastTime = 0;
    this.particles = [];
    this.bullets = [];
    this.enemies = [];
    this.input = new InputManager(this.canvas);
    this.level = new Level(LEVEL_1);  //TODO: have this be null by def and select in main menu
    this.player = new Player(
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  start()
  {
    this.loop(performance.now());
  }

  loop(timestamp)
  {
    const dt = Math.min(0.033, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;
    this.update(dt);
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt)
  {
    if (this.state !== STATE.PLAYING) return; //TODO: split into dumber leaf functions
    this.player.update(dt, this.input);

    for (const wall of this.level.getWalls())
    {
      const hit = overlapAABB(this.player, wall);
      if (!hit) continue;

      if (hit.overlapX < hit.overlapY) {
        this.player.x += this.player.x < wall.x ? -hit.overlapX : hit.overlapX;
      } else {
        this.player.y += this.player.y < wall.y ? -hit.overlapY : hit.overlapY;
      }
    }

    this.input.flush();
  }

  render()
  {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.state !== STATE.PLAYING) return;
    this.level.render(this.ctx);
    this.player.render(this.ctx);
  }
}