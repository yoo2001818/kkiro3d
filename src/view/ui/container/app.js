import React, { Component } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';

import Header from '../component/header';
import HeaderMenu from './headerMenu';
import EnginePlayback from './enginePlayback';
import NetworkStatus from './networkStatus';
import Viewport from './viewport';
import OutlinePane from './outlinePane';
import PropertiesPane from './propertiesPane';
import ModalOverlay from './modalOverlay';

export class App extends Component {
  render() {
    // There's only one page in the app - there's no point using routers and
    // stuff.
    return (
      <div className='app'>
        <Header right={
          <div>
            <NetworkStatus />
            <EnginePlayback />
          </div>
        }>
          <HeaderMenu />
        </Header>
        <div className='content'>
          <Viewport />
          <div className='sidebar'>
            <OutlinePane />
            <PropertiesPane />
          </div>
        </div>
        <ModalOverlay />
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
