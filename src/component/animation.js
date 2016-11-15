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
      type: 'integer'
    },
    duration: {
      type: 'number'
    },
    parent: {
      type: 'entity'
    },
    channels: {
      type: 'json',
      noField: true
    }
  },
  actions: {
    set: signalRaw(([entity, data]) => {
      Object.assign(entity.animation, data);
    }),
    add: signalRaw(([entity, channel]) => {
      // Override channel with matching name
      let channels = entity.animation.channels;
      let index = channels.findIndex(v => v.channel === channel.channel);
      if (index !== -1) {
        channels[index] = channel;
      } else {
        channels.push(channel);
      }
    }),
    remove: signalRaw(([entity, index]) => {
      entity.animation.channels.splice(index, 1);
    }),
    clear: signalRaw(([entity]) => {
      entity.animation.channels = [];
    }),
    start: signalRaw(function ([entity, duration, repeat]) {
      entity.animation.playing = true;
      entity.animation.duration = duration;
      entity.animation.start = this.state.global.time;
      entity.animation.repeat = repeat;
    }),
    stop: signalRaw(function ([entity]) {
      entity.animation.playing = false;
    })

  }
};
