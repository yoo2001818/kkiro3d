import { vec3, quat } from 'gl-matrix';
import { quatToEuler, eulerToQuat } from 'webglue/lib/util/euler';
import * as bezier from '../util/bezier';
let tmpVec3 = vec3.create();
let tmpQuat = quat.create();
let useEuler = false;
let eulerData = null;

function createSetPosition(system, index) {
  return {
    stride: 1,
    exec: (entity, value) => {
      // Interpolate! Sort of.
      vec3.copy(tmpVec3, entity.transform.position);
      if (tmpVec3[index] === value) return;
      tmpVec3[index] = value;
      system.engine.actions.transform.setPosition(entity, tmpVec3);
    }
  };
}

function createSetScale(system, index) {
  return {
    stride: 1,
    exec: (entity, value) => {
      // Interpolate! Sort of.
      vec3.copy(tmpVec3, entity.transform.scale);
      if (tmpVec3[index] === value) return;
      tmpVec3[index] = value;
      system.engine.actions.transform.setScale(entity, tmpVec3);
    }
  };
}

function createSetRotation(system, index) {
  return {
    stride: 1,
    exec: (entity, value) => {
      quat.copy(tmpQuat, entity.transform.rotation);
      if (tmpQuat[index] === value) return;
      tmpQuat[index] = value;
      system.engine.actions.transform.setRotation(entity, tmpQuat);
    }
  };
}

function createSetEulerRotation(system, index) {
  return {
    stride: 1,
    exec: (entity, value) => {
      // AnimationSystem will handle this :)
      useEuler = true;
      eulerData[index] = value;
    }
  };
}

function createInterpolator(getTime) {
  return (offset, prevInput, prevOutput, input, output) => {
    if (prevInput === input) prevInput = input + 1;
    // INTERPOLATE!!!!
    let time = (offset - prevInput) / (input - prevInput);
    if (offset > input) time = 1;
    time = getTime(time);
    return prevOutput + (output - prevOutput) * time;
  };
}

export default class AnimationSystem {
  constructor() {
    this.hooks = {
      'external.update!': () => {
        this.update();
      }
    };
    // Why can't we generalize it? Because COLLADA format requires
    // 'absolute' position for intangent / outtangent
    this.interpolators = {
      'bezier': (time, xPrev, yPrev, x, y, xOut, yOut, xIn, yIn) => {
        if (x === xPrev) return y;
        // Ugh...
        if (time < xPrev) return yPrev;
        if (time > x) return y;
        return bezier.YfromX(time, xPrev, yPrev, xOut, yOut, xIn, yIn, x, y);
      },
      'linear': createInterpolator(x => x),
      'easeIn': createInterpolator(t => t*t*t),
      'easeOut': createInterpolator(t => (--t)*t*t+1),
      'easeInOut': createInterpolator(t => (t < 0.5) ? 4*t*t*t :
        (t-1) * (2*t-2) * (2*t-2) + 1),
    };
    this.channels = {
      'transform.position.x': createSetPosition(this, 0),
      'transform.position.y': createSetPosition(this, 1),
      'transform.position.z': createSetPosition(this, 2),
      'transform.scale.x': createSetScale(this, 0),
      'transform.scale.y': createSetScale(this, 1),
      'transform.scale.z': createSetScale(this, 2),
      'transform.rotation.x': createSetRotation(this, 0),
      'transform.rotation.y': createSetRotation(this, 1),
      'transform.rotation.z': createSetRotation(this, 2),
      'transform.rotation.w': createSetRotation(this, 3),
      'transform.rotation.eulerX': createSetEulerRotation(this, 0),
      'transform.rotation.eulerY': createSetEulerRotation(this, 1),
      'transform.rotation.eulerZ': createSetEulerRotation(this, 2),
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
      let offset = this.engine.state.global.time - animation.start;
      let loops = offset / animation.duration;
      offset %= animation.duration;
      if (animation.repeat > 0 && loops >= animation.repeat) return;
      // Pre-handle Euler rotation
      // Why do we need this? Because the engine only uses quaternion,
      // we have to convert it to Euler degrees / and convert it back.
      // But doing it for each channel is just bad.
      useEuler = false;
      eulerData = [null, null, null];
      let handleChannel = channel => {
        // TODO Implement interpolator
        // Find first one that is bigger than current offset
        let index = channel.input.findIndex(v => v > offset);
        if (index === -1) index = channel.input.length - 1;
        let prevIndex = index - 1;
        if (prevIndex < 0) prevIndex = 0;
        let interpolator;
        if (channel.interpolation != null) {
          if (Array.isArray(channel.interpolation)) {
            interpolator = this.interpolators[channel.interpolation[prevIndex]];
          } else {
            interpolator = this.interpolators[channel.interpolation];
          }
        }
        if (interpolator == null) interpolator = this.interpolators.linear;
        let channelOp = this.channels[channel.channel];
        if (channelOp == null) return;
        let stride = channelOp.stride;
        // Pull output / inTangent / outTangent (Run for each stride)
        let outArray;
        if (stride === 1) outArray = 0;
        else outArray = new Float32Array(stride);
        for (let i = 0; i < stride; ++i) {
          let idx = index * stride + i;
          let prevIdx = prevIndex * stride + i;
          let input = channel.input[index];
          let prevInput = channel.input[prevIndex];
          let output = channel.output[idx];
          let prevOutput = channel.output[prevIdx];
          // This isn't specified by COLLADA spec...
          // It's like: [1xX 1xY 1yX 1yY 2xX 2xY 2yX 2yY]
          let inX = channel.inTangent && channel.inTangent[idx * 2];
          let inY = channel.inTangent && channel.inTangent[idx * 2 + 1];
          let outX = channel.outTangent && channel.outTangent[prevIdx * 2];
          let outY = channel.outTangent && channel.outTangent[prevIdx * 2 + 1];
          // Interpolate plz
          let value = interpolator(offset, prevInput, prevOutput,
            input, output, outX, outY, inX, inY);
          if (stride === 1) outArray = value;
          else outArray[i] = value;
        }
        channelOp.exec(entity, outArray);
      };
      // Update every channel....
      // If parent is available, use them. :)
      // (Actually parent is just a method to copy animation frames.)
      if (animation.parent) {
        let parentEntity = this.engine.state.entities[animation.parent];
        if (parentEntity != null && parentEntity.animation) {
          parentEntity.animation.channels.forEach(handleChannel);
        }
      }
      if (animation.channels != null) animation.channels.forEach(handleChannel);
      // Now, process the Euler degrees.
      if (useEuler) {
        quatToEuler(tmpVec3, entity.transform.rotation);
        vec3.scale(tmpVec3, tmpVec3, 180 / Math.PI);
        // Apply the set value.
        if (eulerData[0] != null) tmpVec3[0] = eulerData[0];
        if (eulerData[1] != null) tmpVec3[1] = eulerData[1];
        if (eulerData[2] != null) tmpVec3[2] = eulerData[2];
        // Revert it back
        vec3.scale(tmpVec3, tmpVec3, Math.PI / 180);
        eulerToQuat(tmpQuat, tmpVec3);
        this.engine.actions.transform.setRotation(entity, tmpQuat);
      }
    });
  }
}
