import { signalRaw } from 'fudge';

export default {
  actions: {
    selectEntity: signalRaw(function ([entity]) {
      this.state.global.selectedEntity = entity ? entity.id : -1;
    }),
    cursor: signalRaw(function ([pos]) {
      this.state.global.cursor = pos.slice(0, 3);
    }),
    create: function (data) {
      let position = this.state.global.cursor || [0, 0, 0];
      let entity = this.actions.entity.create(Object.assign({}, data, {
        transform: { position },
        name: data.name ? data.name : 'New Entity'
      }), true);
      this.actions.editor.selectEntity(entity);
      return entity;
    },
    setRunning: signalRaw(function ([running]) {
      this.state.global.running = running;
    }),
    setType: signalRaw(function ([type]) {
      this.state.global.selectedType = type;
    })
  },
  global: {
    running: true,
    selectedEntity: -1,
    cursor: [0, 0, 0],
    selectedType: 'entity'
  }
};
