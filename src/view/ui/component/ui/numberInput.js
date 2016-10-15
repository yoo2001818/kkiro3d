import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class NumberInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locked: false,
      editValue: ''
    };
    this.focus = false;
    this.dragging = false;
    this.mouseDown = false;
    this.dragValue = 0;
    this.startX = 0;
    this.startY = 0;

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }
  handleChange(e) {
    this.setState({
      editValue: e.target.value
    });
    if (!this.state.locked || !isNaN(parseFloat(e.target.value))) {
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
  handleMouseDown(e) {
    if (e.button !== 0) return;
    if (this.focus) return;
    this.mouseDown = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    e.preventDefault();
  }
  handleMouseMove(e) {
    if (!this.mouseDown) return;
    let deltaX = e.clientX - this.startX;
    let deltaY = e.clientY - this.startY;
    if (!this.dragging) {
      // Threshold
      if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) < 3) return;
      if (!this.state.locked) {
        this.dragValue = (this.props.value || 0);
        this.setState({
          locked: true,
          editValue: this.dragValue.toFixed(4)
        });
      }
      this.dragging = true;
    }
    // Set the value
    let currentValue = this.dragValue + deltaY / 100;
    this.setState({
      editValue: currentValue.toFixed(4)
    });
    if (this.props.onChange) {
      this.props.onChange({
        target: {
          value: currentValue
        }
      });
    }
  }
  handleMouseUp(e) {
    if (e.button !== 0) return;
    if (this.focus) return;
    if (this.dragging) {
      this.dragging = false;
      // Apply the changes
      this.setState({
        locked: false
      });
      if (this.props.onChange) {
        this.props.onChange({
          target: {
            value: this.input.value
          }
        });
      }
    } else {
      this.input.focus();
      this.input.setSelectionRange(0, this.input.value.length);
    }
    this.mouseDown = false;
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
  render() {
    const { value } = this.props;
    const { locked, editValue } = this.state;
    return (
      <div className={classNames('number-input-component', { locked })}
        onMouseDown={this.handleMouseDown.bind(this)}
      >
        <input
          type='text' value={ locked ? editValue : (value || 0).toFixed(4) }
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          ref={input => this.input = input}
          />
      </div>
    );
  }
}

NumberInput.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func
};
