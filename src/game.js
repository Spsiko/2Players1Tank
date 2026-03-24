import { InputManager } from './input.js';
import { Level } from './level.js';
import { LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5 } from './levels.js';
import { Player } from './playerTank.js';
import { overlapAABB, circleAABBNormal, circleAABB } from './collision/index.js'
import { Bullet } from './bullet.js';
import { eventBus } from './eventBus.js';
import { EnemyTank } from './enemyTank.js';
import { BrownAI }      from './ai/brownAI.js';
import { GrayAI }       from './ai/grayAI.js';
import { TealAI }       from './ai/tealAI.js';
import { BlackAI }      from './ai/blackAI.js';
import { WhiteAI }      from './ai/whiteAI.js';

const STATE = {
  MENU:         'menu',
  LEVEL_SELECT: 'level_select',
  PLAYING:      'playing',
  PAUSED:       'paused',
  GAMEOVER:     'gameover',
  WIN:          'win',
};

const AI_MAP =
{
  brown:      BrownAI,
  gray:       GrayAI,
  teal:       TealAI,
  black:      BlackAI,
  white:      WhiteAI,
};

const BOUNCE_MULTIPLIER         = 1.1;
const FRIENDLY_FIRE_MULTIPLIER  = 1.5;

export class Game {
  constructor(canvasId)
  {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.state = STATE.MENU;
    this.lastTime = 0;
    this.score = 0;
    this.particles = [];
    this.bullets = [];
    this.enemies = [];
    this.input = new InputManager(this.canvas);
    this.levels = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5]; // import all
    this.selectedLevel = 0;
    this.level = null;
    this.player = new Player();

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
    
    if (newState === STATE.PLAYING)
    {
      this.resetGame();
    }

    if (newState === STATE.WIN)
    {
      this.score = Math.max(0, this.score);
    }

    if (newState === STATE.LEVEL_SELECT)
    {
      this.selectedLevel = 0; // reset selection each time
    }

    this.state = newState;
  }

  resetGame()
  {
    this.bullets    = [];
    this.enemies    = [];
    this.particles  = [];
    this.score      = 0;
    this.winDelay   = null; // null means win hasn't been triggered yet
    this.player     = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y);
    this.enemies = this.level.enemySpawns.map(spawn => {
      const AIClass = AI_MAP[spawn.type];
      return new EnemyTank(spawn.x, spawn.y, spawn.type, new AIClass());
    });
  }

  update(dt)
  {
    switch(this.state)
    {
      case STATE.MENU:         this.updateMenu(dt);        break;
      case STATE.LEVEL_SELECT: this.updateLevelSelect(dt); break;
      case STATE.PLAYING:      this.updatePlaying(dt);     break;
      case STATE.GAMEOVER:     this.updateGameOver(dt);    break;
      case STATE.WIN:          this.updateWin(dt);         break;
    }
    this.input.flush();
  }

  render()
  {
    switch(this.state)
    {
      case STATE.MENU:         this.renderMenu();        break;
      case STATE.LEVEL_SELECT: this.renderLevelSelect(); break;
      case STATE.PLAYING:      this.renderPlaying();     break;
      case STATE.GAMEOVER:     this.renderGameOver();    break;
      case STATE.WIN:          this.renderWin();         break;
    }
  }

  updateMenu(dt)
  {
    if (this.input.wasJustPressed('Space'))
    {
      this.setState(STATE.LEVEL_SELECT);
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
    this.resolveBulletTankCollision();
    this.resolveTankCollision();
    this.updateEnemies(dt);
    this.checkWin(dt);
  }

  updateLevelSelect(dt)
  {
    if (this.input.wasJustPressed('ArrowUp') || this.input.wasJustPressed('KeyW')) 
    {
      this.selectedLevel = Math.max(0, this.selectedLevel - 1);
    }
    if (this.input.wasJustPressed('ArrowDown') || this.input.wasJustPressed('KeyS')) 
    {
      this.selectedLevel = Math.min(this.levels.length - 1, this.selectedLevel + 1);
    }
    if (this.input.wasJustPressed('Space')) 
    {
      this.level = new Level(this.levels[this.selectedLevel]);
      this.setState(STATE.PLAYING);
    }
  }

  updateWin(dt)
  {
    if (this.input.wasJustPressed('Space'))
    {
      this.setState(STATE.LEVEL_SELECT);
    }
  }

  renderLevelSelect()
  {
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 40px Arial';
    this.ctx.fillText('SELECT LEVEL', this.canvas.width / 2, 100);

    this.ctx.font = '28px Arial';
    const startY = 180;
    const spacing = 60;

    for (let i = 0; i < this.levels.length; i++)
    {
      const y = startY + i * spacing;
      const isSelected = i === this.selectedLevel;

      this.ctx.fillStyle = isSelected ? '#ffd700' : 'white';
      this.ctx.fillText(`Level ${i + 1}`, this.canvas.width / 2, y);

      if (isSelected)
      {
        this.ctx.fillText('►', this.canvas.width / 2 - 120, y);
      }
    }

    this.ctx.fillStyle = '#888';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('W/S or Arrows to select, SPACE to play', this.canvas.width / 2, 460);
  }

  renderWin()
  {
    this.renderPlaying();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ffd700';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 52px Arial';
    this.ctx.fillText('LEVEL CLEAR', this.canvas.width / 2, 180);

    this.ctx.fillStyle = 'white';
    this.ctx.font = '28px Arial';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, 250);
    this.ctx.fillText('Press SPACE to return to level select', this.canvas.width / 2, 350);
  }

  renderMenu() {
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.fillText('MI TANQUE', this.canvas.width / 2, 180);

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
          this.bullets.push(new Bullet(
            event.x, event.y, event.vx, event.vy,
            event.color, event.bounces, 6, event.owner
          ));
          break;
        // future events go here
      }
    }
  }

  checkWin(dt)
  {
    if (this.enemies.length > 0)
    {
      this.winDelay = null; // reset if enemies somehow respawn
      return;
    }

    if (this.winDelay === null)
    {
      this.winDelay = 1.5; // seconds to wait
    }

    this.winDelay -= dt;
    if (this.winDelay <= 0)
    {
      this.setState(STATE.WIN);
    }
  }

  updateBullets(dt)
  {
    for (let i = this.bullets.length - 1; i >= 0; i--)
    {
      const b = this.bullets[i];
      b.update(dt);
      this.resolveBulletCollision(b, i);

      if (b.x + b.r < 0 || b.x - b.r > this.canvas.width ||
          b.y + b.r < 0 || b.y - b.r > this.canvas.height)
      {
        this.bullets.splice(i, 1);
      }
    }
  }

  updateEnemies(dt)
  {
    const context =
    {
      player: this.player,
      walls: this.level.getWalls(),
      bullets: this.bullets,
      enemies: this.enemies,
    };

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
      b.bounceCount++;
      if (b.bounces < 0)
      {
        this.bullets.splice(i, 1);
      }

      break;
    }
  }

  resolveBulletTankCollision()
  {
    for (let i = this.bullets.length - 1; i >= 0; i--)
    {
      const b = this.bullets[i];

      // check player — all bullets can hit player
      if (b.spawnImmunity <= 0 && circleAABB(b, this.player))
      {
        this.bullets.splice(i, 1);
        this.setState(STATE.GAMEOVER);
        return;
      }

      // check enemies — skip the tank that fired it
      for (let j = this.enemies.length - 1; j >= 0; j--)
      {
        const e = this.enemies[j];
        if (b.owner === e) continue;
        if (circleAABB(b, e))
        {
          const bounceMultiplier = Math.pow(BOUNCE_MULTIPLIER, b.bounceCount);
          const friendlyFireMultiplier = b.owner instanceof EnemyTank ? FRIENDLY_FIRE_MULTIPLIER : 1;

          this.score += Math.floor(e.hitValue * bounceMultiplier * friendlyFireMultiplier);
          
          e.health--;
          this.bullets.splice(i, 1);
          if (e.health <= 0) 
          {
            this.score += Math.floor(e.scoreValue * bounceMultiplier * friendlyFireMultiplier);
            this.enemies.splice(j, 1);
          }
          break;
        }
      }
    }
  }

 resolveTankCollision()
 {
    this.resolveSingleTankCollision(this.player);
    for (const enemy of this.enemies)
    {
      this.resolveSingleTankCollision(enemy);
    }
  }

  resolveSingleTankCollision(tank)
  {
    for (const wall of this.level.getWalls()) 
    {
      const hit = overlapAABB(tank, wall);
      if (!hit) continue;
      if (hit.overlapX < hit.overlapY) {
        tank.x += tank.x < wall.x ? -hit.overlapX : hit.overlapX;
      } else {
        tank.y += tank.y < wall.y ? -hit.overlapY : hit.overlapY;
      }
    }
  }

}