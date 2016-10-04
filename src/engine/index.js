import * as components from '../component';
import * as systems from '../system';

import { Engine } from 'fudge';

export default function createEngine(compAdds, sysAdds) {
  return new Engine(
    Object.assign({}, components, compAdds),
    Object.assign({}, systems, sysAdds)
  );
}
