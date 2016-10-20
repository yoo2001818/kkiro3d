import Renderer from 'webglue/lib/renderer';

import createGeometries from '../geom';
import createShaders from '../shader';
import createMaterials from '../material';

import RendererView from './renderer';
// import BlenderInputView from './blenderInput';

import initUI from './ui';

import ObjectMode from './mode/object';
import ModeManager from './modeManager';

import mesh from './renderer/effect/mesh';
import light from './renderer/effect/light';

import selectWireframe from './renderer/effect/selectWireframe';
import mousePick from './renderer/effect/mousePick';
import depthPick from './renderer/effect/depthPick';
import axis from './renderer/effect/axis';
import widget from './renderer/effect/widget';
import lightWidget from './renderer/effect/lightWidget';
import generalHandle from './renderer/effect/generalHandle';

export default function initView(engine) {
  // Canvas init
  let canvas = document.createElement('canvas');
  canvas.className = 'engine-canvas';
  document.body.appendChild(canvas);
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;

  window.addEventListener('resize', () => {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  });

  let gl = canvas.getContext('webgl', { antialias: true }) ||
    canvas.getContext('experimental-webgl');
  let renderer = new Renderer(gl);

  let rendererView = new RendererView(engine, renderer,
    createGeometries(renderer),
    createShaders(renderer),
    createMaterials(renderer),
    { mesh, light, selectWireframe, widget, mousePick, depthPick, axis,
      lightWidget, generalHandle }
  );
  /* rendererView.setEffects(['selectWireframe', 'widget', 'light',
    'lightWidget']); */
  rendererView.setEffects(['mesh', 'light', 'selectWireframe', 'widget',
    'lightWidget', 'generalHandle']);

  let modeManager = new ModeManager(engine, rendererView);
  modeManager.push(new ObjectMode());
  // Why is this in the engine? To avoid global variables... I guess?
  engine.modeManager = modeManager;

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  initUI(engine);
}
