export class SimCollide_BroadPhase {
  constructor(id, params={}) { this.id=id; this.params=params; this.initialized=false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) { return { type:'sim.candidates' }; }
}

