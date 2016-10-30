import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

class Viewport extends Component {
  componentDidMount() {
    let canvasNode = this.props.renderer.canvas;
    ['mousedown', 'mousemove', 'mouseup', 'contextmenu', 'wheel',
      'keydown', 'keyup'].forEach(
      v => canvasNode.addEventListener(v, e => this.props.processEvent(v, e))
    );
    this.node.appendChild(canvasNode);
    window.addEventListener('resize', () => this.setViewport());
    // Delay until next animation frame
    requestAnimationFrame(() => this.setViewport());
  }
  shouldComponentUpdate() {
    return false;
  }
  setViewport() {
    let bounds = this.node.getBoundingClientRect();
    // Alrighty, set the viewport size (of WebGL)
    this.props.renderer.top = bounds.top | 0;
    this.props.renderer.left = bounds.left | 0;
    this.props.renderer.canvas.width = bounds.width | 0;
    this.props.renderer.canvas.height = bounds.height | 0;
  }
  render() {
    return (
      <div className='viewport' ref={node => this.node = node}>
      </div>
    );
  }
}

Viewport.propTypes = {
  processEvent: PropTypes.func,
  renderer: PropTypes.object,
  modeManager: PropTypes.object
};

export default connect({}, ({ modeManager }) => ({
  processEvent: modeManager.processEvent.bind(modeManager),
  modeManager: modeManager,
  renderer: modeManager.renderer
}))(Viewport);
