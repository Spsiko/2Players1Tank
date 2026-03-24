export class BrownAI
{
  update(tank, dt, context)
  {
    const dx = (context.player.x + context.player.w / 2) - (tank.x + tank.w / 2);
    const dy = (context.player.y + context.player.h / 2) - (tank.y + tank.h / 2);
    tank.gunAngle = Math.atan2(dy, dx) - tank.trackAngle;
    tank.fire();
  }
}