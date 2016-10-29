// Sets up light uniforms for forward rendering
/*
{
  direction: [-0.590945, 0.216439, 0.777132],
  color: '#ffffff',
  intensity: [0.3, 0.7, 1.0]
}
*/
import { vec3, vec4 } from 'gl-matrix';

export default function lightEffect(renderer) {
  const engine = renderer.engine;
  let matrixSystem = engine.systems.matrix;
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
          position: matrixSystem.getPosition(entity),
          color: entity.light.color,
          intensity: [entity.light.ambient, entity.light.diffuse,
            entity.light.specular, entity.light.attenuation]
        });
        return data;
      }
      case 'directional': {
        let ray = vec4.fromValues(0, 0, 1, 0);
        vec4.transformMat4(ray, ray, matrixSystem.get(entity));
        vec3.normalize(ray, ray);
        // TODO This should be in LightSystem or something... to cache the
        // quaternion projection result. Oh well.
        world.uniforms.uDirectionalLight.push({
          direction: ray.subarray(0, 3),
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
