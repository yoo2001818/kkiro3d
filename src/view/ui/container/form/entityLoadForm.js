import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import ModalDialog from '../../component/modal/dialog';

class EntityLoadForm extends Component {
  handleSubmit(e) {
    if (e) e.preventDefault();
    this.props.execute('editor.createEntity',
      this.props.engine.systems.editor.getId(),
      JSON.parse(this.area.value));
    this.props.onClose();
  }
  render() {
    return (
      <ModalDialog title='Load Entity Hierarchy' actions={[
        {name: 'OK', onClick: this.handleSubmit.bind(this)},
        {name: 'Cancel', type: 'red'}
      ]} onClose={this.props.onClose}>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <textarea className='code'
            defaultValue=''
            ref={area => this.area = area}
          />
        </form>
      </ModalDialog>
    );
  }
}

EntityLoadForm.propTypes = {
  execute: PropTypes.func,
  engine: PropTypes.object,
  onClose: PropTypes.func
};

export default connect({}, (engine) => ({
  engine,
  execute: engine.actions.external.execute
}))(EntityLoadForm);
