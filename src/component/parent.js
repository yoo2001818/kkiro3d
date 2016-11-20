import { signalRaw } from 'fudge';

export default {
  component: -1,
  schema: {
    parent: {
      type: 'entity',
      getValue: (entity) => entity.parent,
      setValue: (entity, value) => ['parent.set', entity, value]
    },
  },
  actions: {
    set: signalRaw(([entity, parent]) => {
      entity.parent = (parent != null && parent.id != null) ?
        parent.id : parent;
    }),
    createHierarchy: function (entities) {
      let ids = [];
      let rootEntity;
      // Spawn each entity, while restoring parent pointers
      entities.forEach((template, i) => {
        // Get rid of ID
        let templateCopy = Object.assign({}, template, {
          id: null
        });
        if (i > 0) templateCopy.parent = ids[template.parent];
        let entity = this.actions.entity.create(templateCopy);
        if (i === 0) rootEntity = entity;
        ids[i] = entity.id;
      });
      return rootEntity;
    },
    deleteHierarchy: function (entity) {
      const traverseEntity = (entity) => {
        let children = this.systems.parent.getChildren(entity);
        if (children == null) return this.actions.entity.delete(entity);
        children.slice().forEach(id => {
          let child = this.state.entities[id];
          traverseEntity(child);
        });
        this.actions.entity.delete(entity);
      };
      traverseEntity(entity);
    }
  }
};
