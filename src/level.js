/*
  In a project of overkill this is very overkill.
The reason I have a class for levels is becaues it gives a way to update with less friction.
Altough I am starting with tilemap levels if I want to change I should have less to deal with
if other parts deal with a wrapper instead of the actual data and stuff.
*/
export class Level
{
  constructor(data) {
    this.walls = data.walls;
    this.enemySpawns = data.enemySpawns;
    this.playerSpawn = data.playerSpawn;
  }

  // Level.js
  render(ctx) {
    ctx.fillStyle = '#8B7355'; // or whatever wall color
    for (const wall of this.walls) {
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    }
  }

  getWalls()
  {
    return this.walls;
  }
}