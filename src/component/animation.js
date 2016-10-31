import { signalRaw } from 'fudge';

// Kinda follows COLLADA format
// Each channel:
/* var schema = {
  channel: 'position.x',
  input: [0, 1],
  interpolation: ['bezier', 'bezier'],
  intangent: [0, 0, 1, 1],
  outtangent: [0, 0, 1, 1],
  output: [0, 1]
}; */

export default {
  component: {
    playing: false,
    start: 0,
    repeat: 0,
    duration: 0,
    channels: []
  },
  schema: {
    playing: {
      type: 'checkbox'
    },
    start: {
      type: 'number'
    },
    repeat: {
      type: 'number'
    },
    duration: {
      type: 'number'
    }
  },
  actions: {
    set: signalRaw(([entity, data]) => {
      Object.assign(entity.animation, data);
    }),
    add: signalRaw(([entity, channel]) => {
      entity.animation.channels.push(channel);
    }),
    remove: signalRaw(([entity, index]) => {
      entity.animation.channels.splice(index, 1);
    }),
    start: signalRaw(function ([entity, repeat]) {
      entity.animation.playing = true;
      entity.animation.start = this.systems.animation.time;
      entity.animation.repeat = repeat;
    }),
    stop: signalRaw(function ([entity]) {
      entity.animation.playing = false;
    })

  }
};
