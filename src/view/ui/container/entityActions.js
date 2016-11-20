import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';
import jsonReplacer from '../../../util/jsonReplacer';

import ModalDialog from '../component/modal/dialog';

class EntityActions extends Component {
  handleDelete() {
    this.props.execute('parent.deleteHierarchy', this.props.entity);
  }
  handleClone() {
    let parentSystem = this.props.engine.systems.parent;
    this.props.execute('editor.createEntity',
      this.props.engine.systems.editor.getId(), parentSystem.getHierarchy(
        this.props.entity
      ));
  }
  handleJSON() {
    this.props.executeLocal('ui.setModal',
      <ModalDialog title='Entity JSON' actions={[{name: 'OK'}]}>
        <textarea className='code'
          defaultValue={JSON.stringify(this.props.entity,
            jsonReplacer, 2)}
          readOnly
        />
      </ModalDialog>
    );
  }
  handleHierarchyJSON() {
    let parentSystem = this.props.engine.systems.parent;
    this.props.executeLocal('ui.setModal',
      <ModalDialog title='Hierarchy JSON' actions={[{name: 'OK'}]}>
        <textarea className='code'
          defaultValue={JSON.stringify(parentSystem.getHierarchy(
              this.props.entity
            ), jsonReplacer, 2)}
          readOnly
        />
      </ModalDialog>
    );
  }
  render() {
    return (
      <div className='entity-actions'>
        <button className='small red delete-button' title='Delete'
          onClick={this.handleDelete.bind(this)} />
        <button className='small clone-button' title='Clone'
          onClick={this.handleClone.bind(this)} />
        <button className='small json-button' title='View JSON'
          onClick={this.handleJSON.bind(this)} />
        <button className='small hierarchy-button' title='View Hierarchy JSON'
          onClick={this.handleHierarchyJSON.bind(this)} />
      </div>
    );
  }
}

EntityActions.propTypes = {
  execute: PropTypes.func,
  executeLocal: PropTypes.func,
  entity: PropTypes.object,
  engine: PropTypes.object
};

export default connect({}, (engine) => ({
  execute: engine.actions.external.execute,
  executeLocal: engine.actions.external.executeLocal,
  engine
}))(EntityActions);
