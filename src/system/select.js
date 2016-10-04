import wireframe from 'webglue/lib/geom/wireframe';

function packColor(id) {
  // Get R, G, B, A (using little endian)
  // Why do we use Float32Array? Because it's OpenGL.
  let output = new Float32Array(4);
  output[0] = (id & 0xFF) / 256;
  output[1] = ((id >>> 8) & 0xFF) / 256;
  output[2] = ((id >>> 16) & 0xFF) / 256;
  output[3] = ((id >>> 24) & 0xFF) / 256;
  return output;
}

function unpackColor(data) {
  let output = 0;
  output |= data[0];
  output |= data[1] << 8;
  output |= data[2] << 16;
  output |= data[3] << 24;
  return output;
}

export default class SelectSystem {
  constructor() {
  }
  attach(engine) {
    this.engine = engine;
    // Let's attach mesh handler..
    let renderer = engine.systems.renderer;
    if (renderer) {
      let webglue = renderer.renderer;
      let gl = webglue.gl;
      renderer.handlers.mesh.push((data, entity) => {
        if (entity.id !== this.getId()) return data;
        let geomName = entity.mesh.geometry;
        let geometry = this.wireframeGeoms[geomName];
        if (geometry == null) {
          geometry = this.wireframeGeoms[geomName] =
            webglue.geometries.create(wireframe(renderer.geometries[geomName]));
        }
        return Object.assign(data, {
          passes: [{
            uniforms: Object.assign({}, data.uniforms, {
              uColor: '#ffa400'
            }),
            shader: renderer.shaders['border'],
            geometry: geometry
          }, {}]
        });
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
      this.wireframeGeoms = {};
    }
  }
  getId() {
    return this.engine.state.global.selected;
  }
  get() {
    return this.engine.state.entities[this.getId()];
  }
  selectPos(x, y) {
    // Render mouse pick framebuffer..
    let renderer = this.engine.systems.renderer;
    let webglue = renderer.renderer;
    let gl = webglue.gl;
    renderer.render({
      viewport: [(data) => Object.assign(data, {
        options: {
          clearColor: new Float32Array([0, 0, 0, 1]),
          clearDepth: 1,
          cull: gl.BACK,
          depth: gl.LEQUAL
        },
        shaderHandler: () => this.pickShader,
        framebuffer: this.pickFramebuffer
      })],
      mesh: [(data, entity) => {
        data.uniforms.uColor = packColor(entity.id);
        return data;
      }]
    });
    // Then extract the pixel from framebuffer
    let pixel = new Uint8Array(4);
    this.pickFramebuffer.readPixelsRGBA(x,
      this.pickFramebuffer.height - y, 1, 1, pixel);
    this.engine.actions.select.select(
      this.engine.state.entities[unpackColor(pixel)]);
  }
}
