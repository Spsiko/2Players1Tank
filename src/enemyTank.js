import { Tank } from './tank.js';
import { ENEMY_DATA } from './enemyData.js';

export class EnemyTank extends Tank
{
  constructor(x, y, type, ai)
  {
    super(x, y);
    const data         = ENEMY_DATA[type];
    this.color         = data.color;
    this.gunColor      = data.gunColor;
    this.bulletColor   = data.bulletColor;
    this.bulletSpeed   = data.bulletSpeed;
    this.health        = data.health;
    this.maxBounces    = data.maxBounces;
    this.fireRate      = data.fireRate;
    this.speed         = data.speed;
    this.rotationSpeed = data.rotationSpeed;
    this.ai            = ai;
  }

  update(dt, context)
  {
    super.update(dt);
    this.ai.update(this, dt, context);
  }
}