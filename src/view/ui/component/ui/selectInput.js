import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class SelectInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false
    };
  }
  handleSelect(value) {
    if (this.props.readonly) return;
    if (this.props.onChange) {
      this.props.onChange({
        target: {
          value: value
        }
      });
    }
  }
  handleFocus(e) {
    if (this.props.readonly) return e.preventDefault();
    this.setState({
      isFocused: true
    });
    if (this.props.onFocus) this.props.onFocus();
  }
  handleBlur() {
    this.setState({
      isFocused: false
    });
    if (this.props.readonly) return;
    if (this.props.onBlur) this.props.onBlur(this.props.value);
  }
  getCurrentPos() {
    const { value, options } = this.props;
    return options.reduce((p, option, i) => option.value === value ? i : p, 0);
  }
  selectRelative(n) {
    let pos = this.getCurrentPos();
    let newPos = pos + n;
    const { options } = this.props;
    if (newPos < 0) newPos = options.length + newPos;
    if (newPos >= options.length) newPos = options.length - newPos;
    this.handleSelect(options[newPos].value);
  }
  handleKeyDown(e) {
    switch (e.keyCode) {
    case 37: // left
    case 38: // up
      this.selectRelative(-1);
      e.preventDefault();
      break;
    case 39: // right
    case 40: // down
      this.selectRelative(1);
      e.preventDefault();
      break;
    }
  }
  render() {
    const { className, tabIndex, options, value, readonly } = this.props;
    const { isFocused } = this.state;
    return (
      <ul
        className={classNames('select-input-component', className)}
        tabIndex={readonly ? null : (tabIndex || 0)}
        onFocus={this.handleFocus.bind(this)}
        onBlur={this.handleBlur.bind(this)}
        onKeyDown={this.handleKeyDown.bind(this)}
      >
        {options.map(option => (
          <li
            key={option.value}
            className={classNames('option', {
              selected: option.value === value,
              focus: option.value === value && isFocused
            }, option.className)}
            onClick={this.handleSelect.bind(this, option.value)}
          >
            {option.value === value && <span className='icon' />}
            {option.label}
          </li>
        ))}
      </ul>
    );
  }
}

SelectInput.propTypes = {
  className: PropTypes.string,
  value: PropTypes.any,
  tabIndex: PropTypes.number,
  options: PropTypes.array,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  readonly: PropTypes.bool
};
