// Manages resources for the renderer.
// It's not engine's job, however, engine needs to assign new material or
// shaders, etc. to do its job. (Skeletal animation, recoloring, etc)
// NOTE: This doesn't actually do rendering - that's RendererView's job.
// If renderer is not provided, this will run as no-op mode for server
// compatibility.
// This accepts initial scene graph (of course, it can be loaded later)
// and translates it to webglue objects. (uploads to GPU)
// However, it can be optimized to lazily load them.
// Initial state is only stored for materials - other objects only remain as
// webglue form. (It's really hard to serialize them anyway)
// It may be possible to run GPGPU through this, however it's not recommended
// as it'll be impossible to run the game from Node.js environment.
//
// This shouldn't be included in default system list - it needs to be populated
// with renderer and initial data.
function forEachObject(obj, callback) {
  if (obj == null) return;
  for (let key in obj) {
    callback(key, obj[key]);
  }
}
export default class RendererSystem {
  constructor(renderer, initialData, effectList) {
    this.renderer = renderer;

    this.geometries = {};
    this.materials = {};
    this.shaders = {};
    this.textures = {};

    this.effectList = effectList;
    this.viewportList = [];

    this.loadData(initialData);
  }
  attach(engine) {
    this.engine = engine;

    this.cameras = engine.systems.family.get('camera', 'transform');
    this.cameras.onAdd.add((camera) => {
      if (this.viewportList.length >= 1) return;
      this.viewportList.push({
        camera
      });
    });
  }
  loadData(data) {
    // This looks odd..
    forEachObject(data.geometries, this.addGeometry.bind(this));
    forEachObject(data.materials, this.addMaterial.bind(this));
    forEachObject(data.shaders, this.addShader.bind(this));
    forEachObject(data.textures, this.addTexture.bind(this));
  }
  addGeometry(name, geometry) {
    this.geometries[name] = this.renderer.webglue.geometries.create(geometry);
  }
  addMaterial(name, material) {
    this.materials[name] = material;
  }
  addShader(name, shader) {
    this.shaders[name] = this.renderer.webglue.shaders.create(
      shader.vert, shader.frag
    );
  }
  addTexture(name, texture) {
    this.textures[name] = this.renderer.webglue.textures.create(
      texture.source, texture);
  }
}
