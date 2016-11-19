export function createEntityNode(engine, filter, open, nodes, level, entity,
  override, orphan
) {
  // Create entity hierarchy
  let { childrens } = engine.systems.parent;
  let children = childrens[entity.id];
  let entities = engine.state.entities;
  let matched = filter(entity);
  if (children == null || children.length === 0) {
    if (!override && filter != null && !matched) return false;
    nodes.push({
      id: entity.id,
      name: entity.name || ('Unnamed ' + entity.id),
      matched: matched,
      open: open[entity.id],
      orphan, level
    });
    return true;
  }
  let childrenNodes = [];
  for (let i = 0; i < children.length; ++i) {
    let child = entities[children[i]];
    if (child == null) continue;
    createEntityNode(engine, filter, open, childrenNodes, level + 1, child,
      override || matched);
  }
  if (childrenNodes.length === 0) return false;
  nodes.push({
    id: entity.id,
    name: entity.name || ('Unnamed ' + entity.id),
    orphan, level,
    open: open[entity.id],
    matched: matched,
    parent: true
  });
  if (!open[entity.id]) return true;
  for (let i = 0; i < childrenNodes.length; ++i) {
    nodes.push(childrenNodes[i]);
  }
  return true;
}

export default function createHierarchy(engine, filter, open) {
  let { root, orphans } = engine.systems.parent;
  let entities = engine.state.entities;
  let nodes = [];
  for (let i = 0; i < root.length; ++i) {
    let child = entities[root[i]];
    if (child == null) continue;
    createEntityNode(engine, filter, open, nodes, 0, child);
  }
  for (let i = 0; i < orphans.length; ++i) {
    let child = entities[orphans[i]];
    if (child == null) continue;
    createEntityNode(engine, filter, open, nodes, 0, child, false, true);
  }
  return nodes;
}
