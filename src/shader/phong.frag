#version 100
#pragma webglue: feature(USE_ENVIRONMENT_MAP, uEnvironmentMap)
#pragma webglue: feature(USE_DIFFUSE_MAP, uDiffuseMap)
#pragma webglue: feature(USE_NORMAL_MAP, uNormalMap)
#pragma webglue: feature(USE_HEIGHT_MAP, uHeightMap)
#pragma webglue: count(POINT_LIGHT_SIZE, uPointLight, eqLength)
#pragma webglue: count(DIRECTIONAL_LIGHT_SIZE, uDirectionalLight, eqLength)
#pragma webglue: count(SPOT_LIGHT_SIZE, uSpotLight, eqLength)
#pragma webglue: count(POINT_SHADOW_LIGHT_SIZE, uPointShadowLight, eqLength)
#pragma webglue: count(DIRECTIONAL_SHADOW_LIGHT_SIZE, uDirectionalShadowLight, eqLength)
#pragma webglue: count(SPOT_SHADOW_LIGHT_SIZE, uSpotShadowLight, eqLength)
// TODO We'll handle shadows later
// #pragma webglue: feature(USE_DIRECTIONAL_LIGHT_SHADOW_MAP, uDirectionalLightShadowMap)

#if defined(USE_NORMAL_MAP) || defined(USE_HEIGHT_MAP)
  #define USE_TANGENT_SPACE
#endif

#ifndef POINT_LIGHT_SIZE
#define POINT_LIGHT_SIZE 0
#endif

#ifndef DIRECTIONAL_LIGHT_SIZE
#define DIRECTIONAL_LIGHT_SIZE 0
#endif

#ifndef SPOT_LIGHT_SIZE
#define SPOT_LIGHT_SIZE 0
#endif

#ifndef POINT_SHADOW_LIGHT_SIZE
#define POINT_SHADOW_LIGHT_SIZE 0
#endif

#ifndef DIRECTIONAL_SHADOW_LIGHT_SIZE
#define DIRECTIONAL_SHADOW_LIGHT_SIZE 0
#endif

#ifndef SPOT_SHADOW_LIGHT_SIZE
#define SPOT_SHADOW_LIGHT_SIZE 0
#endif

precision lowp float;

vec3 normal;
vec3 fragPos;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;
varying vec3 vViewPos;

#ifdef USE_TANGENT_SPACE
  varying vec4 vTangent;
  mat3 tangent;
#endif

struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;

  #ifdef USE_ENVIRONMENT_MAP
    vec4 reflectivity;
  #endif
  float shininess;
};

struct MaterialColor {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

struct PointLight {
  vec3 position;

  vec3 color;
  vec4 intensity;
};

struct DirectionalLight {
  vec3 direction;

  vec3 color;
  vec3 intensity;
};

struct SpotLight {
  // position.w contains 'near' angle, while direction.w contains 'far' angle.
  // Why are we doing this? It'd be best to reduce uniform vectors.
  // (Max vector size is very limited in mobile devices. Reasonably 221 vectors
  // are good to use for general PC, however, mobile devices only support up to
  // 64)
  // TODO We'd have to use deferred lighting or deferred rendering or storing
  // light information on textures (This will probably slow down the performance
  // in mobile devices, however, it'll support multiple lights.)
  vec3 position;
  vec3 direction;
  vec2 angle;

  vec3 color;
  vec4 intensity;
};

// TODO Can't we merge the structs? Sadly, GLSL doesn't support struct
// inheritance :S
// TODO PointShadowLight should support omni-directional shadows using cubemap
// (However, it'd be very expensive since OpenGL ES lacks geometry shader.)
struct PointShadowLight {
  vec3 position;

  vec3 color;
  vec4 intensity;

  vec2 range;
  mat4 shadowMat;
};

struct DirectionalShadowLight {
  vec3 direction;

  vec3 color;
  vec3 intensity;

  vec2 range;
  mat4 shadowMat;
};

struct SpotShadowLight {
  vec3 position;
  vec3 direction;
  vec2 angle;

  vec3 color;
  vec4 intensity;

  vec2 range;
  mat4 shadowMat;
};

#if POINT_LIGHT_SIZE > 0
  uniform PointLight uPointLight[POINT_LIGHT_SIZE];
#endif

#if DIRECTIONAL_LIGHT_SIZE > 0
  uniform DirectionalLight uDirectionalLight[DIRECTIONAL_LIGHT_SIZE];
#endif

#if SPOT_LIGHT_SIZE > 0
  uniform SpotLight uSpotLight[SPOT_LIGHT_SIZE];
#endif

#if POINT_SHADOW_LIGHT_SIZE > 0
  uniform PointShadowLight uPointShadowLight[POINT_SHADOW_LIGHT_SIZE];
  uniform sampler2D uPointLightShadowMap[POINT_SHADOW_LIGHT_SIZE];
#endif

#if DIRECTIONAL_SHADOW_LIGHT_SIZE > 0
  uniform DirectionalShadowLight uDirectionalShadowLight[
    DIRECTIONAL_SHADOW_LIGHT_SIZE];
  uniform sampler2D uDirectionalLightShadowMap[DIRECTIONAL_SHADOW_LIGHT_SIZE];
#endif

#if SPOT_SHADOW_LIGHT_SIZE > 0
  uniform SpotShadowLight uSpotShadowLight[SPOT_SHADOW_LIGHT_SIZE];
  uniform sampler2D uSpotLightShadowMap[SPOT_SHADOW_LIGHT_SIZE];
#endif

uniform Material uMaterial;

uniform mat4 uModel;
uniform mat3 uNormal;
uniform sampler2D uNormalMap;
uniform sampler2D uDiffuseMap;
uniform sampler2D uHeightMap;
uniform samplerCube uEnvironmentMap;

#ifdef USE_HEIGHT_MAP
  uniform vec2 uHeightMapScale;
#endif
// It's Blinn-Phong actually.
vec3 calcPhong(vec3 lightDir, vec3 viewDir) {
  // Diffuse
  float lambertian = max(dot(lightDir, normal), 0.0);

  // Specular
  float spec = 0.0;
  float fresnel = 0.0;
  if (lambertian > 0.0) {
    vec3 halfDir = normalize(lightDir + viewDir);
    float specAngle = max(dot(halfDir, normal), 0.0);

    spec = pow(specAngle, uMaterial.shininess);
    fresnel = pow(1.0 - max(0.0, dot(halfDir, viewDir)), 5.0);
  }

  return vec3(lambertian, spec, fresnel);
}

vec4 calcPoint(vec3 position, float attenu, vec3 viewDir) {
  #ifdef USE_TANGENT_SPACE
    vec3 lightDir = tangent * position - fragPos;
  #else
    vec3 lightDir = position - fragPos;
  #endif

  float distance = length(lightDir);
  lightDir = lightDir / distance;

  // Attenuation
  float attenuation = 1.0 / ( 1.0 +
    attenu * (distance * distance));

  return vec4(calcPhong(lightDir, viewDir), attenuation);
}

vec4 calcDirectional(vec3 direction, vec3 viewDir) {
  #ifdef USE_TANGENT_SPACE
    vec3 lightDir = tangent * direction;
  #else
    vec3 lightDir = direction;
  #endif

  vec3 phong = calcPhong(lightDir, viewDir);

  float distance = length(lightDir);
  lightDir = lightDir / distance;

  return vec4(calcPhong(lightDir, viewDir), 1.0);
}

vec4 calcSpot(vec3 position, vec3 direction, float attenu, vec2 range,
  vec3 viewDir
) {
  #ifdef USE_TANGENT_SPACE
    vec3 lightDir = tangent * position - fragPos;
    vec3 spotDir = tangent * direction;
  #else
    vec3 lightDir = position - fragPos;
    vec3 spotDir = direction;
  #endif

  float distance = length(lightDir);
  lightDir = lightDir / distance;

  // Attenuation
  float attenuation = 1.0 / ( 1.0 +
    attenu * (distance * distance));

  vec3 phong = calcPhong(lightDir, viewDir);

  // Spotlight
  lowp float theta = dot(lightDir, normalize(spotDir));
  lowp float epsilon = range.x - range.y;
  phong *= clamp((theta - range.y) / epsilon,
    0.0, 1.0);

  return vec4(phong, attenuation);
}

vec3 calcLight(MaterialColor matColor, vec3 color, vec3 intensity, vec4 phong) {
  // Combine everything together
  vec3 result = matColor.diffuse * intensity.g * phong.x;
  result += mix(matColor.specular, vec3(1.0), phong.z) *
    intensity.b * phong.y;
  result += matColor.ambient * intensity.r;
  result *= phong.w;
  result *= color;

  return result;
}

float decodeRGBToFloat(vec3 v) {
  return dot(v, vec3(1.0, 1.0 / 255.0, 1.0 / 65025.0));
}

float decodeRGToFloat(vec2 v) {
  return dot(v, vec2(1.0, 1.0 / 255.0));
}

float linstep(float low, float high, float v) {
  return clamp((v - low) / (high - low), 0.0, 1.0);
}

float lerpShadow(float depth, float moment, float compare) {
  if (compare <= depth) return 1.0;
  float p = compare <= moment ? 1.0 : 0.0;
  float variance = max(moment - depth * depth, 1.0 / 65536.0);
  float d = compare - depth;
  float pMax = smoothstep(0.2, 1.0, variance / (variance + d * d));
  return clamp(max(p, pMax), 0.0, 1.0);
}

float calcShadow(sampler2D shadowMap, mat4 shadowMat, vec2 range) {
  vec4 shadowCoord = shadowMat * vec4(vPosition, 1.0);
  vec3 lightPos;
  if (shadowCoord.w == 1.0) {
    lightPos = shadowCoord.xyz / shadowCoord.w;
    lightPos = lightPos * 0.5 + 0.5;
  } else {
    shadowCoord /= shadowCoord.w;
    // http://stackoverflow.com/a/6657284/3317669
    lowp float z_e = 2.0 * range.x * range.y / (range.x + range.y -
      shadowCoord.z * (range.y - range.x));
    lightPos = vec3(shadowCoord.xy * 0.5 + 0.5,
      (z_e - range.x) / (range.y - range.x));
  }

  float shadow;

  if (lightPos.x < 0.0 || lightPos.x > 1.0 ||
    lightPos.y < 0.0 || lightPos.y > 1.0 ||
    lightPos.z < 0.0 || lightPos.z > 1.0
  ) {
    shadow = 1.0;
  } else {
    vec4 lightValue = texture2D(shadowMap,
      lightPos.xy);
    float lightDepth = decodeRGToFloat(lightValue.rg);
    float lightMoment = decodeRGToFloat(lightValue.ba);
    // if (lightDepth + 0.0005 >= lightPos.z) return 1.0;
    // return 0.0;
    shadow = lerpShadow(lightDepth, lightMoment, lightPos.z);
  }
  return shadow;
}
void main(void) {
  #ifdef USE_TANGENT_SPACE
    // Normal vector.
    vec3 N = normalize(vNormal);
    // Tangent vector.
    vec3 T = normalize(vec3(uNormal * vTangent.xyz));
    T = normalize(T - dot(T, N) * N);
    // Bi-tangent vector.
    vec3 B = cross(T, N) * vTangent.w;
    // Transpose the matrix by hand
    tangent = mat3(
      vec3(T.x, B.x, N.x),
      vec3(T.y, B.y, N.y),
      vec3(T.z, B.z, N.z)
    );
    fragPos = tangent * vPosition;
    vec3 viewDir = normalize(tangent * vViewPos - fragPos);
  #else
    fragPos = vPosition;
    vec3 viewDir = normalize(vViewPos - fragPos);
    normal = normalize(vNormal);
  #endif

  vec2 texCoord = vTexCoord;

  #ifdef USE_TANGENT_SPACE
    #ifdef USE_HEIGHT_MAP
      float angle = min(1.0, pow(abs(dot(vec3(0.0, 0.0, 1.0), viewDir)), uHeightMapScale.y));
      float height = texture2D(uHeightMap, vTexCoord).r * 2.0 - 1.0;
      vec2 p = vec2(viewDir.x, -viewDir.y) / viewDir.z * (height * uHeightMapScale.x * angle);
      texCoord = vTexCoord + p;
    #endif
    #ifdef USE_NORMAL_MAP
      normal = normalize(texture2D(uNormalMap, texCoord).xyz * 2.0 - 1.0);
      normal.y = -normal.y;
    #else
      normal = vec3(0.0, 0.0, 1.0);
    #endif
  #endif

  MaterialColor matColor;
  matColor.ambient = uMaterial.ambient;
  matColor.diffuse = uMaterial.diffuse;
  matColor.specular = uMaterial.specular;

  #ifdef USE_DIFFUSE_MAP
  vec4 diffuseTex = vec4(texture2D(uDiffuseMap, texCoord).xyz, 1.0);
  matColor.ambient *= diffuseTex.xyz;
  matColor.diffuse *= diffuseTex.xyz;
  #endif

  #ifdef USE_ENVIRONMENT_MAP
  vec3 result = vec3(0.0, 0.0, 0.0);
	// TODO Support matte PBR (Disabled for now due to
	// https://github.com/KhronosGroup/WebGL/issues/1528)
	vec4 environmentTex = vec4(0.0);
	if (uMaterial.reflectivity.w > 0.5) {
    #ifdef USE_TANGENT_SPACE
      // (Sigh) Get world space viewDir
      vec3 worldViewDir = vViewPos - vPosition;
	    vec3 outVec = reflect(worldViewDir, normal);
    #else
	    vec3 outVec = reflect(viewDir, normal);
    #endif
	  environmentTex = vec4(textureCube(uEnvironmentMap, outVec).xyz, 1.0);
	} else {
		// Fallback: Sample random direction (to match colors)
	  environmentTex = vec4(textureCube(uEnvironmentMap, vec3(0.0, 0.0, 1.0)).xyz, 1.0);
	}
  float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 5.0);
	result = environmentTex.xyz *
  mix(uMaterial.reflectivity.xyz, vec3(uMaterial.reflectivity.w), fresnel);
  float power = mix(1.0, 1.0 - uMaterial.reflectivity.w, fresnel);
  matColor.ambient *= power;
  matColor.diffuse *= power;
  #else
  vec3 result = vec3(0.0, 0.0, 0.0);
  #endif
	#if POINT_LIGHT_SIZE > 0
  for (int i = 0; i < POINT_LIGHT_SIZE; ++i) {
    PointLight light = uPointLight[i];
    result += calcLight(matColor, light.color, light.intensity.rgb,
      calcPoint(light.position, light.intensity.w, viewDir));
  }
	#endif
  #if POINT_SHADOW_LIGHT_SIZE > 0
  for (int i = 0; i < POINT_SHADOW_LIGHT_SIZE; ++i) {
    PointShadowLight light = uPointShadowLight[i];
    vec4 phong = calcPoint(light.position, light.intensity.w, viewDir);
    phong.xyz *= calcShadow(uPointLightShadowMap[i],
      light.shadowMat, light.range);
    result += calcLight(matColor, light.color, light.intensity.rgb, phong);
  }
  #endif
  #if DIRECTIONAL_LIGHT_SIZE > 0
  for (int i = 0; i < DIRECTIONAL_LIGHT_SIZE; ++i) {
    DirectionalLight light = uDirectionalLight[i];
    result += calcLight(matColor, light.color, light.intensity,
      calcDirectional(light.direction, viewDir));
  }
  #endif
  #if DIRECTIONAL_SHADOW_LIGHT_SIZE > 0
  for (int i = 0; i < DIRECTIONAL_SHADOW_LIGHT_SIZE; ++i) {
    DirectionalShadowLight light = uDirectionalShadowLight[i];
    vec4 phong = calcDirectional(light.direction, viewDir);
    phong.xyz *= calcShadow(uDirectionalLightShadowMap[i],
      light.shadowMat, light.range);
    result += calcLight(matColor, light.color, light.intensity, phong);
  }
  #endif
  #if SPOT_LIGHT_SIZE > 0
  for (int i = 0; i < SPOT_LIGHT_SIZE; ++i) {
    SpotLight light = uSpotLight[i];
    result += calcLight(matColor, light.color, light.intensity.rgb,
      calcSpot(light.position, light.direction, light.intensity.w,
        light.angle, viewDir));
  }
  #endif
  #if SPOT_SHADOW_LIGHT_SIZE > 0
  for (int i = 0; i < SPOT_SHADOW_LIGHT_SIZE; ++i) {
    SpotShadowLight light = uSpotShadowLight[i];
    vec4 phong = calcSpot(light.position, light.direction,
      light.intensity.w, light.angle, viewDir);
    phong.xyz *= calcShadow(uSpotLightShadowMap[i],
      light.shadowMat, light.range);
    result += calcLight(matColor, light.color, light.intensity.rgb, phong);
  }
  #endif
  gl_FragColor = vec4(result, 1.0);

}
