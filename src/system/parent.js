export default class ParentSystem {
  constructor() {
    // It's actually list of children... so... 'childrens' is right? Maybe?
    this.childrens = [];
    this.hooks = {
      'parent.*!': ([entity, parent]) => {
        this.removeChild(entity.parent, entity.id);
        this.addChild(parent, entity.id);
      }
    };
  }
  attach(engine) {
    this.engine = engine;
    this.family = engine.systems.family.get('parent');
    this.family.onAdd.addRaw(([entity]) => {
      this.addChild(entity.parent, entity.id);
    });
    this.family.onRemove.addRaw(([entity]) => {
      this.removeChild(entity.parent, entity.id);
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
}
