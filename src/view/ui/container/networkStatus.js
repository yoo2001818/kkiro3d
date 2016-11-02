import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import connect from '../util/connect';

class NetworkStatus extends Component {
  render() {
    const { connected, clients, useNetwork } = this.props;
    if (!useNetwork) return false;
    return (
      <div className={classNames('network-status', { connected })}>
        <i className='icon' />
        <i className='indicator' />
        <span className='clients'>
          { connected && clients.length }
        </span>
      </div>
    );
  }
}

NetworkStatus.propTypes = {
  execute: PropTypes.func,
  connected: PropTypes.bool,
  clients: PropTypes.array,
  useNetwork: PropTypes.bool
};

export default connect({
  'network.*:post': true
}, (engine) => ({
  execute: engine.actions.external.execute,
  connected: engine.systems.network.connected,
  clients: engine.systems.network.clients,
  useNetwork: engine.systems.network.synchronizer != null
}))(NetworkStatus);
