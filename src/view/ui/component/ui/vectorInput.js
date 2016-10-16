import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import NumberInput from './numberInput';

export default class VectorInput extends Component {
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
