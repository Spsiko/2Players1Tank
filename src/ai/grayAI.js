import { rayAABB, hasLOS } from '../collision/index.js';

export class GrayAI
{

  update(tank, dt, context)
  {
    const playerCX = context.player.x + context.player.w / 2;
    const playerCY = context.player.y + context.player.h / 2;

    tank.moveToward(playerCX, playerCY, dt);

    if (hasLOS(tank, context))
    {
      const dx = playerCX - (tank.x + tank.w / 2);
      const dy = playerCY - (tank.y + tank.h / 2);
      tank.gunAngle = Math.atan2(dy, dx) - tank.trackAngle;
      tank.fire();
    }
  }
}