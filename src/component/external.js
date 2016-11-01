import { signalRaw } from 'fudge';

export default {
  actions: {
    execute: signalRaw(function (args) {
      // Global action, will be 'tripped' and inspected by the connector
      this.actions.external.executeLocal.raw(args);
    }, func => args => func(['execute'].concat(args))),
    executeLocal: signalRaw(function ([command, ...args]) {
      let commands = command.split('.');
      let node = this.actions;
      commands.forEach(v => {
        node = node[v];
        if (node == null) throw new Error(command + ' not found');
      });
      if (node.raw) return node.raw(args);
      return node.apply(node, args);
    }, func => args => func(['executeLocal'].concat(args))),
    render: signalRaw(() => {},
      func => args => func(['render'].concat(args))),
    domRender: signalRaw(() => {},
      func => args => func(['domRender'].concat(args)))
  }
};
