export default class RendererView {
  constructor(engine, webglue, effects) {
    this.webglue = webglue;
    this.engine = engine;

    this.effects = {};
    for (let key in effects) this.effects[key] = effects[key](this);

    webglue.shaders.governors.eqLength = {
      checker: (shader, current) =>
        shader === (current == null ? 0 : current.length),
      allocator: current => current == null ? 0 : current.length
    };

    // TODO This generates render tree every frame; it can be optimized.
    engine.signals.external.render.post.add(() => this.render());
  }
  getSystem() {
    return this.engine.systems.renderer;
  }
  render(effects, viewports = this.engine.systems.renderer.viewportList) {
    let rendererSystem = this.engine.systems.renderer;
    let currentEffects = (effects || rendererSystem.effectList)
      .map(v => this.effects[v]);
    const gl = this.webglue.gl;
    // First, init world graph.
    let world = {
      options: {},
      uniforms: {}
    };
    let worldPasses = [world];
    // Then, create viewports.
    let cameraMatrix = this.engine.systems.cameraMatrix;
    let viewportPasses = viewports.map((viewport, index) => {
      let { camera } = viewport;
      return currentEffects.reduce((data, v) => {
        if (v.viewport == null) return data;
        return v.viewport(data, viewport, index, world, worldPasses);
      }, {
        options: {
          clearColor: '#333333',
          clearDepth: 1,
          cull: gl.BACK,
          depth: gl.LEQUAL,
          viewport: viewport.viewport,
          camera: camera
        },
        uniforms: {
          uView: cameraMatrix.getView(camera),
          uProjection: camera.camera.aspect === 0 ?
            cameraMatrix.getProjection.bind(cameraMatrix, camera) :
            cameraMatrix.getProjection(camera, camera.camera.aspect),
          uProjectionView: camera.camera.aspect === 0 ?
            cameraMatrix.getProjectionView.bind(cameraMatrix, camera) :
            cameraMatrix.getProjectionView(camera, camera.camera.aspect)
        },
        passes: worldPasses
      });
    });
    // Then.... populate the world data.
    world = currentEffects.reduce((data, v) => {
      if (v.worldPre == null) return data;
      return v.worldPre(data);
    }, world);
    world.passes = this.engine.state.entities.map(entity => {
      if (entity == null) return null;
      return currentEffects.reduce((data, v) => {
        if (v.entity == null) return data;
        return v.entity(data, entity, world, {
          world: worldPasses,
          viewport: viewportPasses
        });
      }, null);
    }).filter(v => v != null);
    currentEffects.forEach(v => {
      if (v.world == null) return;
      return v.world(world, {
        world: worldPasses,
        viewport: viewportPasses
      });
    });
    this.webglue.render({
      textureHandler: (texture) => {
        if (texture == null) return false;
        if (typeof texture === 'string') {
          let textureObj = this.getSystem().textures[texture];
          return textureObj != null ? textureObj : false;
        }
        return texture;
      },
      passes: viewportPasses
    });
  }
}
