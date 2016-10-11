import React, { Component, PropTypes } from 'react';
import connect from '../util/connectFudge';

class Viewport extends Component {
  componentDidMount() {
    ['mousedown', 'mousemove', 'mouseup', 'contextmenu', 'wheel',
      'keydown', 'keyup'].forEach(
      v => this.node.addEventListener(v, e => this.props.processEvent(v, e))
    );
  }
  render() {
    return (
      <div className='viewport' ref={node => this.node = node} tabIndex={0}>
        Viewport :)
      </div>
    );
  }
}

Viewport.propTypes = {
  processEvent: PropTypes.func
};

export default connect({}, (engine) => ({
  processEvent: engine.modeManager.processEvent.bind(engine.modeManager)
}))(Viewport);
