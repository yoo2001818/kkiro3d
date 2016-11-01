import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import connect from '../util/connect';

class EnginePlayback extends Component {
  handleToggle() {
    this.props.execute('time.setRunning', !this.props.running);
  }
  render() {
    const { running } = this.props;
    return (
      <div className={classNames('engine-playback', { running })}>
        <button className='pause-button'
          title='Pause'
          onClick={this.handleToggle.bind(this)} />
      </div>
    );
  }
}

EnginePlayback.propTypes = {
  execute: PropTypes.func,
  running: PropTypes.bool
};

export default connect({
  'external.load:post': true,
  'time.setRunning': true
}, (engine) => ({
  execute: engine.actions.external.execute,
  running: engine.state.global.running
}))(EnginePlayback);
