export default function createShaders(renderer) {
  return {
    phong: renderer.shaders.create(
      require('./phong.vert'),
      require('./phong.frag')
    ),
    border: renderer.shaders.create(
      require('./minimal.vert'),
      require('./monoColor.frag')
    ),
    widget: renderer.shaders.create(
      require('./widget.vert'),
      require('./staticColor.frag')
    )
  };
}
