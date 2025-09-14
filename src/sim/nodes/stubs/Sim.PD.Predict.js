export class SimPD_Predict {
  constructor(id, params={}) { this.id=id; this.params=params; this.initialized=false; }
  async init(ctx) { this.initialized = true; /* TODO: allocate GPU buffers */ }
  async evaluate(ctx, inputs, params) {
    // TODO: predict x from x,v
    return { type:'sim.buffers' };
  }
}

