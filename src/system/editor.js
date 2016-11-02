export default class EditorSystem {
  constructor() {
    this.hooks = {
      'network.connect:post!': ([id]) => {
        // Fill up default data.
        let data = this.get(id);
        Object.assign(data, {
          camera: -1, // :S
          selected: -1,
          selectedType: 'entity',
          outlineType: 'entity',
          cursor: [0, 0, 0],
        });
      }
    };
  }
  attach(engine) {
    this.engine = engine;
  }
  getId() {
    return this.engine.systems.network.getId();
  }
  getSelf() {
    return this.get(this.getId()) || {};
  }
  get(id) {
    return this.engine.systems.network.getData(id);
  }
}
