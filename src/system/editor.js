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
        // TODO If target client is not editor, we shouldn't do this
        // Create a camera for the client
        let camera;
        let family = this.engine.systems.family.get(
          'camera', 'networkTemporary');
        family.entities.forEach(entity => {
          let owner = entity.networkTemporary.owner;
          if (id === owner) camera = entity;
        });
        if (camera == null) {
          camera = this.engine.actions.entity.create({
            name: 'Editor Camera',
            transform: {
              position: [0, 0, 5]
            },
            camera: {},
            blenderController: {},
            networkTemporary: {
              owner: id
            }
          });
        }
        this.engine.actions.editor.setCamera(id, camera);
      },
      'entity.delete:pre!': (args) => {
        // Prevent camera deletion if being used
        let entity = args[0];
        if (entity == null) return args;
        if (this.isCamera(entity)) return null;
        return args;
      },
      'external.start:post@200!': ([isGlobal]) => {
        if (!isGlobal) return;
        // Everybody gets a camera if the player doesn't have one.
        let checkArr = [];
        let family = this.engine.systems.family.get(
          'camera', 'networkTemporary');
        family.entities.forEach(entity => {
          let owner = entity.networkTemporary.owner;
          checkArr[owner] = entity;
        });
        this.engine.systems.network.clients.forEach(id => {
          let camera;
          if (checkArr[id] == null) {
            camera = this.engine.actions.entity.create({
              name: 'Editor Camera',
              transform: {
                position: [0, 0, 5]
              },
              camera: {},
              blenderController: {},
              networkTemporary: {
                owner: id
              }
            });
          } else {
            camera = checkArr[id];
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
