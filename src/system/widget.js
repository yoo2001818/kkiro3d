export default class WidgetSystem {
  constructor() {
  }
  attach(engine) {
    this.engine = engine;
    // Whole widget system 'locks' to single entity, because only one object
    // can be selected at the single time
    this.widget = null;
    // This is kinda weird though, but it works?
    this.hooks = {
      'external.start:post!': () => {
        this.widget = engine.actions.entity.create({
          transform: {},
          mesh: {
            geometry: 'translateWidget',
            material: 'widget',
            visible: false
          }
        });
      },
      'select.select:post!': ([entity]) => {
        if (entity == null) {
          engine.actions.mesh.setVisible(this.widget, false);
          return;
        }
        engine.actions.mesh.setVisible(this.widget, true);
        // Copy location
        engine.actions.transform.setPosition(this.widget,
          entity.transform.position);
      },
      'transform:setPosition:post!': ([entity]) => {
        if (entity.id !== engine.state.global.selected) return;
        engine.actions.transform.setPosition(this.widget,
          entity.transform.position);
      }
    };
  }
}
