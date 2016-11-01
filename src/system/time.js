export default function timeSystem(engine) {
  this.hooks = {
    'external.update!': ([delta]) => {
      engine.actions.time.add(delta);
    }
  };
}
