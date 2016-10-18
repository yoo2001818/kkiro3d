export default class RendererView {
  constructor(engine, webglue, geometries, shaders, materials, effects) {
    this.webglue = webglue;
    this.engine = engine;
    this.meshes = engine.systems.family.get('mesh', 'transform').entities;
    this.lights = engine.systems.family.get('light', 'transform').entities;
    this.cameras = engine.systems.family.get('camera', 'transform');

    // TODO Users should be able to alter this in the game code - not in
    // initialization code.
    this.geometries = geometries;
    this.shaders = shaders;
    this.materials = materials;
    this.effects = {};
    for (let key in effects) this.effects[key] = effects[key](this);

    this.effectList = [];

    this.viewports = [];

    this.cameras.onAdd.add((camera) => {
      this.viewports.push({
        camera
      });
    });

    // TODO This generates render tree every frame; it can be optimized.
    engine.signals.external.render.post.add(() => this.render());
  }
  setEffects(effectList) {
    this.effectList = effectList.map(v => this.effects[v]);
  }
  render(effects, viewports = this.viewports) {
    let currentEffects = effects || this.effectList;
    const gl = this.webglue.gl;
    // Create world graph first.
    let world = {
      options: {},
      uniforms: {}
    };
    world = currentEffects.reduce((data, v) => {
      if (v.worldPre == null) return data;
      return v.worldPre(data);
    }, world);
    let worldPasses = [world];
    world.passes = this.meshes.map(entity => {
      if (!entity.mesh.visible) return;
      let material = this.materials[entity.mesh.material];
      let shader = this.shaders[material.shader];
      return currentEffects.reduce((data, v) => {
        if (v.mesh == null) return data;
        return v.mesh(data, entity, world, worldPasses);
      }, Object.assign({}, material, {
        shader: shader,
        geometry: this.geometries[entity.mesh.geometry],
        uniforms: Object.assign({}, material.uniforms, {
          uModel: this.engine.systems.matrix.get(entity),
          uNormal: this.engine.systems.matrix.getNormal(entity)
        })
      }));
    });
    this.lights.forEach(entity => currentEffects.forEach(v => {
      if (v.light) v.light(entity, world, worldPasses);
    }));
    currentEffects.forEach(v => {
      if (v.world == null) return;
      return v.world(world, worldPasses);
    });
    // Last, make viewports.
    let cameraMatrix = this.engine.systems.cameraMatrix;
    let viewportPasses = viewports.map((viewport, index) => {
      // TODO Currently, just ignore viewport larger than 1
      if (index >= 1) return null;
      let { camera } = viewport;
      return currentEffects.reduce((data, v) => {
        if (v.viewport == null) return data;
        return v.viewport(data, viewport, index, world, worldPasses);
      }, {
        options: {
          clearColor: '#222222',
          clearDepth: 1,
          cull: gl.BACK,
          depth: gl.LEQUAL,
          viewport: viewport.viewport
        },
        uniforms: {
          uView: cameraMatrix.getView(camera),
          uProjection: cameraMatrix.getProjection.bind(cameraMatrix,
            camera),
          uProjectionView: cameraMatrix.getProjectionView.bind(cameraMatrix,
            camera)
        },
        passes: [worldPasses]
      });
    });
    this.webglue.render(viewportPasses);
  }
}
