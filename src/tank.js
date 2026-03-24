import { Entity } from "./entity.js";
import { eventBus } from "./eventBus.js";

export class Tank extends Entity
{
  constructor(x, y, w = 40, h = 36)
  {
    super(x, y, 0, 0);
    this.w            = w;
    this.h            = h;
    this.color        = undefined;
    this.gunColor     = undefined;
    this.bulletColor  = undefined;
    this.bulletSpeed  = undefined;
    this.health       = undefined;
    this.trackAngle   = 0;
    this.gunAngle     = 0;
    this.maxBounces   = undefined;
    this.fireCooldown = 0;
    this.fireRate     = undefined;
    this.speed        = undefined;
    this.rotationSpeed = undefined;
  }

  update(dt)
  {
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
  }

  fire()
  {
    if (this.fireCooldown > 0) return;
    this.fireCooldown = this.fireRate;
    const angle = this.trackAngle + this.gunAngle;
    eventBus.push({
      type: 'SPAWN_BULLET',
      x: this.x + this.w / 2,
      y: this.y + this.h / 2,
      vx: Math.cos(angle) * this.bulletSpeed,
      vy: Math.sin(angle) * this.bulletSpeed,
      color: this.bulletColor,
      bounces: this.maxBounces
    });
  }

  render(ctx)
  {
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.trackAngle);

    ctx.fillStyle = this.color;
    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);

    ctx.rotate(this.gunAngle);
    ctx.fillStyle = this.gunColor;
    ctx.fillRect(0, -4, this.w * 0.75, this.h * 0.33);

    ctx.restore();
  }
}