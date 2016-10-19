import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

import DropDown from '../component/ui/dropDown';
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
          <div className='title'>
            <DropDown title='Entities' className='left'><ul>
              <li><a href='#'>Entities</a></li>
              <li><a href='#'>Components</a></li>
              <li><a href='#'>Systems</a></li>
              <li><a href='#'>Views</a></li>
              <li><a href='#'>Shaders</a></li>
              <li><a href='#'>Textures</a></li>
              <li><a href='#'>Materials</a></li>
              <li><a href='#'>Geometries</a></li>
            </ul></DropDown>
          </div>
          <div className='add-button' onClick={this.handleAdd.bind(this)}
            title='Add' />
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
