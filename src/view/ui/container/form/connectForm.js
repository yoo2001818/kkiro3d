import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import ModalDialog from '../../component/modal/dialog';

class ConnectForm extends Component {
  handleSubmit(e) {
    if (e) e.preventDefault();
    this.props.engine.systems.network.connect(this.input.value);
    this.props.onClose();
  }
  render() {
    return (
      <ModalDialog title='Connect to Server' actions={[
        {name: 'OK', onClick: this.handleSubmit.bind(this)},
        {name: 'Cancel', type: 'red'}
      ]} onClose={this.props.onClose}>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <input type='text'
            defaultValue='ws://localhost:23482/'
            ref={input => this.input = input}
          />
        </form>
      </ModalDialog>
    );
  }
}

ConnectForm.propTypes = {
  engine: PropTypes.object,
  onClose: PropTypes.func
};

export default connect({}, (engine) => ({
  engine
}))(ConnectForm);
