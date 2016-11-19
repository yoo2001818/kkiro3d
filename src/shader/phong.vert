#version 100
#pragma webglue: feature(USE_NORMAL_MAP, uNormalMap)
#pragma webglue: feature(USE_HEIGHT_MAP, uHeightMap)
#pragma webglue: feature(USE_INSTANCING, uInstanced)
#define INSTANCING
#if defined(USE_NORMAL_MAP) || defined(USE_HEIGHT_MAP)
  #define USE_TANGENT_SPACE
#endif

precision lowp float;

attribute vec2 aTexCoord;
attribute vec3 aNormal;
attribute vec3 aPosition;
attribute vec4 aTangent;

#ifdef USE_INSTANCING
  attribute vec4 aInstanced1;
  attribute vec4 aInstanced2;
  attribute vec4 aInstanced3;
  attribute vec4 aInstanced4;
#endif

varying lowp vec3 vPosition;
varying lowp vec2 vTexCoord;
varying lowp vec3 vViewPos;

#ifdef USE_TANGENT_SPACE
  varying lowp vec4 vTangent;
#endif
varying lowp vec3 vNormal;

uniform mat4 uProjectionView;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat3 uNormal;

vec3 getViewPosWorld() {
  return -mat3(
    uView[0].x, uView[1].x, uView[2].x,
    uView[0].y, uView[1].y, uView[2].y,
    uView[0].z, uView[1].z, uView[2].z
    ) * uView[3].xyz;
}

void main() {
  #ifdef USE_INSTANCING
    vec4 fragPos =
      mat4(aInstanced1, aInstanced2, aInstanced3, aInstanced4) *
      vec4(aPosition, 1.0);
  #else
    vec4 fragPos = uModel * vec4(aPosition, 1.0);
  #endif
  gl_Position = uProjectionView * fragPos;
  vTexCoord = aTexCoord;
  #ifdef USE_TANGENT_SPACE
    vTangent = aTangent;
  #endif
  vPosition = fragPos.xyz;
  #ifdef USE_INSTANCING
    vNormal = mat3(aInstanced1.xyz, aInstanced2.xyz, aInstanced3.xyz) * aNormal;
  #else
    vNormal = uNormal * aNormal;
  #endif
  vViewPos = getViewPosWorld();
}
