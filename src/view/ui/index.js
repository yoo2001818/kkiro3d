import React from 'react';
import { render } from 'react-dom';
import { Provider } from './util/connectFudge';
import App from './container/app';

export default function initUI(engine) {
  // Create wrapper element...
  let wrapper = document.createElement('div');
  wrapper.className = 'appContainer';
  document.body.appendChild(wrapper);

  render(
    <Provider engine={engine}>
      <App />
    </Provider>,
    wrapper
  );
}
