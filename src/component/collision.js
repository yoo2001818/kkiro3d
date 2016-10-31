import { signalRaw } from 'fudge';

export default {
  component: {
    enabled: true,
    type: 'aabb',
    center: [0, 0, 0],
    size: [1, 1, 1]
  },
  schema: {
    enabled: { type: 'checkbox' },
    type: {
      type: 'select',
      options: [
        {value: 'aabb', label: 'AABB'}
      ]
    },
    center: { type: 'vector' },
    size: { type: 'vector' }
  },
  actions: {
    set: signalRaw(([entity, data]) => {
      Object.assign(entity.collision, data);
    }),
    // [self, other, bound]
    collide: signalRaw(() => {})
  }
};
