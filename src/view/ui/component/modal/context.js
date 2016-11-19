import React, { Component, PropTypes, cloneElement } from 'react';

export default class ModalContext extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0
    };
  }
  handleClose() {
    if (this.props.onClose) this.props.onClose();
  }
  componentDidMount() {
    let { innerWidth, innerHeight } = window;
    let nodeRect = this.node.getBoundingClientRect();
    if (this.props.alignTo) {
      let x, y;
      let alignRect = this.props.alignTo.getBoundingClientRect();
      if (this.props.top) {
        y = alignRect.top - nodeRect.height;
        if (y < 0) {
          y = Math.min(innerHeight - nodeRect.height, alignRect.bottom);
        }
      } else {
        y = alignRect.bottom;
        if (y + nodeRect.height > innerHeight) {
          y = Math.max(0, alignRect.top - nodeRect.height);
        }
      }
      x = alignRect.left;
      if (x + nodeRect.width > innerWidth) {
        x = Math.max(0, alignRect.right - nodeRect.width);
      }
      this.setState({ x, y });
    }
  }
  render() {
    const { children } = this.props;
    let handleClose = this.handleClose.bind(this);
    return (
      <div>
        <div className='full-overlay' onClick={handleClose} />
        <div className='modal-context'
          style={{
            position: 'fixed',
            left: this.state.x + 'px',
            top: this.state.y + 'px'
          }}
          ref={node => this.node = node}
        >
          {children}
        </div>
      </div>
    );
  }
}

ModalContext.propTypes = {
  onClose: PropTypes.func,
  children: PropTypes.node,
  alignTo: PropTypes.object,
  top: PropTypes.bool
};
