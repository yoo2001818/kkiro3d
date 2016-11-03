import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-fudge';
import App from './container/app';

export default function initUI(engine, wrapper) {
  if (wrapper == null) {
    // Create wrapper element...
    wrapper = document.createElement('div');
    wrapper.className = 'appContainer';
    document.body.appendChild(wrapper);
  }

  render(
    <Provider engine={engine}>
      <App />
    </Provider>,
    wrapper
  );
}
