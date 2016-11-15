import { vec3, quat } from 'gl-matrix';
import { quatToEuler, eulerToQuat } from 'webglue/lib/util/euler';
import * as bezier from '../util/bezier';
let tmpVec3 = vec3.create();
let tmpQuat = quat.create();
let useEuler = false;
let eulerData = null;

function lerp(a, b, t) {
  return a + t * (b - a);
}

function createSetPosition(system, index) {
  return {
    stride: 1,
    exec: (entity, a, b, t) => {
      // Interpolate! Sort of.
      vec3.copy(tmpVec3, entity.transform.position);
      let value = lerp(a, b, t);
      if (tmpVec3[index] === value) return;
      tmpVec3[index] = value;
      system.engine.actions.transform.setPosition(entity, tmpVec3);
    }
  };
}

function createSetScale(system, index) {
  return {
    stride: 1,
    exec: (entity, a, b, t) => {
      // Interpolate! Sort of.
      vec3.copy(tmpVec3, entity.transform.scale);
      let value = lerp(a, b, t);
      if (tmpVec3[index] === value) return;
      tmpVec3[index] = value;
      system.engine.actions.transform.setScale(entity, tmpVec3);
    }
  };
}

function createSetRotation(system, index) {
  return {
    stride: 1,
    exec: (entity, a, b, t) => {
      quat.copy(tmpQuat, entity.transform.rotation);
      let value = lerp(a, b, t);
      if (tmpQuat[index] === value) return;
      tmpQuat[index] = value;
      system.engine.actions.transform.setRotation(entity, tmpQuat);
    }
  };
}

function createSetEulerRotation(system, index) {
  return {
    stride: 1,
    exec: (entity, a, b, t) => {
      let value = lerp(a, b, t);
      // AnimationSystem will handle this :)
      useEuler = true;
      eulerData[index] = value;
    }
  };
}

export default class AnimationSystem {
  constructor() {
    this.hooks = {
      'external.update!': () => {
        this.update();
      }
    };
    this.interpolators = {
      'bezier': (time, xOut, yOut, xIn, yIn) => {
        return bezier.YfromX(time, 0, 0, xOut, yOut, xIn, yIn, 1, 1);
      },
      'linear': x => x,
      'easeIn': t => t*t*t,
      'easeOut': t => (--t)*t*t+1,
      'easeInOut': t => (t < 0.5) ? 4*t*t*t :
        (t-1) * (2*t-2) * (2*t-2) + 1,
    };
    this.channels = {
      'transform.position.x': createSetPosition(this, 0),
      'transform.position.y': createSetPosition(this, 1),
      'transform.position.z': createSetPosition(this, 2),
      'transform.position': {
        stride: 3,
        exec: (entity, a, b, t) => {
          vec3.lerp(tmpVec3, a, b, t);
          this.engine.actions.transform.setPosition(entity, tmpVec3);
        }
      },
      'transform.scale.x': createSetScale(this, 0),
      'transform.scale.y': createSetScale(this, 1),
      'transform.scale.z': createSetScale(this, 2),
      'transform.scale': {
        stride: 3,
        exec: (entity, a, b, t) => {
          vec3.lerp(tmpVec3, a, b, t);
          this.engine.actions.transform.setScale(entity, tmpVec3);
        }
      },
      'transform.rotation.x': createSetRotation(this, 0),
      'transform.rotation.y': createSetRotation(this, 1),
      'transform.rotation.z': createSetRotation(this, 2),
      'transform.rotation.w': createSetRotation(this, 3),
      'transform.rotation': {
        stride: 4,
        exec: (entity, a, b, t) => {
          quat.slerp(tmpQuat, a, b, t);
          this.engine.actions.transform.setRotation(entity, tmpQuat);
        }
      },
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
        if (channelOp == null) {
          // Draw channel operator from component library
          let pos = channel.channel.indexOf('.');
          let name = channel.channel.slice(0, pos);
          let data = channel.channel.slice(pos + 1);
          // Get component metadata
          let metadata = this.engine.components.store[name];
          if (metadata == null) return;
          if (metadata.data == null) return;
          if (metadata.data.channels == null) return;
          channelOp = metadata.data.channels[data];
          if (channelOp == null) return;
          // Store it back to system specific library
          this.channels[channel.channel] = channelOp;
        }
        let stride = channelOp.stride;
        // Pull time value
        // TODO: inTangent / outTangent should be processed per-index
        let input = channel.input[index];
        let prevInput = channel.input[prevIndex];
        let idx = index * stride;
        let prevIdx = prevIndex * stride;
        let xDiff = input - prevInput;
        let inX, inY, outX, outY;
        if (interpolator === this.interpolators.bezier) {
          inX = channel.inTangent && channel.inTangent[idx * 2];
          inY = channel.inTangent && channel.inTangent[idx * 2 + 1];
          outX = channel.outTangent && channel.outTangent[prevIdx * 2];
          outY = channel.outTangent && channel.outTangent[prevIdx * 2 + 1];
          let output = channel.output[idx];
          let prevOutput = channel.output[prevIdx];
          let yDiff = output - prevOutput;
          inX = (inX - prevInput) / xDiff;
          outX = (outX - prevInput) / xDiff;
          inY = (inY - prevOutput) / yDiff;
          outY = (outY - prevOutput) / yDiff;
        }
        let value;
        if (xDiff !== 0 && offset < input) {
          let time = (offset - prevInput) / xDiff;
          value = interpolator(time, outX, outY, inX, inY);
        } else {
          value = 1;
        }
        if (stride !== 1) {
          let prev = channel.output.slice(prevIndex * stride, index * stride);
          let current = channel.output.slice(index * stride,
            index * stride + stride);
          channelOp.exec.call(this.engine, entity, prev, current, value);
        } else {
          channelOp.exec.call(this.engine, entity, channel.output[prevIndex],
            channel.output[index], value);
        }
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
