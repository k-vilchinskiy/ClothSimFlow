export class AccelAABBGrid {
  constructor(id, params={}) { this.id=id; this.params=params; this.initialized=false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) {
    // TODO: Build uniform grid from meshTri
    return { type:'accel.grid', cellSize: params.cellSize ?? 0.1, cells: null, index: null };
  }
}

