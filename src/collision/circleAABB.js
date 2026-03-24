export function circleAABB(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));

  const dx = circle.x - closestX;
  const dy = circle.y - closestY;

  return (dx * dx + dy * dy) <= circle.r ** 2;
}

export function circleAABBNormal(circle, rect) {
  // reuse circleAABB for the boolean check
  if (!circleAABB(circle, rect)) return null;

  const overlapLeft  = (circle.x + circle.r) - rect.x;
  const overlapRight = (rect.x + rect.w) - (circle.x - circle.r);
  const overlapTop   = (circle.y + circle.r) - rect.y;
  const overlapBottom = (rect.y + rect.h) - (circle.y - circle.r);

  const min = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

  if (min === overlapLeft)   return { nx: -1, ny: 0, depth: overlapLeft };
  if (min === overlapRight)  return { nx:  1, ny: 0, depth: overlapRight };
  if (min === overlapTop)    return { nx:  0, ny: -1, depth: overlapTop };
                             return { nx:  0, ny:  1, depth: overlapBottom };
}