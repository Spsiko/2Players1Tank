import { InputManager } from './input.js';
import { Level } from './level.js';
import { LEVEL_1 } from './levels/level1.js';
import { Player } from './playerTank.js';
import { overlapAABB, circleAABBNormal } from './collision/index.js'
import { Bullet } from './bullet.js';
import { eventBus } from './eventBus.js';

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
    if (this.state !== STATE.PLAYING) return;
    this.player.update(dt, this.input);
    this.processEvents();
    this.updateBullets(dt);
    this.resolveTankCollision();
    this.input.flush();
  }

  render()
  {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.state !== STATE.PLAYING) return;
    this.level.render(this.ctx);
    this.player.render(this.ctx);
    for (const b of this.bullets) b.render(this.ctx);
  }

  processEvents()
  {
    for (const event of eventBus.drain())
    {
      switch(event.type)
      {
        case 'SPAWN_BULLET':
          this.bullets.push(new Bullet(event.x, event.y, event.vx, event.vy, event.color, event.bounces));
          break;
        // future events go here
      }
    }
  }

  updateBullets(dt)
  {
    for (let i = this.bullets.length - 1; i >= 0; i--)
    {
      const b = this.bullets[i];
      b.update(dt);
      this.resolveBulletCollision(b, i);
    }
  }

  resolveBulletCollision(b, i)
  {
    for (const wall of this.level.getWalls())
    {
      const hit = circleAABBNormal(b, wall);
      if (!hit) continue;

      b.x += hit.nx * hit.depth;
      b.y += hit.ny * hit.depth;

      const dot = b.vx * hit.nx + b.vy * hit.ny;
      b.vx -= 2 * dot * hit.nx;
      b.vy -= 2 * dot * hit.ny;

      b.bounces--;
      if (b.bounces < 0)
      {
        this.bullets.splice(i, 1);
        break;
      }
    }
  }

  resolveTankCollision()
  {
    for (const wall of this.level.getWalls())
    {
      const hit = overlapAABB(this.player, wall);
      if (!hit) continue;
      if (hit.overlapX < hit.overlapY)
      {
        this.player.x += this.player.x < wall.x ? -hit.overlapX : hit.overlapX;
      }
      else
      {
        this.player.y += this.player.y < wall.y ? -hit.overlapY : hit.overlapY;
      }
    }
  }

}