import { vec3, quat } from 'gl-matrix';
import { quatToEuler, eulerToQuat } from 'webglue/lib/util/euler';
import * as bezier from '../util/bezier';
let tmpVec3 = vec3.create();
let tmpQuat = quat.create();
let useEuler = false;
let eulerData = null;

function createSetPosition(system, index) {
  return (entity, value) => {
    // Interpolate! Sort of.
    vec3.copy(tmpVec3, entity.transform.position);
    if (tmpVec3[index] === value) return;
    tmpVec3[index] = value;
    system.engine.actions.transform.setPosition(entity, tmpVec3);
  };
}

function createSetScale(system, index) {
  return (entity, value) => {
    // Interpolate! Sort of.
    vec3.copy(tmpVec3, entity.transform.scale);
    if (tmpVec3[index] === value) return;
    tmpVec3[index] = value;
    system.engine.actions.transform.setScale(entity, tmpVec3);
  };
}

function createSetRotation(system, index) {
  return (entity, value) => {
    quat.copy(tmpQuat, entity.transform.rotation);
    if (tmpQuat[index] === value) return;
    tmpQuat[index] = value;
    system.engine.actions.transform.setRotation(entity, tmpQuat);
  };
}

function createSetEulerRotation(system, index) {
  return (entity, value) => {
    // AnimationSystem will handle this :)
    useEuler = true;
    eulerData[index] = value;
  };
}

export default class AnimationSystem {
  constructor() {
    this.time = 0;
    this.hooks = {
      'external.load!': () => {
        this.time = 0;
      },
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
        if (time > x) return y;
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
      let offset = this.time - animation.start;
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
        let interpolator = this.interpolators[channel.interpolation[prevIndex]];
        if (interpolator == null) interpolator = this.interpolators.linear;
        this.channels[channel.channel](entity,
          interpolator(offset, channel, prevIndex, index));
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
