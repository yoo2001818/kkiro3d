import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

import Dialog from '../component/ui/dialog';
import FullOverlay from '../component/ui/fullOverlay';

class ModalOverlay extends Component {
  handleDismiss() {
    // Just dismiss for now
    this.props.execute('ui.closeModal');
  }
  render() {
    const { modal } = this.props;
    if (modal == null) return false;
    return (
      <FullOverlay filter>
        <Dialog title={modal.title}>
          <p>{modal.content}</p>
          <div className='action'>
            { modal.choices.map((choice, key) => (
              <button onClick={this.handleDismiss.bind(this, key)}
                className={choice.type} key={key}
              >
                {choice.name}
              </button>
            ))}
          </div>
        </Dialog>
      </FullOverlay>
    );
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
