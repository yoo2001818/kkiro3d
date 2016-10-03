export default class RendererSystem {
  constructor(renderer, geometries, shaders, materials) {
    this.renderer = renderer;
    // TODO Users should be able to alter this in the game code - not in
    // initialization code.
    this.geometries = geometries;
    this.shaders = shaders;
    this.materials = materials;

    this.viewports = [];

    this.handlers = {
      // For special meshes.
      mesh: [],
      // For uniforms / shadow, etc.
      light: [],
      // For post processing, etc.
      world: [],
      // For camera setting, etc.
      viewport: []
    };

    // TODO This generates render tree every frame; it can be optimized.
    this.hooks = {
      'external.update:post': () => {
        this.render();
      }
    };
  }
  render(handlers = {}, viewports = this.viewports) {
    let lightHandlers = handlers.light || this.handlers.light;
    let meshHandlers = handlers.mesh || this.handlers.mesh;
    let worldHandlers = handlers.world || this.handlers.world;
    let viewportHandlers = handlers.viewport || this.handlers.viewport;
    const gl = this.renderer.gl;
    // Create world graph first.
    let world = {
      uniforms: {
        uDirectionalLight: {
          direction: [-0.590945, 0.216439, 0.777132],
          color: '#ffffff',
          intensity: [0.3, 0.7, 1.0]
        },
        uPointLight: [{}]
      }
    };
    let worldPasses = [world];
    this.lights.forEach(entity => lightHandlers.forEach(v => {
      world = v(entity, world, worldPasses);
    }));
    world.passes = this.meshes.map(entity => {
      let material = this.materials[entity.mesh.material];
      let shader = this.shaders[material.shader];
      return meshHandlers.reduce((data, v) => {
        return v(data, entity, world, worldPasses);
      }, Object.assign({}, material, {
        shader: shader,
        geometry: this.geometries[entity.mesh.geometry],
        uniforms: Object.assign({}, material.uniforms, {
          uModel: this.engine.systems.matrix.get(entity),
          uNormal: this.engine.systems.matrix.getNormal(entity)
        })
      }));
    });
    world = worldHandlers.reduce((data, v) => {
      return v(data, worldPasses);
    }, world);
    // Last, make viewports.
    let cameraMatrix = this.engine.systems.cameraMatrix;
    let viewportPasses = viewports.map((viewport, index) => {
      // TODO Currently, just ignore viewport larger than 1
      if (index >= 1) return null;
      let { camera } = viewport;
      return viewportHandlers.reduce((data, v) => {
        return v(data, viewport, index, world, worldPasses);
      }, {
        options: {
          clearColor: new Float32Array([0, 0, 0, 1]),
          clearDepth: 1,
          cull: gl.BACK,
          depth: gl.LEQUAL
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
    this.renderer.render(viewportPasses);
  }
  attach(engine) {
    this.engine = engine;
    this.meshes = engine.systems.family.get('mesh', 'transform').entities;
    this.lights = engine.systems.family.get('light', 'transform').entities;
    this.cameras = engine.systems.family.get('camera', 'transform');

    this.cameras.onAdd.add((camera) => {
      this.viewports.push({
        camera
      });
    });
  }
}
