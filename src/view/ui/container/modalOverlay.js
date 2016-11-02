import React, { Component, PropTypes, cloneElement } from 'react';
import connect from '../util/connect';
import ModalDialog from '../component/modal/dialog';

class ModalOverlay extends Component {
  handleClose() {
    this.props.executeLocal('ui.closeModal');
  }
  render() {
    const { modal } = this.props;
    if (modal == null) return false;
    if (modal.title) {
      return (
        <ModalDialog title={modal.title} actions={[
          {name: 'OK'}
        ]} onClose={this.handleClose.bind(this)}>
          <p>
            {modal.data}
          </p>
        </ModalDialog>
      );
    }
    if (typeof modal === 'function') {
      return modal(this.handleClose.bind(this));
    }
    return cloneElement(modal, {onClose: this.handleClose.bind(this)});
  }
}

ModalOverlay.propTypes = {
  executeLocal: PropTypes.func,
  modal: PropTypes.any
};

export default connect({
  'ui.setModal': true
}, (engine) => ({
  executeLocal: engine.actions.external.executeLocal,
  modal: engine.systems.ui.modal
}))(ModalOverlay);
