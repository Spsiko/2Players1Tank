import { InputManager } from './input.js';
import { Level } from './level.js';
import { LEVEL_1 } from './levels/level1.js';
import { Player } from './playerTank.js';
import { overlapAABB, circleAABBNormal } from './collision/index.js'
import { Bullet } from './bullet.js';
import { eventBus } from './eventBus.js';
import { EnemyTank } from './enemyTank.js';
import { StationaryAI } from './ai/stationaryAI.js';

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
    this.state = STATE.MENU;
    this.lastTime = 0;
    this.particles = [];
    this.bullets = [];
    this.enemies = [];
    this.input = new InputManager(this.canvas);
    this.level = new Level(LEVEL_1);  //TODO: have this be null by def and select in main menu
    this.player = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y);
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

  setState(newState)
  {
    console.log(`${this.state} -> ${newState}`);  
    
    if (newState === STATE.PLAYING)
    {
      this.resetGame();
    }

    if (newState === STATE.GAMEOVER)
    {
      // future: save score here
    }

    this.state = newState;
  }

  resetGame()
  {
    this.bullets   = [];
    this.particles = [];
    this.enemies   = this.level.enemySpawns.map(spawn =>
      new EnemyTank(spawn.x, spawn.y, spawn.type, new StationaryAI())
    );
    this.player = new Player(
      this.level.playerSpawn.x,
      this.level.playerSpawn.y
    );
  }

  update(dt)
  {
    switch(this.state)
    {
      case STATE.MENU:     this.updateMenu(dt);    break;
      case STATE.PLAYING:  this.updatePlaying(dt); break;
      case STATE.GAMEOVER: this.updateGameOver(dt);break;
    }
  }

  render()
  {
    switch(this.state)
    {
      case STATE.MENU:     this.renderMenu();     break;
      case STATE.PLAYING:  this.renderPlaying();  break;
      case STATE.GAMEOVER: this.renderGameOver(); break;
    }
    this.input.flush();
  }

  updateMenu(dt)
  {
    if (this.input.wasJustPressed('Space'))
    {
      this.setState(STATE.PLAYING);
    }
  }

  updateGameOver(dt)
  {
    if (this.input.wasJustPressed('Space'))
    {
      this.setState(STATE.MENU);
    }
  }

  updatePlaying(dt)
  {
    this.player.update(dt, this.input);
    this.processEvents();
    this.updateBullets(dt);
    this.resolveTankCollision();
    const context =
    {
      player: this.player,
      walls: this.level.getWalls(),
      bullets: this.bullets,
      enemies: this.enemies,
    };

    this.updateEnemies(dt, context);
  }

  renderMenu() {
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillText('WII TANKS', this.canvas.width / 2, 180);

    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press SPACE to play', this.canvas.width / 2, 260);
  }

  renderGameOver() {
    this.renderPlaying();

    // overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ff4d4d';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 52px Arial';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, 200);

    this.ctx.fillStyle = 'white';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Score: 0', this.canvas.width / 2, 260);  // TODO: real score
    this.ctx.fillText('Press SPACE to return to menu', this.canvas.width / 2, 300);
  }

  renderPlaying()
  {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.level.render(this.ctx);
    this.player.render(this.ctx);
    for (const b of this.bullets) b.render(this.ctx);
    for (const e of this.enemies) e.render(this.ctx);
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

  updateEnemies(dt, context)
  {
    for (const enemy of this.enemies)
    {
      enemy.update(dt, context);
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