import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';
import jsonReplacer from '../../../util/jsonReplacer';
import download from '../util/download';

import ModalDialog from '../component/modal/dialog';
import DropDown from '../component/ui/dropDown';

import SceneLoadForm from './form/sceneLoadForm';
import EntityLoadForm from './form/entityLoadForm';
import ConnectForm from './form/connectForm';

class HeaderMenu extends Component {
  handleLoad() {
    this.props.executeLocal('ui.setModal',
      <SceneLoadForm />
    );
  }
  handleLoadEntity() {
    this.props.executeLocal('ui.setModal',
      <EntityLoadForm />
    );
  }
  handleExport() {
    this.props.executeLocal('ui.setModal',
      <ModalDialog title='Scene graph (JSON)' actions={[
        {name: 'OK'},
        {name: 'Download...', type: 'green', onClick: () => {
          download(JSON.stringify(this.props.engine.getState(), jsonReplacer),
            'scene.json');
        }}
      ]}>
        <textarea className='code'
          defaultValue={JSON.stringify(this.props.engine.getState(),
            jsonReplacer, 2)}
          readOnly
        />
      </ModalDialog>
    );
  }
  handleNew() {
    this.props.execute('editor.load', [{
      entityId: 0
    }, [], []]);
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
  handleConnect() {
    this.props.executeLocal('ui.setModal',
      <ConnectForm />
    );
  }
  handleDisconnect() {
    this.props.engine.systems.network.disconnect();
  }
  render() {
    return (
      <div className='header-menu'>
        <DropDown title='File' className='left no-caret'><ul>
          <li><a href='#' onClick={this.handleNew.bind(this)}>
            New
          </a></li>
          <li><a href='#' onClick={this.handleLoad.bind(this)}>
            Load JSON...
          </a></li>
          <li><a href='#' onClick={this.handleExport.bind(this)}>
            Save JSON...
          </a></li>
          <hr />
          <li><a href='#' onClick={this.handleLoadEntity.bind(this)}>
            Load Entity...
          </a></li>
          <hr />
          <li><a href='#' onClick={this.handleLoadCookie.bind(this)}>
            Load from LocalStorage
          </a></li>
          <li><a href='#' onClick={this.handleSaveCookie.bind(this)}>
            Save to LocalStorage
          </a></li>
        </ul></DropDown>
        <DropDown title='Network' className='left no-caret'><ul>
          <li><a href='#' onClick={this.handleConnect.bind(this)}>
            Connect...
          </a></li>
          { this.props.useNetwork && (
            <li><a href='#' onClick={this.handleDisconnect.bind(this)}>
              Disconnect
            </a></li>
          ) }
        </ul></DropDown>
      </div>
    );
  }
}

HeaderMenu.propTypes = {
  execute: PropTypes.func,
  executeLocal: PropTypes.func,
  ui: PropTypes.object,
  engine: PropTypes.object,
  useNetwork: PropTypes.bool
};

export default connect({
  'network.*': true
}, (engine) => ({
  execute: engine.actions.external.execute,
  executeLocal: engine.actions.external.executeLocal,
  ui: engine.systems.ui,
  engine: engine,
  useNetwork: engine.systems.network.synchronizer != null
}))(HeaderMenu);
