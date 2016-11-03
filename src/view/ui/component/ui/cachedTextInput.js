import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class CachedTextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locked: false,
      editValue: ''
    };
    this.focus = false;
  }
  handleChange(e) {
    this.setState({
      editValue: e.target.value
    });
    if (!this.state.locked) {
      if (this.props.onChange) this.props.onChange(e);
    }
  }
  handleFocus(e) {
    this.focus = true;
    this.setState({
      locked: true,
      editValue: e.target.value
    });
  }
  handleBlur(e) {
    this.focus = false;
    this.setState({
      locked: false
    });
    // Emit change event
    if (this.props.onChange) this.props.onChange(e);
  }
  render() {
    const { value, type = 'text', className } = this.props;
    const { locked, editValue } = this.state;
    return (
      <div
        className={classNames('cached-text-input-component',
          { locked }, className)}
      >
        <input
          type={type}
          value={ locked ? editValue : (value || '') }
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          ref={input => this.input = input}
          />
      </div>
    );
  }
}

CachedTextInput.propTypes = {
  value: PropTypes.any,
  type: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func
};
