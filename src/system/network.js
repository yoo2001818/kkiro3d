export default class NetworkSystem {
  constructor() {
    this.connected = false;
    this.clients = [];
    this.clientData = [{}];
    this.synchronizer = null;
    this.connectHandler = null;
    this.machine = {
      getState: () => {
        let state = this.engine.getState();
        return state.concat([this.clients, this.clientData]);
      },
      loadState: (state) => {
        this.clients = state[state.length - 2];
        this.clientData = state[state.length - 1];
        this.engine.stop();
        this.engine.actions.external.load(state);
        this.engine.start();
      },
      run: (action) => {
        // Remap arg
        let args = action.args.map(v => {
          if (v != null && v.__entity != null) {
            return this.engine.state.entities[v.__entity];
          }
          return v;
        });
        this.engine.actions.external.executeLocal.raw(args);
      }
    };
    this.hooks = {
      'network.disconnect:post!': ([clientId]) => {
        this.networkFamily.entities.forEach(entity => {
          if (entity.networkTemporary.owner === clientId) {
            this.engine.actions.entity.delete(entity);
          }
        });
      },
      'external.load:post!': () => {
        this.networkFamily.entities.forEach(entity => {
          if (this.getData(entity.networkTemporary.owner) == null) {
            this.engine.actions.entity.delete(entity);
          }
        });
      },
      'external.start:post@100!': () => {
        if (this.synchronizer == null) {
          this.engine.actions.network.connect(this.getId());
        }
      },
      'external.execute:pre!': (args) => {
        if (this.synchronizer == null) return args;
        // Send it to the engine, while mapping the entity
        this.synchronizer.push({
          args: args.map(v => {
            if (v && v.id != null && this.engine.state.entities[v.id] === v) {
              return {
                __entity: v.id
              };
            }
            if (v instanceof Float32Array) {
              let a = [];
              for (let i = 0; i < v.length; ++i) {
                a[i] = v[i];
              }
              return a;
            }
            return v;
          })
        });
        return null;
      }
    };
  }
  getData(id) {
    return this.clientData[id];
  }
  getId() {
    if (this.synchronizer == null) return 0;
    if (this.synchronizer.meta == null) return 0;
    // Use upstream client ID
    return this.synchronizer.meta.id;
  }
  setSynchronizer(synchronizer) {
    this.synchronizer = synchronizer;
  }
  attach(engine) {
    this.engine = engine;
    this.networkFamily = this.engine.systems.family.get('networkTemporary');
    // NetworkSystem doesn't handle ticks and stuff - it should be done by
    // client entry code.
  }
  connect(endpoint) {
    if (this.synchronizer != null) this.disconnect();
    this.synchronizer = this.connectHandler(this.engine, endpoint);
    this.engine.actions.network.disconnectSelf();
  }
  disconnect() {
    this.synchronizer.removeAllListeners();
    this.synchronizer.connector.disconnect();
    this.synchronizer = null;
    this.engine.actions.network.disconnectSelf();
    // Simulate 'connecting to server'
    this.engine.actions.external.stop(true);
    this.clients = [];
    this.clientData = [];
    this.engine.actions.external.load(this.engine.getState());
    this.engine.actions.external.start(true);
  }
}
