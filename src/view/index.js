import Renderer from 'webglue/lib/renderer';

import RendererView from './renderer';
// import BlenderInputView from './blenderInput';

import initUI from './ui';

import ObjectMode from './mode/object';
import ModeManager from './modeManager';

import meshInstanced from './renderer/effect/meshInstanced';
import mesh from './renderer/effect/mesh';
import light from './renderer/effect/light';
import lightShadow from './renderer/effect/lightShadow';

import selectWireframe from './renderer/effect/selectWireframe';
import mousePick from './renderer/effect/mousePick';
import depthPick from './renderer/effect/depthPick';
import axis from './renderer/effect/axis';
import widget from './renderer/effect/widget';
import lightWidget from './renderer/effect/lightWidget';
import cameraWidget from './renderer/effect/cameraWidget';
import generalHandle from './renderer/effect/generalHandle';
import skybox from './renderer/effect/skybox';
import collision from './renderer/effect/collision';

export default function initView(engine) {
  // Canvas init
  let canvas = document.createElement('canvas');
  canvas.className = 'engine-canvas';
  canvas.tabIndex = 0;
  /* canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;

  window.addEventListener('resize', () => {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  }); */

  let gl = canvas.getContext('webgl', { antialias: true }) ||
    canvas.getContext('experimental-webgl');
  let renderer = new Renderer(gl);

  let rendererView = new RendererView(engine, renderer,
    { meshInstanced, mesh, light, lightShadow, selectWireframe, widget,
      mousePick, depthPick,
      axis, lightWidget, cameraWidget, generalHandle, skybox, collision }
  );
  rendererView.canvas = canvas;

  let modeManager = new ModeManager(engine, rendererView);
  modeManager.push(new ObjectMode());
  // Why is this in the engine? To avoid global variables... I guess?
  engine.modeManager = modeManager;

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  initUI(engine);

  return rendererView;
}
