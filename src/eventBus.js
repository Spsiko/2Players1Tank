export const eventBus = {
  queue: [],
  push(event) { this.queue.push(event); },
  drain() { const q = this.queue; this.queue = []; return q; }
};