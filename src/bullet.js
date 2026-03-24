import { Entity } from "./entity.js";

export class Bullet extends Entity
{
  constructor(x = 0, y = 0, vx = 0, vy = 0, color = 'yellow', bounces = 1, r = 6, owner = null)
  {
    super(x, y, vx, vy);
    this.color = color;
    this.bounces = bounces;
    this.r = r;
    this.owner = owner;
    this.spawnImmunity = .05  //Seconds
  }

  update(dt)
  {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.spawnImmunity > 0) this.spawnImmunity -= dt;
  }

  render(ctx)
  {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}