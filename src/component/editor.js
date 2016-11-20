import { signalRaw } from 'fudge';

export default {
  actions: {
    select: signalRaw(function ([clientId, type, id]) {
      let state = this.systems.editor.get(clientId);
      state.selected = id;
      state.selectedType = type;
    }),
    cursor: signalRaw(function ([clientId, pos]) {
      let state = this.systems.editor.get(clientId);
      state.cursor = pos.slice(0, 3);
    }),
    createEntity: function (clientId, _data) {
      let state = this.systems.editor.get(clientId);
      let data = _data;
      // JSON uses 'null' even if it should be 'undefined'
      if (data == null) {
        data = {
          transform: {
            position: state.cursor || [0, 0, 0]
          }
        };
      }
      let entity;
      if (Array.isArray(data)) {
        entity = this.actions.parent.createHierarchy(data);
      } else {
        entity = this.actions.entity.create(Object.assign({}, data, {
          name: data.name ? data.name : 'New Entity',
          id: null
        }), true);
      }
      this.actions.editor.select(clientId, 'entity', entity.id);
      return entity;
    },
    setType: signalRaw(function ([clientId, type]) {
      this.systems.editor.get(clientId).outlineType = type;
    }),
    setCamera: signalRaw(function ([clientId, camera]) {
      this.systems.editor.get(clientId).camera = camera.id;
      if (this.systems.editor.getId() === clientId) {
        this.actions.renderer.camera.set(camera);
      }
    }),
    setOpen: signalRaw(function ([clientId, id, toggle]) {
      // What
      this.systems.editor.get(clientId).open[id] = toggle;
    }),
    load: signalRaw(function ([data]) {
      this.actions.external.stop(true);
      this.actions.external.load(data);
      this.actions.external.start(true);
    })
  }
};
