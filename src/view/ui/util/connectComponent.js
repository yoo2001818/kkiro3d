import connect from './connect';

const VALIDATOR = ([entity], { entity: propEntity }) =>
  entity === propEntity;

// Whyyyy
export default function connectComponent(actions, validator = VALIDATOR) {
  let actionTable = {};
  actions.forEach(v => actionTable[v] = validator);
  return connect(actionTable, (engine, { entity: propEntity }) => ({
    // This happens because fudge objects are mutable :/
    entity: propEntity,
    execute: engine.actions.external.execute,
    executeLocal: engine.actions.external.executeLocal,
    engine
  }), undefined, {
    pure: true, updateEvent: 'external.domRender:post'
  });
}
