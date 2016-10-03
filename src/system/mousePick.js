export default class MousePickSystem {
  constructor() {
    this.pickTexture = null;
    this.selected = 0;
  }
  attach(engine) {
    this.engine = engine;
    // Let's attach mesh handler..
    let renderer = engine.systems.renderer;
    let webglue = renderer.renderer;
    let gl = renderer.renderer.gl;
    renderer.handlers.mesh.push((data, entity) => {
      if (entity.id !== this.selected) return data;
      return [Object.assign({}, data, {
        options: {
          cull: gl.FRONT,
          depthMask: true
        },
        uniforms: Object.assign({}, data.uniforms, {
          uBias: [0.1, 0],
          uColor: '#ffffff'
        }),
        shader: renderer.shaders['border']
      }), data];
    });
    // Create mouse pick framebuffer and shader
    this.pickShader = webglue.shaders.create(
      require('../shader/minimal.vert'),
      require('../shader/monoColor.frag')
    );
    this.pickTexture = webglue.textures.create(null, {
      format: gl.RGBA
    });
    this.pickFramebuffer = webglue.framebuffers.create({
      color: this.pickTexture,
      depth: gl.DEPTH_COMPONENT16 // Automatically use renderbuffer
    });

  }
  pick(x, y) {

  }
}
