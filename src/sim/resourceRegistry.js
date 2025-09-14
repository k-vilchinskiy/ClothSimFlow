export class ResourceRegistry {
  constructor() { this.map = new Map(); }
  ensure(id) { if (!this.map.has(id)) this.map.set(id, { value: null }); }
  set(id, value) { this.ensure(id); this.map.get(id).value = value; }
  get(id) { return this.map.get(id); }
  clear() { this.map.clear(); }
}

