export default class RendererSystem {
  constructor(renderer, geometries, shaders, materials) {
    this.renderer = renderer;
    // TODO Users should be able to alter this in the game code - not in
    // initialization code.
    this.geometries = geometries;
    this.shaders = shaders;
    this.materials = materials;
    // TODO This generates render tree every frame; it can be optimized.
    this.hooks = {
      'external.update:post': () => {
        const gl = this.renderer.gl;
        // Create world graph
        let world = {
          uniforms: {
            uDirectionalLight: {
              direction: [-0.590945, 0.216439, -0.777132],
              color: '#ffffff',
              intensity: [0.3, 0.7, 1.0]
            }
          }
        };
        // TODO Lights
        world.passes = this.meshes.map(entity => ({
          shader: this.shaders[this.materials[entity.mesh.material].shader],
          geometry: this.geometries[entity.mesh.geometry],
          uniforms: Object.assign({}, this.materials[entity.mesh.material], {
            uModel: this.engine.systems.matrix.get(entity),
            uNormal: this.engine.systems.matrix.getNormal(entity)
          })
        }));
        // Finally, run that through camera
        let camera = this.cameras[0];
        let cameraMatrix = this.engine.systems.cameraMatrix;
        this.renderer.render({
          options: {
            clearColor: '#222222',
            clearDepth: 1,
            cull: gl.BACK,
            depth: gl.LEQUAL
          },
          uniforms: {
            uView: cameraMatrix.getView(camera),
            uProjection: cameraMatrix.getProjection.bind(cameraMatrix, camera),
            uProjectionView: cameraMatrix.getProjectionView.bind(cameraMatrix,
              camera)
          },
          passes: [world]
        });
      }
    };
  }
  attach(engine) {
    this.engine = engine;
    this.meshes = engine.systems.family.get('mesh', 'transform').entities;
    this.lights = engine.systems.family.get('light', 'transform').entities;
    // TODO What happens if there are more than one camera?
    this.cameras = engine.systems.family.get('camera', 'transform').entities;
  }
}
