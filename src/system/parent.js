export default class ParentSystem {
  constructor() {
    // Entities that doesn't have a parent.
    this.root = [];
    // It's actually list of children... so... 'childrens' is right? Maybe?
    this.childrens = [];
    // List of entities with wrong parent ID
    this.orphans = [];
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
  isConnected(parent, child) {
    if (child === parent) return true;
    if (parent == null || child == null) return false;
    if (child.parent == null) return false;
    return this.isConnected(parent, this.engine.state.entities[child.parent]);
  }
}
