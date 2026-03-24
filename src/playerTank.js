import { Tank } from './tank.js';
import { eventBus } from './eventBus.js';

export class Player extends Tank
{
  constructor(x, y)
  {
    super(x, y);
  }

  update(dt, input)
  {
    super.update(dt); //  I'm not so sure about this one chief

    if (input.isHeld('ArrowUp') || input.isHeld('KeyW'))
    {
      this.x += Math.cos(this.trackAngle) * this.speed * dt;
      this.y += Math.sin(this.trackAngle) * this.speed * dt;
    }

    if (input.isHeld('ArrowDown') || input.isHeld('KeyS'))
    {
      this.x -= Math.cos(this.trackAngle) * this.speed * dt;
      this.y -= Math.sin(this.trackAngle) * this.speed * dt;
    }

    if (input.isHeld('ArrowLeft') || input.isHeld('KeyA'))
    {
      this.trackAngle -= this.rotationSpeed * dt;  
    }

    if (input.isHeld('ArrowRight') || input.isHeld('KeyD'))
    {
      this.trackAngle += this.rotationSpeed * dt;
    }

    // turret aims at mouse
    const dx = input.mouse.x - (this.x + this.w / 2);
    const dy = input.mouse.y - (this.y + this.h / 2);
    this.gunAngle = Math.atan2(dy, dx) - this.trackAngle;

    // firing
    if (input.wasJustClicked(0) && this.fireCooldown <= 0)
    {
      this.fireCooldown = this.fireRate;
      const angle = this.trackAngle + this.gunAngle;
      const bulletSpeed = 400;  // TODO: move magic number
      eventBus.push(
      {
        type: 'SPAWN_BULLET',
        x: this.x + this.w / 2,
        y: this.y + this.h / 2,
        vx: Math.cos(angle) * bulletSpeed,
        vy: Math.sin(angle) * bulletSpeed,
        color: 'yellow',
        bounces: this.maxBounces
      });
    }
  }

  render(ctx)
  {
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2); // translate to center for rotation
    ctx.rotate(this.trackAngle);

    // body
    ctx.fillStyle = 'green';
    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h); 

    // gun
    ctx.rotate(this.gunAngle);
    ctx.fillStyle = 'darkgreen';
    ctx.fillRect(0, -4, .75*this.w, .33*this.h);  //TODO: Move Magic numbers

    ctx.restore();
  }
}