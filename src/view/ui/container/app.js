import React, { Component } from 'react';
// import connect from '../util/connect';

import Header from '../component/header';
import HeaderMenu from './headerMenu';
import EnginePlayback from './enginePlayback';
import Viewport from './viewport';
import OutlinePane from './outlinePane';
import PropertiesPane from './propertiesPane';
import ModalOverlay from './modalOverlay';

export default class App extends Component {
  render() {
    // There's only one page in the app - there's no point using routers and
    // stuff.
    return (
      <div className='app'>
        <Header right={
          <EnginePlayback />
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

/*
Index.propTypes = {
  entities: PropTypes.array
};

export default connect({
  'entity.*': true,
  'transform.*': true
}, ({ state }) => ({ entities: state.entities }))(Index);
*/
