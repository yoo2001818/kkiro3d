export default function createMaterial(renderer) {
  const gl = renderer.gl;
  return {
    test: {
      shader: 'phong',
      uniforms: {
        uMaterial: {
          ambient: '#aaaaaa',
          diffuse: '#aaaaaa',
          specular: '#444444',
          reflectivity: '#8c292929',
          shininess: 90
        }
      }
    },
    widget: {
      shader: 'widget',
      options: {
        depth: gl.ALWAYS
      }
    }
  };
}
