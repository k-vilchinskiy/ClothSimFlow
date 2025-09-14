export class SimPD_GlobalSolve_ModalReuse {
  constructor(id, params={}) { this.id=id; this.params=params; this.initialized=false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) { return inputs[0] ?? null; }
}

