import React, { Component, PropTypes } from 'react';
import connect from '../util/connectFudge';

import Pane from '../component/pane';
import EntityList from './entityList';

export default class OverviewPane extends Component {
  render() {
    return (
      <Pane header='Overview' className='overview-pane'>
        <EntityList />
      </Pane>
    );
  }
}
