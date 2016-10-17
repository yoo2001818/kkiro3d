import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

import Pane from '../component/pane';
import EntityList from './entityList';

class OutlinePane extends Component {
  handleAdd() {
    this.props.execute('editor.create', {});
  }
  render() {
    return (
      <Pane className='outline-pane'
        header={<div className='header-content'>
          <div className='title'>Outline</div>
          <div className='add-button' onClick={this.handleAdd.bind(this)} />
        </div>}
      >
        <EntityList />
      </Pane>
    );
  }
}

OutlinePane.propTypes = {
  execute: PropTypes.func
};

export default connect({}, (engine) => ({
  execute: engine.actions.external.execute
}))(OutlinePane);
