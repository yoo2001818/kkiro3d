export default function createShaders(renderer) {
  return {
    phong: renderer.shaders.create(
      require('./phong.vert'),
      require('./phong.frag')
    )
  };
}
