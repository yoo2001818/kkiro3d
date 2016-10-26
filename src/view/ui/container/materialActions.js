import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

class MaterialActions extends Component {
  handleRemove() {
    this.props.execute('renderer.material.remove', this.props.name);
  }
  render() {
    return (
      <div className='material-actions'>
        <button className='small red remove-button' title='Remove'
          onClick={this.handleRemove.bind(this)} />
      </div>
    );
  }
}

MaterialActions.propTypes = {
  execute: PropTypes.func,
  name: PropTypes.string
};

export default connect({}, (engine) => ({
  execute: engine.actions.external.execute
}))(MaterialActions);
