import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

import Pane from '../component/pane';
import EntityProperties from './entityProperties';

class PropertiesPane extends Component {
  render() {
    const { entity } = this.props;
    return (
      <Pane header='Properties' className='properties-pane'>
        { entity && (
          <EntityProperties entity={entity} />
        )}
      </Pane>
    );
  }
}

PropertiesPane.propTypes = {
  entity: PropTypes.object
};

export default connect({
  'editor.selectEntity': true
}, ({ state }) => ({
  entity: state.entities[state.global.selectedEntity]
}))(PropertiesPane);
