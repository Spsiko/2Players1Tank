export class InputManager
{
  constructor(canvas)
  {
    this.keys = {};
    this.prevKeys = {};
    this.mouseButtons = {};
    this.prevMouseButtons = {};
    this.mouse = { x: 0, y: 0 };
    this.canvas = canvas;

    //Event listeners
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
      }
      this.keys[e.code] = true
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    });

    window.addEventListener('blur', () => this.keys = {});  //Handles alt-tabs

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    });
    
    window.addEventListener('mousedown', (e) => this.mouseButtons[e.button] = true);
    window.addEventListener('mouseup',   (e) => this.mouseButtons[e.button] = false);
  }

  isHeld(code)
  {
    return !!this.keys[code];
  }

  wasJustPressed(code) {
    return !!this.keys[code] && !this.prevKeys[code];
  }

  isMouseHeld(button) {
    return !!this.mouseButtons[button];
  }

  wasJustClicked(button) {
    return !!this.mouseButtons[button] && !this.prevMouseButtons[button];
  }

  flush() {
    this.prevKeys = { ...this.keys };
    this.prevMouseButtons = { ...this.mouseButtons };
  }
}