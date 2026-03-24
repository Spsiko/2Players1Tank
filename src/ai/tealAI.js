import { rayAABB, hasLOS } from '../collision/index.js';

const PATROL_RADIUS  = 200;
const LOST_DELAY     = 0.5;
const PATROL_TIMEOUT = 2.0; // seconds before picking a new target

const AI_STATE =
{
  PATROL: 'patrol',
  CHASE:  'chase',
  LOST:   'lost',
};

export class TealAI
{
  constructor()
  {
    this.state       = AI_STATE.PATROL;
    this.lostTimer   = 0;
    this.patrolTarget = null;  // current wander target
    this.patrolTimer = 0; 
  }

  pickPatrolTarget(tank)
  {
    const angle  = Math.random() * Math.PI * 2;
    const radius = Math.random() * PATROL_RADIUS;
    this.patrolTarget =
    {
      x: tank.x + Math.cos(angle) * radius,
      y: tank.y + Math.sin(angle) * radius,
    };
    this.patrolTimer = PATROL_TIMEOUT;  // reset timer on new target
  }

  update(tank, dt, context)
  {
    const los = hasLOS(tank, context);

    switch(this.state)
    {
      case AI_STATE.PATROL:
        this.updatePatrol(tank, dt, context, los);
        break;
      case AI_STATE.CHASE:
        this.updateChase(tank, dt, context, los);
        break;
      case AI_STATE.LOST:
        this.updateLost(tank, dt, los);
        break;
    }
  }

  updatePatrol(tank, dt, context, los)
  {
    if (los)
    {
      this.state = AI_STATE.CHASE;
      return;
    }

    this.patrolTimer -= dt;

    if (!this.patrolTarget || this.patrolTimer <= 0) 
    {
      this.pickPatrolTarget(tank);
    }

    const dx   = this.patrolTarget.x - (tank.x + tank.w / 2);
    const dy   = this.patrolTarget.y - (tank.y + tank.h / 2);
    const dist = Math.hypot(dx, dy);

    if (dist < 10)
    {
      this.patrolTarget = null; // reached target, pick new one next frame
      return;
    }

    tank.moveToward(this.patrolTarget.x, this.patrolTarget.y, dt);
  }

  updateChase(tank, dt, context, los)
  {
    if (!los)
    {
      this.state     = AI_STATE.LOST;
      this.lostTimer = LOST_DELAY;
      return;
    }

    const playerCX = context.player.x + context.player.w / 2;
    const playerCY = context.player.y + context.player.h / 2;

    tank.moveToward(playerCX, playerCY, dt);

    // aim and shoot
    const dx = playerCX - (tank.x + tank.w / 2);
    const dy = playerCY - (tank.y + tank.h / 2);
    tank.gunAngle = Math.atan2(dy, dx) - tank.trackAngle;
    tank.fire();
  }

  updateLost(tank, dt, los)
  {
    if (los) 
    {
      this.state = AI_STATE.CHASE;
      return;
    }

    // already facing last known direction, just keep moving
    tank.x += Math.cos(tank.trackAngle) * tank.speed * dt;
    tank.y += Math.sin(tank.trackAngle) * tank.speed * dt;

    this.lostTimer -= dt;
    if (this.lostTimer <= 0) 
    {
      this.state        = AI_STATE.PATROL;
      this.patrolTarget = null;
    }
  }
}