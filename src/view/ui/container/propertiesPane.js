import React, { Component, PropTypes } from 'react';
import connect from '../util/connectFudge';

import Pane from '../component/pane';

export default class PropertiesPane extends Component {
  render() {
    return (
      <Pane header='Properties' className='properties-pane'>
        Properties Pane
      </Pane>
    );
  }
}
