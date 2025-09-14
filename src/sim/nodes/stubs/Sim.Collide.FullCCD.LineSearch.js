export class SimCollide_FullCCD_LineSearch {
  constructor(id, params={}) { this.id=id; this.params=params; this.initialized=false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) { return inputs[0] ?? null; }
}

