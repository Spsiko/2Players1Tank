export function rayAABB(x1, y1, x2, y2, rect)
{
  const dx = x2 - x1;
  const dy = y2 - y1;

  const tMinX = (rect.x - x1) / dx;
  const tMaxX = (rect.x + rect.w - x1) / dx;
  const tMinY = (rect.y - y1) / dy;
  const tMaxY = (rect.y + rect.h - y1) / dy;

  const tEnter = Math.max(Math.min(tMinX, tMaxX), Math.min(tMinY, tMaxY));
  const tExit  = Math.min(Math.max(tMinX, tMaxX), Math.max(tMinY, tMaxY));

  return tEnter <= tExit && tExit >= 0 && tEnter <= 1;
}

export function hasLOS(tank, context)
{
  const player = context.player;
  const x1 = tank.x + tank.w / 2;
  const y1 = tank.y + tank.h / 2;
  const x2 = player.x + player.w / 2;
  const y2 = player.y + player.h / 2;

  for (const wall of context.walls)
  {
    if (rayAABB(x1, y1, x2, y2, wall)) return false;
  }
  return true;
}