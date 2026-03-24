import { Tank } from './tank.js';

export class Player extends Tank
{
  constructor(x, y)
  {
    super(x, y);
    this.color        = 'green';
    this.gunColor     = 'darkgreen';
    this.bulletColor  = 'yellow';
    this.bulletSpeed  = 400;
    this.health       = 1;
    this.maxBounces   = 2;
    this.fireRate     = 1.0;
    this.speed        = 150;
    this.rotationSpeed = 2;
    this.prevX        = 0;
    this.prevY        = 0;
  }

  update(dt, input)
  {
    this.prevX = this.x;
    this.prevY = this.y;
    super.update(dt);

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

    if (input.wasJustClicked(0))
    {
      this.fire();
    }
  }
}