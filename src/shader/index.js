export default function createShaders(renderer) {
  return {
    phong: renderer.shaders.create(
      require('./phong.vert'),
      require('./phong.frag')
    ),
    widget: renderer.shaders.create(
      require('./widget.vert'),
      require('./staticColor.frag')
    )
  };
}
