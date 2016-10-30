import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import ModalDialog from '../../component/modal/dialog';

class SceneLoadForm extends Component {
  handleSubmit(e) {
    if (e) e.preventDefault();
    // STOPPP
    this.props.execute('external.stop');
    this.props.execute('external.load', JSON.parse(this.area.value));
    this.props.execute('external.start');
    this.props.onClose();
  }
  render() {
    return (
      <ModalDialog title='Load Scene Graph' actions={[
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

SceneLoadForm.propTypes = {
  execute: PropTypes.func,
  onClose: PropTypes.func
};

export default connect({}, (engine) => ({
  execute: engine.actions.external.execute
}))(SceneLoadForm);
