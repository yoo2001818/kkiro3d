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
    entity: (data, entity, world) => {
      if (entity.transform == null) return data;
      if (entity.light == null) return data;
      switch (entity.light.type) {
      case 'point': {
        world.uniforms.uPointLight.push({
          position: entity.transform.position,
          color: entity.light.color,
          intensity: [entity.light.ambient, entity.light.diffuse,
            entity.light.specular, entity.light.attenuation]
        });
        return data;
      }
      case 'directional': {
        // TODO This should be in LightSystem or something... to cache the
        // quaternion projection result. Oh well.
        world.uniforms.uDirectionalLight.push({
          direction: vec3.transformQuat(vec3.create(), [0, 0, 1],
            entity.transform.rotation),
          color: entity.light.color,
          intensity: [entity.light.ambient, entity.light.diffuse,
            entity.light.specular]
        });
        return data;
      }
      }
    }
  };
}
