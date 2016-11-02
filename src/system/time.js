export default function timeSystem(engine) {
  this.hooks = {
    'external.update:pre!': (args) => {
      if (!engine.state.global.running) return;
      return args;
    },
    'external.update!': ([delta]) => {
      engine.actions.time.add(delta);
    }
  };
}
