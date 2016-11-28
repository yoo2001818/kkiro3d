import { signalRaw } from 'fudge';

export default {
  // It means that the entity should be cleaned up if the owner is not present.
  // (For cameras)
  component: {
    owner: -1,
    type: ''
  },
  schema: {
    owner: {
      type: 'rawString',
      readOnly: true
    },
    type: {
      type: 'string'
    }
  },
  actions: {
    set: signalRaw(([entity, data]) => {
      // I'm being lazy (again)
      Object.assign(entity.networkTemporary, data);
    })
  }
};
