export class AccelBVH {
  constructor(id, params={}) { this.id=id; this.params=params; this.initialized=false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) {
    // TODO: Build BVH structure from meshTri
    return { type:'accel.bvh', nodes: null, leaves: null, bounds: null };
  }
}

