import React from 'react';
import { render } from 'react-dom';
import { Provider } from './util/connectFudge';
import Index from './view/index';

export default function initUI(engine) {
  // Create wrapper element...
  let wrapper = document.createElement('div');
  wrapper.className = 'appContainer';
  wrapper.style.position = 'absolute';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.color = '#ffffff';
  document.body.appendChild(wrapper);

  render(
    <Provider engine={engine}>
      <Index />
    </Provider>,
    wrapper
  );
}
