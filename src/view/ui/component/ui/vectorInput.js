import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import NumberInput from './numberInput';

export default class VectorInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locked: false
    };
    this.shouldLock = false;
  }
  handleFocus() {
    this.shouldLock = false;
    this.setState({
      locked: true
    });
  }
  handleBlur() {
    this.shouldLock = true;
    // A slight delay for focus regain...
    setTimeout(() => {
      if (!this.shouldLock) return;
      this.setState({
        locked: false
      });
    }, 10);
  }
  handleChange(pos, e) {
    let vec = this.props.value.slice();
    vec[pos] = parseFloat(e.target.value);
    if (this.props.onChange) {
      this.props.onChange({
        target: {
          value: vec
        }
      });
    }
  }
  render() {
    const { value, precision, className } = this.props;
    let nodes = [];
    // TypedArray's map function returns TypedArray, so we need to
    // do this for React nodes
    for (let i = 0; i < value.length; ++i) {
      nodes.push(
        <NumberInput value={value[i]} precision={precision}
          className={className}
          onChange={this.handleChange.bind(this, i)}
          key={i}
          onFocus={this.handleFocus.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          locked={this.state.locked}
        />
      );
    }
    return (
      <div className={classNames('vector-input-component', className)}>
        { nodes }
      </div>
    );
  }
}

VectorInput.propTypes = {
  value: PropTypes.any,
  precision: PropTypes.number,
  className: PropTypes.string,
  onChange: PropTypes.func
};
