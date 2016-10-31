import { signalRaw } from 'fudge';

export default {
  component: -1,
  schema: {
    parent: {
      type: 'entity',
      getValue: (entity) => entity.parent,
      setValue: (entity, value) => ['parent.set', entity, value]
    },
  },
  actions: {
    set: signalRaw(([entity, parent]) => {
      entity.parent = (parent != null && parent.id != null) ?
        parent.id : parent;
    })
  }
};
