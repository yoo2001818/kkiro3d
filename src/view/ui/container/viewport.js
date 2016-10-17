import React, { Component, PropTypes } from 'react';
import connect from 'react-fudge';

class Viewport extends Component {
  componentDidMount() {
    ['mousedown', 'mousemove', 'mouseup', 'contextmenu', 'wheel',
      'keydown', 'keyup'].forEach(
      v => this.node.addEventListener(v, e => this.props.processEvent(v, e))
    );
    window.addEventListener('resize', () => this.setViewport());
    // Delay until next animation frame
    requestAnimationFrame(() => this.setViewport());
  }
  setViewport() {
    let bounds = this.node.getBoundingClientRect();
    // Alrighty, set the viewport size (of WebGL)
    this.props.renderer.viewports[0].viewport = [
      bounds.left | 0,
      (document.documentElement.clientHeight - bounds.bottom) | 0,
      bounds.width | 0, bounds.height | 0
    ];
  }
  render() {
    return (
      <div className='viewport' ref={node => this.node = node} tabIndex={0}>
      </div>
    );
  }
}

Viewport.propTypes = {
  processEvent: PropTypes.func,
  renderer: PropTypes.object
};

export default connect({}, ({ modeManager }) => ({
  processEvent: modeManager.processEvent.bind(modeManager),
  renderer: modeManager.renderer
}))(Viewport);
