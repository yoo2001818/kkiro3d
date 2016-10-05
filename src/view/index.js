import Renderer from 'webglue/lib/renderer';

import createGeometries from '../geom';
import createShaders from '../shader';
import createMaterials from '../material';

import RendererView from './renderer';
// import BlenderInputView from './blenderInput';

import ObjectMode from './mode/object';
import ModeManager from './modeManager';

import selectWireframeEffect from './renderer/effect/selectWireframe';

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
    [
      selectWireframeEffect
    ]
  );

  let modeManager = new ModeManager(engine, rendererView);
  modeManager.push(new ObjectMode());

  // Delegate events
  ['mousedown', 'mousemove', 'mouseup', 'contextmenu'].forEach(
    v => modeManager.addEventDelegator(canvas, v)
  );
  ['keydown', 'keyup'].forEach(
    v => modeManager.addEventDelegator(document, v)
  );
}
