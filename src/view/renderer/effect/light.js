// Sets up light uniforms for forward rendering
/*
{
  direction: [-0.590945, 0.216439, 0.777132],
  color: '#ffffff',
  intensity: [0.3, 0.7, 1.0]
}
*/
import { vec3 } from 'gl-matrix';

export default function lightEffect() {
  return {
    worldPre: (world) => {
      world.uniforms.uDirectionalLight = [];
      world.uniforms.uPointLight = [];
      return world;
    },
    light: (light, world) => {
      switch (light.light.type) {
      case 'point': {
        world.uniforms.uPointLight.push({
          position: light.transform.position,
          color: light.light.color,
          intensity: [light.light.ambient, light.light.diffuse,
            light.light.specular, light.light.attenuation]
        });
        break;
      }
      case 'directional': {
        // TODO This should be in LightSystem or something... to cache the
        // quaternion projection result. Oh well.
        world.uniforms.uDirectionalLight.push({
          direction: vec3.transformQuat(vec3.create(), [0, 0, 1],
            light.transform.rotation),
          color: light.light.color,
          intensity: [light.light.ambient, light.light.diffuse,
            light.light.specular]
        });
        break;
      }
      }
    }
  };
}
