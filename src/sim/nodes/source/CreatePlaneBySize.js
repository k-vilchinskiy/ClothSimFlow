import { makePlaneSurface } from '../../../util/geometry.js';

export class CreatePlaneBySize {
  constructor(id, params={}) { this.id = id; this.params = params; this.initialized = false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) {
    const w = Number(params.w ?? 1.0);
    const h = Number(params.h ?? 1.0);
    return makePlaneSurface(w, h);
  }
}

