import React, { Component, PropTypes } from 'react';
import connect from '../util/connectFudge';

class EntityActions extends Component {
  handleDelete() {
    this.props.execute('entity.delete', this.props.entity);
  }
  handleClone() {
    this.props.execute('editor.create', this.props.entity);
  }
  render() {
    return (
      <div className='entity-actions'>
        <button className='small red delete-button'
          onClick={this.handleDelete.bind(this)} />
        <button className='small clone-button'
          onClick={this.handleClone.bind(this)} />
      </div>
    );
  }
}

EntityActions.propTypes = {
  execute: PropTypes.func,
  entity: PropTypes.object
};

export default connect({}, (engine) => ({
  execute: engine.actions.external.execute
}))(EntityActions);
