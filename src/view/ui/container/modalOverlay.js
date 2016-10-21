import { Component, PropTypes, cloneElement } from 'react';
import connect from '../util/connect';

class ModalOverlay extends Component {
  handleClose() {
    this.props.execute('ui.closeModal');
  }
  render() {
    const { modal } = this.props;
    if (modal == null) return false;
    return cloneElement(modal, {onClose: this.handleClose.bind(this)});
  }
}

ModalOverlay.propTypes = {
  execute: PropTypes.func,
  modal: PropTypes.object
};

export default connect({
  'ui.setModal': true
}, (engine) => ({
  execute: engine.actions.external.execute,
  modal: engine.systems.ui.modal
}))(ModalOverlay);
