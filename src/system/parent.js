export default class ParentSystem {
  constructor() {
    // Entities that doesn't have a parent.
    this.root = [];
    // It's actually list of children... so... 'childrens' is right? Maybe?
    this.childrens = [];
    // List of entities with wrong parent ID
    this.orphans = [];
    // Components with entity schema. This'll be generated automatically when
    // getHierarchy, createHierarchy is called.
    this.parentFields = {};
    this.hooks = {
      'external.load!': () => {
        this.root = [];
        this.childrens = [];
      },
      'entity.create:post!': (args) => {
        let entity = args[args.length - 1];
        if (entity.parent == null || entity.parent === -1) {
          this.addRoot(entity.id);
        }
        this.addParent(entity.id);
      },
      'entity.delete!': ([entity]) => {
        if (entity.parent == null || entity.parent === -1) {
          this.removeRoot(entity.id);
        }
        this.removeParent(entity.id);
      },
      'entity.add.parent:post!': ([entity]) => {
        this.addChild(entity.parent, entity.id);
        if (entity.parent !== -1) this.removeRoot(entity.id);
      },
      'entity.remove.parent!': ([entity, deleting]) => {
        this.removeChild(entity.parent, entity.id);
        if (!deleting && entity.parent !== -1) this.addRoot(entity.id);
      },
      'parent.*!': ([entity, parent]) => {
        this.removeChild(entity.parent, entity.id);
        this.addChild(parent, entity.id);
        if (entity.parent === -1 && parent !== -1) this.removeRoot(entity.id);
        if (entity.parent !== -1 && parent === -1) this.addRoot(entity.id);
      }
    };
  }
  attach(engine) {
    this.engine = engine;
  }
  getParentFields(name) {
    if (name === 'parent') return null;
    if (this.parentFields[name] !== undefined) return this.parentFields[name];
    let fields = [];
    this.parentFields[name] = null;
    // Retrieve schema of the component
    let metadata = this.engine.components.store[name];
    if (metadata == null) return;
    if (metadata.data == null) return;
    if (metadata.data.schema == null) return;
    let schema = metadata.data.schema;
    for (let key in schema) {
      if (schema[key].type === 'entity') fields.push(key);
    }
    if (fields.length > 0) {
      this.parentFields[name] = fields;
      return fields;
    } else {
      return null;
    }
  }
  addRoot(entity) {
    this.root.push(entity);
  }
  removeRoot(entity) {
    let index = this.root.indexOf(entity);
    if (index === -1) return;
    this.root.splice(index, 1);
  }
  addParent(parent) {
    let children = this.childrens[parent];
    if (children == null) return;
    // Remove children from orphan list.
    // TODO Is there a way to reduce from O(nk)?
    children.forEach(id => {
      let index = this.orphans.indexOf(id);
      if (index === -1) return;
      this.orphans.splice(index, 1);
    });
  }
  removeParent(parent) {
    // Add children to orphan list.
    let children = this.childrens[parent];
    if (children == null) return;
    children.forEach(id => {
      this.orphans.push(id);
    });
  }
  addChild(parent, child) {
    if (parent === -1) return;
    let children = this.childrens[parent];
    if (children == null) {
      children = this.childrens[parent] = [];
    }
    // It must be guarrented that it should only be called once
    children.push(child);
    // Validate if the parent exists
    if (this.engine.state.entities[parent] == null) {
      this.orphans.push(child);
    }
  }
  removeChild(parent, child) {
    if (parent === -1) return;
    let children = this.childrens[parent];
    if (children == null) return;
    let index = children.indexOf(child);
    if (index !== -1) children.splice(index, 1);
    if (children.length === 0) delete this.childrens[parent];
    // If parent is not available, remove from orphan list
    if (this.engine.state.entities[parent] == null) {
      let index = this.orphans.indexOf(child);
      if (index !== -1) this.orphans.splice(index, 1);
    }
  }
  getChildren(parent) {
    return this.childrens[parent.id];
  }
  // This shouldn't reside in here, but whatever.
  getHierarchy(entity) {
    // :S
    let reverseLookup = {};
    let entities = [];
    const traverseEntity = (entity, parentId) => {
      let newId = entities.length;
      if (parentId != null) {
        entities.push(Object.assign({}, entity, {
          parent: parentId
        }));
      } else {
        entities.push(Object.assign({}, entity));
      }
      reverseLookup[entity.id] = entities.length - 1;
      let children = this.getChildren(entity);
      if (children == null) return;
      children.forEach(id => {
        let child = this.engine.state.entities[id];
        traverseEntity(child, newId);
      });
    };
    traverseEntity(entity, null);
    // We need traverse each entity and detect parent fields, then change them
    // to relative IDs.
    // TODO Isn't this horribly slow?
    entities.forEach(entity => {
      for (let key in entity) {
        let parentFields = this.getParentFields(key);
        if (parentFields == null) continue;
        let component = Object.assign({}, entity[key]);
        entity[key] = component;
        parentFields.forEach(v => {
          if (reverseLookup[component[v]] != null) {
            // Flip the sign to indicate that it's relative. Additionally,
            // subtract 2 to prevent problems.
            component[v] = -2 - reverseLookup[component[v]];
          }
        });
      }
    });
    return entities;
  }
  isConnected(parent, child) {
    if (child === parent) return true;
    if (parent == null || child == null) return false;
    if (child.parent == null) return false;
    return this.isConnected(parent, this.engine.state.entities[child.parent]);
  }
}
