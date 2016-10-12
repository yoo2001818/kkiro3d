import React, { Component } from 'react';
// import connect from '../util/connectFudge';

import Viewport from './viewport';
import OverviewPane from './overviewPane';
import PropertiesPane from './propertiesPane';

export default class App extends Component {
  render() {
    // There's only one page in the app - there's no point using routers and
    // stuff.
    return (
      <div className='app'>
        <div className='header'>
          kkiro3d
        </div>
        <div className='content'>
          <Viewport />
          <div className='sidebar'>
            <OverviewPane />
            <PropertiesPane />
          </div>
        </div>
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
