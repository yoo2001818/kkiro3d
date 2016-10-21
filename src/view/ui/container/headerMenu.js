import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';
import jsonReplacer from '../../../util/jsonReplacer';

import ModalDialog from '../component/modal/dialog';
import DropDown from '../component/ui/dropDown';

class HeaderMenu extends Component {
  handleExport() {
    this.props.execute('ui.setModal',
      <ModalDialog title='Scene graph (JSON)' actions={[{name: 'OK'}]}>
        <textarea className='code'
          defaultValue={JSON.stringify(this.props.engine.getState(),
            jsonReplacer, 2)}
          readOnly
        />
      </ModalDialog>
    );
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
