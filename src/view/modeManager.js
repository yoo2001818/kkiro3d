export default class ModeManager {
  constructor(engine, renderer) {
    this.engine = engine;
    this.renderer = renderer;

    this.modeStack = [];
  }
  push(mode) {
    // 'Exit' previous mode
    if (this.modeStack.length > 0) {
      this.modeStack[this.modeStack.length - 1].exit();
    }
    this.modeStack.push(mode);
    mode.enter(this);
  }
  pop() {
    this.modeStack[this.modeStack.length - 1].exit();
    this.modeStack.pop();
    // Enter previous mode
    if (this.modeStack.length > 0) {
      this.modeStack[this.modeStack.length - 1].enter(this);
    }
  }
  get() {
    return this.modeStack[this.modeStack.length - 1];
  }
  addEventDelegator(target, name) {
    target.addEventListener(name, e => {
      let current = this.get();
      if (current && current[name]) return current[name](e);
    });
  }
}
