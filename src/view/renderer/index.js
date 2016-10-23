export default class RendererView {
  constructor(engine, webglue, effects) {
    this.webglue = webglue;
    this.engine = engine;
    this.entities = engine.systems.family.get('transform').entities;
    this.cameras = engine.systems.family.get('camera', 'transform');

    this.effects = {};
    for (let key in effects) this.effects[key] = effects[key](this);
    this.viewports = [];

    this.cameras.onAdd.add((camera) => {
      this.viewports.push({
        camera
      });
    });

    // TODO This generates render tree every frame; it can be optimized.
    engine.signals.external.render.post.add(() => this.render());
  }
  getSystem() {
    return this.engine.systems.renderer;
  }
  render(effects, viewports = this.viewports) {
    let rendererSystem = this.engine.systems.renderer;
    let currentEffects = (effects || rendererSystem.effectList)
      .map(v => this.effects[v]);
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
    world.passes = this.entities.map(entity => {
      return currentEffects.reduce((data, v) => {
        if (v.entity == null) return data;
        return v.entity(data, entity, world, worldPasses);
      }, null);
    }).filter(v => v != null);
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
          clearColor: '#333333',
          clearDepth: 1,
          cull: gl.BACK,
          depth: gl.LEQUAL,
          viewport: viewport.viewport,
          camera: camera
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
