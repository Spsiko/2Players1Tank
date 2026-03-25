import { InputManager } from './input.js';
import { AudioManager } from './audio.js';
import { emitExplosion, emitDust, updateParticles, renderParticles, emitScorePopup } from './particles.js';
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
    this.displayScore = 0;
    this.particles = [];
    this.bullets = [];
    this.enemies = [];
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
    this.input = new InputManager(this.canvas);
    this.levels = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5]; // import all
    this.selectedLevel = 0;
    this.level = null;
    this.player = new Player();
    this.audio = new AudioManager();
    this.audio.load('shoot',     'src/assets/audio/impactMetal_003.ogg');
    this.audio.load('bounce',    'src/assets/audio/impactMetal_000.ogg');
    this.audio.load('explosion', 'src/assets/audio/explosionCrunch_001.ogg');
    this.audio.load('music',     'src/assets/audio/Scheme_inc.ogg'); // when ready

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
    switch(newState)
    {
      case(STATE.PLAYING):
      {
        this.resetGame();
        this.audio.playMusic('music');
        break;
      }

      case(STATE.WIN):
      {
        this.score = Math.max(0, this.score);
        this.audio.stopMusic('music');
        break;
      }

      case(STATE.GAMEOVER):
      {
        this.audio.stopMusic('music');
        break;
      }

      case(STATE.LEVEL_SELECT):
      {
        this.selectedLevel = 0; // reset selection each time
        break;
      }
    }

    this.state = newState;
  }

  resetGame()
  {
    this.bullets    = [];
    this.particles  = [];
    this.score      = 0;
    this.displayScore = 0;
    this.winDelay   = null; // null means win hasn't been triggered yet
    this.player     = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y);
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
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

    // if (this.player.isMoving) //TODO: Move this, when I actually have time
    // {
    //   emitDust(
    //     this.particles,
    //     this.player.x + this.player.w / 2,
    //     this.player.y + this.player.h / 2,
    //     this.player.trackAngle
    //   );
    // }
    if (this.shakeTime > 0) this.shakeTime -= dt; //TODO: also move this, I should make an effects manager.
    this.displayScore += (this.score - this.displayScore) * 5 * dt;
    if (Math.abs(this.score - this.displayScore) < 0.3) {
      this.displayScore = this.score;
    }
    this.processEvents();
    this.updateBullets(dt);
    this.resolveBulletTankCollision();
    this.resolveTankCollision();
    this.updateEnemies(dt);
    updateParticles(this.particles, dt);  //  Very ad-hoc
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
    this.ctx.font      = 'bold 40px Arial';
    this.ctx.fillText('SELECT LEVEL', this.canvas.width / 2, 80);

    const labels = [
      'Level 1 — Stationary enemies',
      'Level 2 — Moving enemies introduced',
      'Level 3 — Patrol enemies',
      'Level 4 — Long range enemies',
      'Level 5 — All enemy types',
    ];

    this.ctx.font    = '24px Arial';
    const startY     = 160;
    const spacing    = 55;

    for (let i = 0; i < this.levels.length; i++) {
      const y          = startY + i * spacing;
      const isSelected = i === this.selectedLevel;

      this.ctx.fillStyle = isSelected ? '#ffd700' : 'white';
      this.ctx.fillText(labels[i], this.canvas.width / 2, y);

      if (isSelected) {
        this.ctx.textAlign = 'left';
        this.ctx.fillText('►', this.canvas.width / 2 - 220, y);
        this.ctx.textAlign = 'center';
      }
    }

    this.ctx.fillStyle = '#888';
    this.ctx.font      = '20px Arial';
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

  renderMenu()
  {
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // title
    this.ctx.fillStyle  = 'white';
    this.ctx.textAlign  = 'center';
    this.ctx.font       = 'bold 48px Arial';
    this.ctx.fillText('MI TANQUE', this.canvas.width / 2, 120);

    // objective
    this.ctx.fillStyle  = '#ffd700';
    this.ctx.font       = '22px Arial';
    this.ctx.fillText('Destroy all enemy tanks to clear each level', this.canvas.width / 2, 180);

    // controls
    this.ctx.fillStyle  = 'white';
    this.ctx.font       = '20px Arial';
    this.ctx.fillText('Controls', this.canvas.width / 2, 240);

    this.ctx.fillStyle  = '#aaa';
    this.ctx.font       = '18px Arial';
    this.ctx.fillText('WASD / Arrow Keys — Move tank', this.canvas.width / 2, 275);
    this.ctx.fillText('Mouse — Aim turret', this.canvas.width / 2, 305);
    this.ctx.fillText('Left Click — Shoot', this.canvas.width / 2, 335);

    // prompt
    this.ctx.fillStyle  = 'white';
    this.ctx.font       = '22px Arial';
    this.ctx.fillText('Press SPACE to select level', this.canvas.width / 2, 420);
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
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, 260); 
    this.ctx.fillText('Press SPACE to return to menu', this.canvas.width / 2, 300);
  }

  renderPlaying()
  {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
    const { dx, dy } = this.getShakeOffset();
    this.ctx.save();
    this.ctx.translate(dx, dy);

    this.level.render(this.ctx);
    this.player.render(this.ctx);
    for (const e of this.enemies)  e.render(this.ctx);
    for (const b of this.bullets)  b.render(this.ctx);
    renderParticles(this.particles, this.ctx);

    this.ctx.restore(); // restore before HUD so HUD doesn't shake

    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'left';
    this.ctx.font      = '20px Arial';
    this.ctx.fillText(`Score: ${Math.floor(this.displayScore)}`, 30, 50);
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

        case 'TANK_HIT':
          event.tank.health--;
          // score on hit
          const bounceMultiplier = Math.pow(BOUNCE_MULTIPLIER, event.bullet.bounceCount);
          const friendlyFireMultiplier = event.bullet.owner instanceof EnemyTank ? FRIENDLY_FIRE_MULTIPLIER : 1;
          const hitScore = Math.floor(event.tank.hitValue * bounceMultiplier * friendlyFireMultiplier);
          this.score += hitScore;
          emitScorePopup(this.particles, event.x, event.y, hitScore);
          break;

        case 'TANK_KILLED':
          this.audio.play('explosion', 0.6);
          emitExplosion(this.particles, event.x, event.y, event.tank.color);
          if (event.tank === this.player)
          {
            this.setState(STATE.GAMEOVER);
          }
          else
          {
            this.triggerShake(0.3, event.tank === this.player ? 12 : 8);  //TODO: move before player check after fixing bug
            const bm = Math.pow(BOUNCE_MULTIPLIER, event.bullet.bounceCount);
            const ffm = event.bullet.owner instanceof EnemyTank ? FRIENDLY_FIRE_MULTIPLIER : 1;
            const killScore = Math.floor(event.tank.scoreValue * bm * ffm);
            this.score += killScore;
            emitScorePopup(this.particles, event.x, event.y - 20, killScore);
            this.enemies = this.enemies.filter(e => e !== event.tank);
          }
          break;
        
          case 'PLAY_SOUND':
            this.audio.play(event.sound);
            break;
        
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
      eventBus.push({ type: 'PLAY_SOUND', sound: 'bounce' });
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
        eventBus.push({ type: 'TANK_KILLED', tank: this.player, bullet: b, 
                        x: this.player.x + this.player.w / 2, y: this.player.y + this.player.h / 2 });
        this.bullets.splice(i, 1);
        return;
      }

      // check enemies — skip the tank that fired it
      for (let j = this.enemies.length - 1; j >= 0; j--)
      {
        const e = this.enemies[j];
        if (b.owner === e) continue;
        if (circleAABB(b, e))
        {
          // const bounceMultiplier = Math.pow(BOUNCE_MULTIPLIER, b.bounceCount);
          // const friendlyFireMultiplier = b.owner instanceof EnemyTank ? FRIENDLY_FIRE_MULTIPLIER : 1;

          // this.score += Math.floor(e.hitValue * bounceMultiplier * friendlyFireMultiplier);

          const cx = e.x + e.w / 2;
          const cy = e.y + e.h / 2;
          eventBus.push({ type: 'TANK_HIT', tank: e, bullet: b, x: cx, y: cy });
          if (e.health - 1 <= 0) 
          {
            eventBus.push({ type: 'TANK_KILLED', tank: e, bullet: b, x: cx, y: cy });
          }
          this.bullets.splice(i, 1);
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

  triggerShake(duration, magnitude = 8)
  {
    this.shakeTime      = Math.max(this.shakeTime, duration);
    this.shakeMagnitude = Math.max(this.shakeMagnitude, magnitude);
  }

  getShakeOffset()
  {
    if (this.shakeTime <= 0) return { dx: 0, dy: 0 };
    return {
      dx: (Math.random() - 0.5) * this.shakeMagnitude,
      dy: (Math.random() - 0.5) * this.shakeMagnitude,
    };
  }

}