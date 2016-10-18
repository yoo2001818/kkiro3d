import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

import DropDown from '../component/ui/dropDown';

class HeaderMenu extends Component {
  handleExport() {
    this.props.execute('ui.setModal', {
      title: 'Scene graph (JSON)',
      content: (
        <code>
          <pre>
            {JSON.stringify(this.props.engine.getState(), null, 2)}
          </pre>
        </code>
      ),
      choices: [{
        name: 'OK'
      }]
    });
  }
  render() {
    return (
      <div className='header-menu'>
        <DropDown title='File' className='left no-caret'><ul>
          <li><a href='#' onClick={this.handleExport.bind(this)}>
            Export JSON
          </a></li>
        </ul></DropDown>
      </div>
    );
  }
}

HeaderMenu.propTypes = {
  execute: PropTypes.func,
  ui: PropTypes.object,
  engine: PropTypes.object
};

export default connect({}, (engine) => ({
  execute: engine.actions.external.execute,
  ui: engine.systems.ui,
  engine: engine
}))(HeaderMenu);
