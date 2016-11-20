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
  handleOpen(e) {
    if (e) e.preventDefault();
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.click();
    input.addEventListener('change', () => {
      let file = input.files[0];
      var reader = new FileReader();
      reader.onload = e => {
        this.props.execute('editor.createEntity',
          this.props.engine.systems.editor.getId(),
          JSON.parse(e.target.result));
        this.props.onClose();
      };
      reader.readAsText(file);
    });
    return false;
  }
  render() {
    return (
      <ModalDialog title='Load Entity Hierarchy' actions={[
        {name: 'OK', onClick: this.handleSubmit.bind(this)},
        {name: 'Cancel', type: 'red'},
        {name: 'Upload...', type: 'green', onClick: this.handleOpen.bind(this)}
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
