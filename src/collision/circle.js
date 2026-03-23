export function circleCircle(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return (dx * dx + dy * dy) <= (a.r + b.r) ** 2;
}