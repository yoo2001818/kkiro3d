export default class NetworkSystem {
  constructor() {
    this.connected = false;
    this.clients = [];
    this.synchronizer = null;
    this.machine = {
      getState: () => {
        let state = this.engine.getState();
        return state.concat([this.clients]);
      },
      loadState: (state) => {
        this.engine.stop();
        this.engine.actions.external.load(state);
        this.engine.start();
        this.clients = state[state.length - 1];
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
  getId() {
    if (this.synchronizer == null) return 0;
    // Use upstream client ID
    return this.synchronizer.meta.id;
  }
  setSynchronizer(synchronizer) {
    this.synchronizer = synchronizer;
  }
  attach(engine) {
    this.engine = engine;
    // NetworkSystem doesn't handle ticks and stuff - it should be done by
    // client entry code.
  }
}
