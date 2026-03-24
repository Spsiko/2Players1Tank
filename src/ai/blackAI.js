import { rayAABB, hasLOS } from '../collision/index.js';

const PREFERRED_DISTANCE = 250; // how far black tries to stay from player
const DISTANCE_TOLERANCE = 50;  // acceptable range around preferred distance

export class BlackAI
{
  update(tank, dt, context)
  {
    const playerCX = context.player.x + context.player.w / 2;
    const playerCY = context.player.y + context.player.h / 2;

    const dx   = playerCX - (tank.x + tank.w / 2);
    const dy   = playerCY - (tank.y + tank.h / 2);
    const dist = Math.hypot(dx, dy);

    const los = hasLOS(tank, context);

    this.reposition(tank, dt, dx, dy, dist, los, playerCX, playerCY);

    if (los)
    {
      this.aimAndFire(tank, dt, context, playerCX, playerCY, dist);
    }
  }

  reposition(tank, dt, dx, dy, dist, los, playerCX, playerCY) 
  {
    if (!los)
    {
      // no LOS — move toward player to find it
      tank.moveToward(playerCX, playerCY, dt);
      return;
    }

    if (dist < PREFERRED_DISTANCE - DISTANCE_TOLERANCE) {
      // too close — back away
      tank.x -= (dx / dist) * tank.speed * dt;
      tank.y -= (dy / dist) * tank.speed * dt;
    } else if (dist > PREFERRED_DISTANCE + DISTANCE_TOLERANCE) {
      // too far — move closer
      tank.moveToward(playerCX, playerCY, dt);
    }
    // within tolerance — stay put
  }

  aimAndFire(tank, dt, context, playerCX, playerCY, dist)
  {
    // calculate player velocity from previous position
    const playerVx = (context.player.x - context.player.prevX) / dt;
    const playerVy = (context.player.y - context.player.prevY) / dt;

    // predict where player will be when bullet arrives
    const timeToHit    = dist / tank.bulletSpeed;
    const predictedX   = playerCX + playerVx * timeToHit;
    const predictedY   = playerCY + playerVy * timeToHit;

    const aimDx = predictedX - (tank.x + tank.w / 2);
    const aimDy = predictedY - (tank.y + tank.h / 2);

    tank.gunAngle = Math.atan2(aimDy, aimDx) - tank.trackAngle;
    tank.fire();
  }
}