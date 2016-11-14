export default function createShaderHandler(frag) {
  let shaders = new Map();
  return function shaderHandler(shader, node, renderer) {
    if (shaders.has(shader)) return shaders.get(shader);
    let newShader = renderer.shaders.create(
      shader.source.vert,
      frag
    );
    shaders.set(shader, newShader);
    return newShader;
  };
}
