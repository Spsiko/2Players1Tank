
class Entity
{
  
  constructor(x = 0, y = 0, vx = 0, vy = 0)
  {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }

  update(dt) {
    throw new Error(`${this.constructor.name} must implement update()`);
  }

  render(ctx) {
    throw new Error(`${this.constructor.name} must implement render()`);
  }

}