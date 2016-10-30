import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';
import jsonReplacer from '../../../util/jsonReplacer';

import ModalDialog from '../component/modal/dialog';
import DropDown from '../component/ui/dropDown';

import SceneLoadForm from './form/sceneLoadForm';

class HeaderMenu extends Component {
  handleLoad() {
    this.props.execute('ui.setModal',
      <SceneLoadForm />
    );
  }
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
  handleLoadCookie() {
    if (window.localStorage.savedData == null) return;
    this.props.execute('editor.load',
      JSON.parse(window.localStorage.savedData));
  }
  handleSaveCookie() {
    window.localStorage.savedData =
      JSON.stringify(this.props.engine.getState(), jsonReplacer);
  }
  render() {
    return (
      <div className='header-menu'>
        <DropDown title='File' className='left no-caret'><ul>
          <li><a href='#' onClick={this.handleLoad.bind(this)}>
            Load JSON
          </a></li>
          <li><a href='#' onClick={this.handleExport.bind(this)}>
            Export JSON
          </a></li>
          <hr />
          <li><a href='#' onClick={this.handleLoadCookie.bind(this)}>
            Load from LocalStorage
          </a></li>
          <li><a href='#' onClick={this.handleSaveCookie.bind(this)}>
            Save to LocalStorage
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
