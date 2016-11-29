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
      let createdEntities = [];
      let rootEntity;
      // Spawn each entity, while restoring parent pointers
      entities.forEach((template, i) => {
        // Get rid of ID
        let templateCopy = Object.assign({}, template, {
          id: null
        });
        if (i > 0) templateCopy.parent = createdEntities[template.parent].id;
        let entity = this.actions.entity.create(templateCopy);
        if (i === 0) rootEntity = entity;
        createdEntities[i] = entity;
      });
      // Then restore other data types.
      createdEntities.forEach(entity => {
        for (let key in entity) {
          let parentFields = this.systems.parent.getParentFields(key);
          if (parentFields == null) continue;
          let component = entity[key];
          let applied = {};
          let changed = false;
          parentFields.forEach(v => {
            let id = component[v];
            if (isNaN(id) || id >= -1) return;
            id = -id - 2;
            applied[v] = createdEntities[id].id;
            changed = true;
          });
          // Then.... apply it.
          if (changed) this.actions[key].set(entity, applied);
        }
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
