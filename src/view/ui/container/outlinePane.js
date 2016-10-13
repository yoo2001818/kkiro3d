import React, { Component, PropTypes } from 'react';
import connect from '../util/connectFudge';

import Pane from '../component/pane';
import EntityList from './entityList';

export default class OutlinePane extends Component {
  render() {
    return (
      <Pane header='Outline' className='outline-pane'>
        <EntityList />
      </Pane>
    );
  }
}
