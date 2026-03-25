export class AudioManager
{
  constructor()
  {
    this.sounds = {};
    this.unlocked  = false;
    window.addEventListener('keydown', () => this.unlocked = true, { once: true });
    window.addEventListener('mousedown', () => this.unlocked = true, { once: true });
  }

  load(name, path)
  {
    const audio = new Audio(path);
    audio.preload = 'auto';
    this.sounds[name] = audio;
  }

  play(name, volume = 1.0)
  {
    if (!this.unlocked) return; // silently skip until user has interacted
    const sound = this.sounds[name];
    if (!sound) return;
    const clone = sound.cloneNode(); // allows overlapping sounds
    clone.volume = volume;
    clone.play().catch(() => {}); // catch autoplay policy errors silently
  }

  playMusic(name, volume = 0.4)
  {
    const sound = this.sounds[name];
    if (!sound) return;
    sound.loop = true;
    sound.volume = volume;
    sound.play().catch(() => {});
  }

  stopMusic(name)
  {
    const sound = this.sounds[name];
    if (!sound) return;
    sound.pause();
    sound.currentTime = 0;
  }
}