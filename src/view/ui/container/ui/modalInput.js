import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';

import ModalContext from '../../component/modal/context';

class ModalInput extends Component {
  handleChange() {
    // No-op
  }
  handleFocus() {
    this.props.execute('ui.setModal', this.renderPopup.bind(this));
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
    const ListComponent = this.props.listComponent;
    return (
      <ModalContext alignTo={this.input} onClose={onClose}>
        <div className='popup-menu'>
          <ListComponent selected={this.props.value} onSelect={v => {
            onClose();
            this.handleSelect(v);
          }} />
        </div>
      </ModalContext>
    );
  }
  render() {
    const { value, className } = this.props;
    return (
      <div
        className={classNames('modal-input-component', className)}
      >
        <input type='text' readOnly
          value={value}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this)}
          ref={input => this.input = input}
          />
      </div>
    );
  }
}

ModalInput.propTypes = {
  value: PropTypes.bool,
  className: PropTypes.string,
  onChange: PropTypes.func,
  execute: PropTypes.func,
  listComponent: PropTypes.func
};

export default connect({}, (engine) => ({
  execute: engine.actions.external.execute
}))(ModalInput);
