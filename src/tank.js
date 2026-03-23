import { Entity } from "./entity.js";

export class Tank extends Entity
{
  constructor(x, y, w = 40, h = 36) 
  {
    super(x, y, 0, 0);
    this.w = w;
    this.h = h;
    this.health = 1;  //TODO: Change this
    this.trackAngle = 0;
    this.gunAngle = 0;
    this.maxBounces = 1;
    this.fireCooldown = 0;  //Seconds
    this.fireRate = 1.0;  //Seconds between shots
    this.speed = 150; // pixels/second
    this.rotationSpeed = 2;
  }

  update(dt)
  {
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
  }
}