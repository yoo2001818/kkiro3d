// Sets up light uniforms for forward rendering
import { vec3, vec4 } from 'gl-matrix';

export default function lightEffect(renderer) {
  const engine = renderer.engine;
  let matrixSystem = engine.systems.matrix;
  let cameraMatrix = engine.systems.cameraMatrix;
  return {
    worldPre: (world) => {
      world.uniforms.uDirectionalLight = [];
      world.uniforms.uPointLight = [];
      world.uniforms.uDirectionalShadowLight = [];
      world.uniforms.uDirectionalLightShadowMap = [];
      world.uniforms.uPointShadowLight = [];
      world.uniforms.uPointLightShadowMap = [];
      return world;
    },
    entity: (data, entity, world) => {
      if (entity.transform == null) return data;
      if (entity.light == null) return data;
      let shadowTexture, shadowMat;
      let { lightShadow } = renderer.effects;
      if (lightShadow && entity.light.shadow && entity.camera != null) {
        shadowTexture = lightShadow.textures[entity.id];
        shadowMat = cameraMatrix.getProjectionView(entity);
      }
      switch (entity.light.type) {
      case 'point': {
        let lightData = {
          position: matrixSystem.getPosition(entity),
          color: entity.light.color,
          intensity: [entity.light.ambient, entity.light.diffuse,
            entity.light.specular, entity.light.attenuation]
        };
        if (shadowTexture != null) {
          world.uniforms.uPointLightShadowMap.push(shadowTexture);
          lightData.shadowMat = shadowMat;
          world.uniforms.uPointShadowLight.push(lightData);
        } else {
          world.uniforms.uPointLight.push(lightData);
        }
        return data;
      }
      case 'directional': {
        // TODO This should be in LightSystem or something... to cache the
        // quaternion projection result. Oh well.
        let ray = vec4.fromValues(0, 0, 1, 0);
        vec4.transformMat4(ray, ray, matrixSystem.get(entity));
        vec3.normalize(ray, ray);
        let lightData = {
          direction: ray.subarray(0, 3),
          color: entity.light.color,
          intensity: [entity.light.ambient, entity.light.diffuse,
            entity.light.specular]
        };
        if (shadowTexture != null) {
          world.uniforms.uDirectionalLightShadowMap.push(shadowTexture);
          lightData.shadowMat = shadowMat;
          world.uniforms.uDirectionalShadowLight.push(lightData);
        } else {
          world.uniforms.uDirectionalLight.push(lightData);
        }
        return data;
      }
      }
    }
  };
}
