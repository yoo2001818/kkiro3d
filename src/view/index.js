import Renderer from 'webglue/lib/renderer';

import createGeometries from '../geom';
import createShaders from '../shader';
import createMaterials from '../material';

import RendererView from './renderer';
// import BlenderInputView from './blenderInput';

import ObjectMode from './mode/object';
import ModeManager from './modeManager';

import selectWireframe from './renderer/effect/selectWireframe';
import mousePick from './renderer/effect/mousePick';
import axis from './renderer/effect/axis';

export default function initView(engine) {
  // Canvas init
  let canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;

  window.addEventListener('resize', () => {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  });

  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';

  let gl = canvas.getContext('webgl', { antialias: true }) ||
    canvas.getContext('experimental-webgl');
  let renderer = new Renderer(gl);

  let rendererView = new RendererView(engine, renderer,
    createGeometries(renderer),
    createShaders(renderer),
    createMaterials(renderer),
    { selectWireframe, mousePick, axis }
  );
  rendererView.setEffects(['selectWireframe']);

  let modeManager = new ModeManager(engine, rendererView);
  modeManager.push(new ObjectMode());

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  // Delegate events
  ['mousedown', 'mousemove', 'mouseup', 'contextmenu', 'wheel'].forEach(
    v => modeManager.addEventDelegator(canvas, v)
  );
  ['keydown', 'keyup'].forEach(
    v => modeManager.addEventDelegator(document, v)
  );
}
