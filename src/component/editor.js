import { signalRaw } from 'fudge';

export default {
  actions: {
    selectEntity: function (entity) {
      console.warn('selectEntity action is deprecated');
      this.actions.editor.select('entity', entity ? entity.id : -1);
    },
    select: signalRaw(function ([type, id]) {
      this.state.global.selected = id;
      this.state.global.selectedType = type;
    }),
    cursor: signalRaw(function ([pos]) {
      this.state.global.cursor = pos.slice(0, 3);
    }),
    createEntity: function (_data) {
      let data = _data;
      // JSON uses 'null' even if it should be 'undefined'
      if (data == null) {
        data = {
          transform: {
            position: this.state.global.cursor || [0, 0, 0]
          }
        };
      }
      let entity = this.actions.entity.create(Object.assign({}, data, {
        name: data.name ? data.name : 'New Entity',
        id: null
      }), true);
      this.actions.editor.select('entity', entity.id);
      return entity;
    },
    setRunning: signalRaw(function ([running]) {
      this.state.global.running = running;
    }),
    setType: signalRaw(function ([type]) {
      this.state.global.outlineType = type;
    }),
    load: signalRaw(function ([data]) {
      this.actions.external.stop();
      this.actions.external.load(data);
      this.actions.external.start();
    })
  },
  global: {
    running: true,
    selected: -1,
    selectedType: 'entity',
    outlineType: 'entity',
    cursor: [0, 0, 0],
  }
};
