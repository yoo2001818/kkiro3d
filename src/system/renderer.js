export default class RendererSystem {
  constructor(renderer, geometries, shaders, materials) {
    this.renderer = renderer;
    // TODO Users should be able to alter this in the game code - not in
    // initialization code.
    this.geometries = geometries;
    this.shaders = shaders;
    this.materials = materials;

    // TODO This is supported, but currently it's fixed to primary camera -
    // because there's no method to set camera at the moment.
    this.viewports = [];

    // For special meshes.
    this.meshHandlers = [];
    // For uniforms / shadow, etc.
    this.lightHandlers = [];
    // For post processing, etc.
    this.worldHandlers = [];
    // For camera setting, etc.
    this.viewportHandlers = [];

    // TODO This generates render tree every frame; it can be optimized.
    this.hooks = {
      'external.update:post': () => {
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
        this.lights.forEach(entity => this.lightHandlers.forEach(v => {
          world = v(entity, world, worldPasses);
        }));
        world.passes = this.meshes.map(entity => {
          let material = this.materials[entity.mesh.material];
          let shader = this.shaders[material.shader];
          return this.meshHandlers.reduce((data, v) => {
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
        world = this.worldHandlers.reduce((data, v) => {
          return v(data, worldPasses);
        }, world);
        // Last, make viewports.
        let cameraMatrix = this.engine.systems.cameraMatrix;
        let viewportPasses = this.viewports.map((viewport, index) => {
          let { camera } = viewport;
          return this.viewportHandlers.reduce((data, v) => {
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
    };
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
