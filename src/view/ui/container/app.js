import React, { Component } from 'react';
// import connect from '../util/connectFudge';

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
          <div className='viewport'>
            Viewport
          </div>
          <div className='sidebar'>
            Sidebar
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
