import { signalRaw } from 'fudge';

export default {
  // It means that the entity should be cleaned up after reloading.
  // (For cameras)
  component: {
    cleanUp: true
  },
  schema: {
    cleanUp: 'checkbox'
  },
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
      let entity = this.actions.entity.create(Object.assign({}, data, {
        name: data.name ? data.name : 'New Entity',
        id: null
      }), true);
      this.actions.editor.select(clientId, 'entity', entity.id);
      return entity;
    },
    setType: signalRaw(function ([clientId, type]) {
      this.systems.editor.get(clientId).outlineType = type;
    }),
    load: signalRaw(function ([data]) {
      this.actions.external.stop();
      this.actions.external.load(data);
      this.actions.external.start();
    })
  },
  global: {
    selected: -1,
    selectedType: 'entity',
    outlineType: 'entity',
    cursor: [0, 0, 0],
  }
};
