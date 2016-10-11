import { signalRaw } from 'fudge';

export default {
  component: 'Entity',
  actions: {
    set: signalRaw(([entity, value]) => {
      entity.name = value;
    })
  }
};
