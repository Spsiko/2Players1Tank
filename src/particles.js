// TODO: split into particles/particle.js and particles/emitters.js if I work on this again

export function emitExplosion(particles, x, y, color = 'orange', count = 40)
{
  for (let i = 0; i < count; i++)
  {
    const angle  = Math.random() * Math.PI * 2;
    const speed  = 50 + Math.random() * 200;
    particles.push({
      x, y,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      size:  2 + Math.random() * 4,
      life:  1.0,
      decay: 0.8 + Math.random() * 0.8,
      color,
    });
  }
}

export function emitDust(particles, x, y, angle, color = '#aaa', count = 3)
{
  for (let i = 0; i < count; i++)
  {
    const spread = (Math.random() - 0.5) * 1.2;
    const speed  = 20 + Math.random() * 40;
    particles.push({
      x, y,
      vx:    Math.cos(angle + Math.PI + spread) * speed,
      vy:    Math.sin(angle + Math.PI + spread) * speed,
      size:  2 + Math.random() * 3,
      life:  1.0,
      decay: 2.0 + Math.random() * 1.5,  // dies faster than explosion
      color,
    });
  }
}

export function emitScorePopup(particles, x, y, score)
{
  particles.push({
    type:  'popup',
    x, y,
    vy:    -60,
    life:  1.0,
    decay: 1.2,
    text:  `+${score}`,
  });
}

export function updateParticles(particles, dt)
{
  for (let i = particles.length - 1; i >= 0; i--)
  {
    const p  = particles[i];
    p.x     += (p.vx ?? 0) * dt;
    p.y     += (p.vy ?? 0) * dt;
    if (p.vx !== undefined) p.vx *= 0.95;
    if (p.vy !== undefined && p.type !== 'popup') p.vy *= 0.95;
    p.life  -= p.decay * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

export function renderParticles(particles, ctx)
{
  ctx.textAlign = 'center';
  ctx.font      = 'bold 18px Arial';

  for (const p of particles)
  {
    ctx.globalAlpha = p.life;
    if (p.type === 'popup') {
      ctx.fillStyle = '#ffd700';
      ctx.fillText(p.text, p.x, p.y);
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  }
  ctx.globalAlpha = 1;
}