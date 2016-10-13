import connect from './connectFudge';

const ACTION_VALIDATOR = ([entity], { entity: propEntity }) =>
  entity === propEntity;

// Whyyyy
export default function connectComponent(actions) {
  let actionTable = {};
  actions.forEach(v => actionTable[v] = ACTION_VALIDATOR);
  return connect(actionTable, (engine, { entity: propEntity }) => ({
    // This happens because fudge objects are mutable :/
    entity: propEntity,
    execute: engine.actions.external.execute
  }));
}
