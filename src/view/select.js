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

function createShaderHandler(frag) {
  let shaders = new Map();
  return function shaderHandler(shader, uniforms, renderer) {
    if (shaders.has(shader)) return shaders.get(shader);
    let newShader = renderer.shaders.create(
      shader.source.vert,
      frag
    );
    shaders.set(shader, newShader);
    return newShader;
  };
}

export default class SelectSystem {
  constructor(engine, renderer, node, keyNode) {
    this.engine = engine;
    this.renderer = renderer;
    this.node = node;
    this.keyNode = keyNode;
    let webglue = renderer.webglue;
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
          shader: this.pickShaderHandler(data.shader, data.uniforms, webglue),
          geometry: geometry
        }, {}]
      });
    });
    // Create mouse pick framebuffer and shader
    this.pickShaderHandler = createShaderHandler(
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
    this.registerEvents();
  }
  registerEvents() {
    this.node.addEventListener('mousedown', (e) => {
      if (e.button !== 2) return;
      this.selectPos(e.clientX, e.clientY);
    });
  }
  getId() {
    return this.engine.state.global.selected;
  }
  get() {
    return this.engine.state.entities[this.getId()];
  }
  selectPos(x, y) {
    // Render mouse pick framebuffer..
    let webglue = this.renderer.webglue;
    let gl = webglue.gl;
    this.renderer.render({
      viewport: [(data) => Object.assign(data, {
        options: {
          clearColor: new Float32Array([0, 0, 0, 1]),
          clearDepth: 1,
          cull: gl.BACK,
          depth: gl.LEQUAL
        },
        shaderHandler: this.pickShaderHandler,
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
    let entityId = unpackColor(pixel);
    if (entityId === this.engine.systems.widget.widget.id) {
      return true;
    }
    this.engine.actions.select.select(
      this.engine.state.entities[entityId]);
  }
}
