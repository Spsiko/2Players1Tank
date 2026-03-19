const STATE =
{
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover',
};

class Game
{

  contstructor()
  {
    this.state = STATE.MENU;
    this.lastTime;
    this.particles = [];
    this.bullets = [];
    this.enemies = [];
  }

  start()
  {
    this.loop(performance.now());
  }

  loop(timestamp)
  {
    const dt = Math.min(0.033, (timestamp - lastTime) / 1000);
    this.lastTime = timestamp;
    this.update();
    this.render();
    requestAnimationFrame((t) => this.loop(t)); //Lambda is so it doesnt throw away the "this", so we keep context
  }

  update(dt)
  {

  }

  render(dt)
  {
    switch(this.state)
    {

    }
  }
}