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
        // Forcefully set the camera if it is joining client.
        if (id === this.getId()) {
          this.engine.actions.renderer.camera.set(camera);
        }
      },
      'external.start:post@200!': ([isGlobal]) => {
        if (!isGlobal) return;
        // Everybody gets a camera if the player doesn't have one.
        let checkArr = [];
        let family = this.engine.systems.family.get(
          'camera', 'networkTemporary');
        family.entities.forEach(entity => {
          let owner = entity.networkTemporary.owner;
          checkArr[owner] = true;
          if (this.getId() === owner) {
            this.engine.actions.renderer.camera.set(entity);
          }
        });
        this.engine.systems.network.clients.forEach(id => {
          if (!checkArr[id]) {
            let camera = this.engine.actions.entity.create({
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
            if (id === this.getId()) {
              this.engine.actions.renderer.camera.set(camera);
            }
          }
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
