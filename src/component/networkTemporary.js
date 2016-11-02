import { signalRaw } from 'fudge';

export default {
  // It means that the entity should be cleaned up if the owner is not present.
  // (For cameras)
  component: {
    owner: -1
  },
  schema: {
    owner: {
      type: 'integer'
    }
  },
  actions: {
    set: signalRaw(([entity, data]) => {
      // I'm being lazy (again)
      Object.assign(entity.networkTemporary, data);
    })
  }
};
