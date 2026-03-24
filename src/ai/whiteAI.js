import { hasLOS } from '../collision/index.js';

const DIRECTION_CHANGE_INTERVAL = 0.8; // seconds between direction changes
const MAX_ANGLE_OFFSET = Math.PI / 2;  // max 90 degrees off from player direction
const INACCURACY = 0.6;                // aim spread in radians

export class WhiteAI
{
  constructor()
  {
    this.directionTimer = 0;
    this.moveAngle      = 0;
  }

  update(tank, dt, context)
  {
    const playerCX = context.player.x + context.player.w / 2;
    const playerCY = context.player.y + context.player.h / 2;

    const dx   = playerCX - (tank.x + tank.w / 2);
    const dy   = playerCY - (tank.y + tank.h / 2);

    this.updateMovement(tank, dt, dx, dy);

    if (hasLOS(tank, context))
    {
      this.shoot(tank, dx, dy);
    }
  }

  updateMovement(tank, dt, dx, dy)
  {
    this.directionTimer -= dt;

    if (this.directionTimer <= 0)
    {
      // bias toward player with random offset
      const angleToPlayer = Math.atan2(dy, dx);
      const offset        = (Math.random() - 0.5) * 2 * MAX_ANGLE_OFFSET;
      this.moveAngle      = angleToPlayer + offset;
      this.directionTimer = DIRECTION_CHANGE_INTERVAL;
    }

    tank.trackAngle = this.moveAngle;
    tank.x += Math.cos(this.moveAngle) * tank.speed * dt;
    tank.y += Math.sin(this.moveAngle) * tank.speed * dt;
  }

  shoot(tank, dx, dy)
  {
    const inaccuracy = (Math.random() - 0.5) * INACCURACY;
    tank.gunAngle    = Math.atan2(dy, dx) - tank.trackAngle + inaccuracy;
    tank.fire();
  }
}