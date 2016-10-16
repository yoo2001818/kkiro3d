import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class CheckboxInput extends Component {
  handleChange(e) {
    if (this.props.onChange) {
      this.props.onChange({
        target: {
          value: e.target.checked
        }
      });
    }
  }
  render() {
    const { value, className } = this.props;
    return (
      <div
        className={classNames('checkbox-input-component', className)}
      >
        <input
          type='checkbox'
          checked={ value }
          onChange={this.handleChange.bind(this)}
          ref={input => this.input = input}
          />
      </div>
    );
  }
}

CheckboxInput.propTypes = {
  value: PropTypes.bool,
  className: PropTypes.string,
  onChange: PropTypes.func
};
