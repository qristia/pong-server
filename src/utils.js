export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function circleRectIntersection(circle, rect) {
  const r = circle.radius;
  const x = circle.x - rect.x;
  const y = circle.y - rect.y;

  return Math.abs(x) <= r + rect.width / 2 && Math.abs(y) <= r + rect.height / 2;
}
