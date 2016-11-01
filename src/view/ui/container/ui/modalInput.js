import React, { Component, PropTypes, cloneElement, Children } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';

import ModalContext from '../../component/modal/context';

class ModalInput extends Component {
  handleChange() {
    // No-op
  }
  handleFocus() {
    this.props.executeLocal('ui.setModal', this.renderPopup.bind(this));
  }
  handleSelect(v) {
    if (this.props.onChange) {
      this.props.onChange({
        target: {
          value: v
        }
      });
    }
  }
  renderPopup(onClose) {
    const { children } = this.props;
    return (
      <ModalContext alignTo={this.input} onClose={onClose}>
        <div className='popup-menu'>
          { cloneElement(Children.only(children), {
            selected: this.props.value,
            onSelect: v => {
              onClose();
              this.handleSelect(v);
            }
          })}
        </div>
      </ModalContext>
    );
  }
  render() {
    const { displayValue, value, className } = this.props;
    return (
      <div
        className={classNames('modal-input-component', className)}
      >
        <input type='text' readOnly
          value={displayValue || value}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this)}
          ref={input => this.input = input}
          />
      </div>
    );
  }
}

ModalInput.propTypes = {
  displayValue: PropTypes.any,
  value: PropTypes.any,
  className: PropTypes.string,
  onChange: PropTypes.func,
  executeLocal: PropTypes.func,
  children: PropTypes.node
};

export default connect({}, (engine) => ({
  executeLocal: engine.actions.external.executeLocal
}))(ModalInput);
