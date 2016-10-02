import { Engine } from 'fudge';

import transform from './component/transform';
import MatrixSystem from './system/matrix';

let engine = new Engine({
  transform
}, {
  matrix: MatrixSystem,
  test: function TestSystem (engine) {
    this.entities = engine.systems.family.get('transform').entities;
    this.hooks = {
      'external.start': () => {
        engine.actions.entity.create({
          transform: {}
        });
      },
      'external.update': (delta) => {
        this.entities.forEach(entity => {
          engine.actions.transform.translate(entity, [delta, 0, 0]);
        });
      },
      'transform.*:post@150': (entity) => {
        console.log(engine.systems.matrix.get(entity));
      }
    };
  }
});

console.log(engine);

engine.start();
engine.update(1);
engine.update(1);
engine.update(1);
engine.update(1);
console.log(engine.getState());

engine.stop();
