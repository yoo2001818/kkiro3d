import React, { Component, PropTypes } from 'react';

export default class NumberInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      editValue: ''
    };
  }
  handleChange(e) {
    this.setState({
      editValue: e.target.value
    });
    if (!this.state.focused || !isNaN(parseFloat(e.target.value))) {
      if (this.props.onChange) this.props.onChange(e);
    }
  }
  handleFocus(e) {
    this.setState({
      focused: true,
      editValue: e.target.value
    });
  }
  handleBlur(e) {
    this.setState({
      focused: false
    });
    // Emit change event
    if (this.props.onChange) this.props.onChange(e);
  }
  render() {
    const { value } = this.props;
    const { focused, editValue } = this.state;
    return (
      <div className='number-input-component'>
        <input
          type='number' step='any' value={ focused ? editValue : (value || 0) }
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          />
      </div>
    );
  }
}

NumberInput.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func
};
