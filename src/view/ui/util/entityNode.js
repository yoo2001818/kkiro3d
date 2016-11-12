export function createEntityNode(engine, filter, entity, override) {
  // Create entity hierarchy
  let { childrens } = engine.systems.parent;
  let children = childrens[entity.id];
  let entities = engine.state.entities;
  let matched = filter(entity);
  if (children == null || children.length === 0) {
    if (!override && filter != null && !matched) return null;
    return {
      id: entity.id,
      name: entity.name || ('Unnamed ' + entity.id),
      matched: matched
    };
  }
  let nodes = [];
  for (let i = 0; i < children.length; ++i) {
    let child = entities[children[i]];
    if (child == null) continue;
    let childNode = createEntityNode(engine, filter, child,
      override || matched);
    if (childNode == null) continue;
    nodes.push(childNode);
  }
  if (nodes.length === 0) return null;
  return {
    id: entity.id,
    name: entity.name || ('Unnamed ' + entity.id),
    children: nodes,
    matched: matched
  };
}

export default function createHierarchy(engine, filter) {
  let { root, orphans } = engine.systems.parent;
  let entities = engine.state.entities;
  let nodes = [];
  for (let i = 0; i < root.length; ++i) {
    let child = entities[root[i]];
    if (child == null) continue;
    let childNode = createEntityNode(engine, filter, child);
    if (childNode == null) continue;
    nodes.push(childNode);
  }
  for (let i = 0; i < orphans.length; ++i) {
    let child = entities[orphans[i]];
    if (child == null) continue;
    let childNode = createEntityNode(engine, filter, child);
    if (childNode == null) continue;
    childNode.orphan = true;
    nodes.push(childNode);
  }
  return nodes;
}
