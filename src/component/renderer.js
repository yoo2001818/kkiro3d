import { signalRaw } from 'fudge';
import merge from 'lodash.merge';

export default {
  actions: {
    material: {
      add: signalRaw(function ([name, material]) {
        this.systems.renderer.addMaterial(name, material);
      }),
      update: signalRaw(function ([name, material]) {
        merge(this.systems.renderer.materials[name], material);
      }),
      remove: signalRaw(function ([name]) {
        // We just delete them :P
        delete this.systems.renderer.materials[name];
      })
    },
    texture: {
      add: signalRaw(function ([name, texture]) {
        this.systems.renderer.addTexture(name, texture);
      }),
      remove: signalRaw(function ([name]) {
        this.systems.renderer.textures[name].dispose();
        delete this.systems.renderer.textures[name];
      })
    },
    shader: {
      add: signalRaw(function ([name, shader]) {
        this.systems.renderer.addShader(name, shader);
      }),
      remove: signalRaw(function ([name]) {
        this.systems.renderer.shaders[name].dispose();
        delete this.systems.renderer.shaders[name];
      })
    },
    geometry: {
      add: signalRaw(function ([name, geometry]) {
        this.systems.renderer.addGeometry(name, geometry);
      }),
      update: signalRaw(function ([name, geometry]) {
        this.systems.renderer.geometries[name].update(geometry);
      }),
      remove: signalRaw(function ([name]) {
        this.systems.renderer.geometries[name].dispose();
        delete this.systems.renderer.geometries[name];
      })
    },
    effect: {
      set: signalRaw(function ([list]) {
        this.systems.renderer.effects = list;
      })
    }
  }
};
