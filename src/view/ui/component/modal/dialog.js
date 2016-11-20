import React, { Component, PropTypes } from 'react';

import Dialog, { Controls } from '../../component/ui/dialog';
import FullOverlay from '../../component/ui/fullOverlay';

export default class ModalDialog extends Component {
  handleClose(key) {
    if (key != null) {
      let onClick = this.props.actions[key].onClick;
      let result = true;
      if (onClick) result = onClick();
      if (result === false) return;
    }
    if (this.props.onClose) this.props.onClose();
  }
  render() {
    const { title, children, actions } = this.props;
    return (
      <FullOverlay filter>
        <Dialog title={title}>
          { children }
          <Controls>
            { actions.map((choice, key) => (
              <button onClick={this.handleClose.bind(this, key)}
                className={choice.type} key={key}
              >
                {choice.name}
              </button>
            ))}
          </Controls>
        </Dialog>
      </FullOverlay>
    );
  }
}

ModalDialog.propTypes = {
  onClose: PropTypes.func,
  title: PropTypes.node,
  children: PropTypes.node,
  actions: PropTypes.array
};
