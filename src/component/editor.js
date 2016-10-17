import { signalRaw } from 'fudge';

export default {
  actions: {
    select: signalRaw(function ([entity]) {
      this.state.global.selected = entity ? entity.id : -1;
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
      this.actions.editor.select(entity);
      return entity;
    }
  },
  global: {
    running: true
  }
};
