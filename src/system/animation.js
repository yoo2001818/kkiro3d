import { vec3 } from 'gl-matrix';
import * as bezier from '../util/bezier';
let tmpVec3 = vec3.create();

export default class BlenderControllerSystem {
  constructor() {
    this.time = 0;
    this.hooks = {
      'external.update!': ([delta]) => {
        this.time += delta;
        this.update();
      }
    };
    // Why can't we generalize it? Because COLLADA format requires
    // 'absolute' position for intangent / outtangent
    this.interpolators = {
      'bezier': (offset, channel, prevIndex, index) => {
        let x = channel.input[index];
        let y = channel.output[index];
        let xPrev = channel.input[prevIndex];
        let yPrev = channel.output[prevIndex];
        let xIn = channel.inTangent[index * 2];
        let yIn = channel.inTangent[index * 2 + 1];
        let xOut = channel.outTangent[prevIndex * 2];
        let yOut = channel.outTangent[prevIndex * 2 + 1];
        if (x === xPrev) return y;
        // Ugh...
        let time = offset;
        if (time < xPrev) return yPrev;
        if (time > x) time = x;
        return bezier.YfromX(time, xPrev, yPrev, xOut, yOut, xIn, yIn, x, y);
      },
      'linear': (offset, channel, prevIndex, index) => {
        let input = channel.input[index];
        let prevInput = channel.input[prevIndex];
        let output = channel.output[index];
        let prevOutput = channel.output[prevIndex];
        if (prevInput === input) prevInput = input + 1;
        // INTERPOLATE!!!!
        let time = (offset - prevInput) / (input - prevInput);
        if (offset > input) time = 1;
        return prevOutput + (output - prevOutput) * time;
      }
    };
    this.channels = {
      'transform.position.x': (entity, value) => {
        // Interpolate! Sort of.
        vec3.copy(tmpVec3, entity.transform.position);
        tmpVec3[0] = value;
        this.engine.actions.transform.setPosition(entity, tmpVec3);
      }
    };
  }
  attach(engine) {
    this.engine = engine;
    this.family = engine.systems.family.get('animation');
  }
  update() {
    // Update all entities :(
    this.family.entities.forEach(entity => {
      let animation = entity.animation;
      if (animation == null || !animation.playing) return;
      let offset = this.time - animation.start;
      let loops = offset / animation.duration;
      offset %= animation.duration;
      if (animation.repeat > 0 && loops >= animation.repeat) return;
      // Update every channel....
      animation.channels.forEach(channel => {
        // TODO Implement interpolator
        // Find first one that is bigger than current offset
        let index = channel.input.findIndex(v => v > offset);
        if (index === -1) index = channel.input.length - 1;
        let prevIndex = index - 1;
        if (prevIndex < 0) prevIndex = 0;
        let interpolator = this.interpolators[channel.interpolation[prevIndex]];
        if (interpolator == null) interpolator = this.interpolators.linear;
        this.channels[channel.channel](entity,
          interpolator(offset, channel, prevIndex, index));
      });
    });
  }
}
