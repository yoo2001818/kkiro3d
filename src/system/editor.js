export default class EditorSystem {
  constructor() {
    this.hooks = {
      'network.connect:post!': ([id]) => {
        // Fill up default data.
        let data = this.get(id);
        if (data.type !== 'editor') return;
        Object.assign(data, {
          camera: -1, // :S
          selected: -1,
          selectedType: 'entity',
          outlineType: 'entity',
          cursor: [0, 0, 0],
          open: []
        });
        // Create a camera for the client
        let camera = this.engine.systems.network.find(id, 'editor');
        if (camera == null) {
          camera = this.engine.actions.entity.create({
            name: 'Editor Camera',
            transform: {
              position: [0, 0, 5]
            },
            camera: {},
            blenderController: {},
            networkTemporary: {
              owner: id,
              type: 'editor'
            }
          });
        }
        this.engine.actions.editor.setCamera(id, camera);
      },
      'external.start:post@200!': ([isGlobal]) => {
        if (!isGlobal) return;
        this.engine.systems.network.clients.forEach(id => {
          if (this.get(id).type !== 'editor') return;
          let camera = this.engine.systems.network.find(id, 'editor');
          if (camera == null) {
            camera = this.engine.actions.entity.create({
              name: 'Editor Camera',
              transform: {
                position: [0, 0, 5]
              },
              camera: {},
              blenderController: {},
              networkTemporary: {
                owner: id,
                type: 'editor'
              }
            });
          }
          this.engine.actions.editor.setCamera(id, camera);
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
  isSelected(entity) {
    let selfData = this.getSelf();
    return selfData.selectedType === 'entity' &&
      entity.id === selfData.selected;
  }
  isSelectedAll(entity) {
    let notSelected = this.engine.systems.network.clients.every(id => {
      let data = this.get(id);
      return data.selected !== entity.id;
    });
    return !notSelected;
  }
  isCamera(entity) {
    let notCamera = this.engine.systems.network.clients.every(id => {
      let data = this.get(id);
      return data.camera !== entity.id;
    });
    return !notCamera;
  }
}
