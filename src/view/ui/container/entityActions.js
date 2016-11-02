import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

class EntityActions extends Component {
  handleDelete() {
    this.props.execute('entity.delete', this.props.entity);
  }
  handleClone() {
    this.props.execute('editor.createEntity',
      this.props.engine.systems.editor.getId(), this.props.entity);
  }
  render() {
    return (
      <div className='entity-actions'>
        <button className='small red delete-button' title='Delete'
          onClick={this.handleDelete.bind(this)} />
        <button className='small clone-button' title='Clone'
          onClick={this.handleClone.bind(this)} />
      </div>
    );
  }
}

EntityActions.propTypes = {
  execute: PropTypes.func,
  entity: PropTypes.object,
  engine: PropTypes.object
};

export default connect({}, (engine) => ({
  execute: engine.actions.external.execute,
  engine
}))(EntityActions);
