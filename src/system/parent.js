export default class ParentSystem {
  constructor() {
    // Entities that doesn't have a parent.
    this.root = [];
    // It's actually list of children... so... 'childrens' is right? Maybe?
    this.childrens = [];
    this.hooks = {
      'external.load!': () => {
        this.root = [];
        this.childrens = [];
      },
      'entity.create:post!': (args) => {
        let entity = args[args.length - 1];
        if (entity.parent == null) this.addRoot(entity.id);
      },
      'entity.delete!': ([entity]) => {
        if (entity.parent == null) this.removeRoot(entity.id);
      },
      'entity.add.parent:post!': ([entity]) => {
        this.addChild(entity.parent, entity.id);
        this.removeRoot(entity.id);
      },
      'entity.remove.parent!': ([entity, deleting]) => {
        this.removeChild(entity.parent, entity.id);
        if (!deleting) this.addRoot(entity.id);
      },
      'parent.*!': ([entity, parent]) => {
        this.removeChild(entity.parent, entity.id);
        this.addChild(parent, entity.id);
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
  addChild(parent, child) {
    if (parent === -1) return;
    let children = this.childrens[parent];
    if (children == null) {
      children = this.childrens[parent] = [];
    }
    // It must be guarrented that it should only be called once
    children.push(child);
  }
  removeChild(parent, child) {
    if (parent === -1) return;
    let children = this.childrens[parent];
    if (children == null) return;
    let index = children.indexOf(child);
    if (index === -1) return;
    children.splice(index, 1);
    if (children.length === 0) delete this.childrens[parent];
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
