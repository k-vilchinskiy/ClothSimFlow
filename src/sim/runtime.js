import { ResourceRegistry } from './resourceRegistry.js';

export function createRuntime(ctxExtras = {}) {
  const nodeTypes = new Map();
  const registry = new ResourceRegistry();
  const ctx = { registry, ...ctxExtras };
  let graph = null;
  let order = [];
  let nodesById = new Map();

  function register(type, klass) { nodeTypes.set(type, klass); }

  function makeNode(def) {
    const T = nodeTypes.get(def.type);
    if (!T) throw new Error(`Unknown node type: ${def.type}`);
    return new T(def.id, def.params || {});
  }

  function topoSort(nodesDefs) {
    const idToIdx = new Map(nodesDefs.map((n, i) => [n.id, i]));
    const indeg = new Array(nodesDefs.length).fill(0);
    const adj = nodesDefs.map(() => []);
    for (let i = 0; i < nodesDefs.length; i++) {
      const inputs = nodesDefs[i].inputs || [];
      for (const inp of inputs) {
        const j = idToIdx.get(inp);
        if (j === undefined) throw new Error(`Input node not found: ${inp}`);
        adj[j].push(i);
        indeg[i]++;
      }
    }
    const q = [];
    for (let i = 0; i < indeg.length; i++) if (indeg[i] === 0) q.push(i);
    const orderIdx = [];
    while (q.length) {
      const u = q.shift();
      orderIdx.push(u);
      for (const v of adj[u]) { if (--indeg[v] === 0) q.push(v); }
    }
    if (orderIdx.length !== nodesDefs.length) throw new Error('Graph has cycles');
    return orderIdx.map(i => nodesDefs[i].id);
  }

  async function loadGraph(obj) {
    graph = obj;
    nodesById = new Map();
    // Clear previous view contents if viewer present
    if (ctx.view && typeof ctx.view.clearAll === 'function') {
      ctx.view.clearAll();
    }
    // Create node instances
    for (const nd of obj.nodes) {
      if (!nd.id || !nd.type) throw new Error('Node missing id/type');
      nodesById.set(nd.id, makeNode(nd));
    }
    // Build topo order
    order = topoSort(obj.nodes);
    // Init nodes
    for (const id of order) {
      const nd = nodesById.get(id);
      if (!nd.initialized && nd.init) await nd.init(ctx);
      nd.initialized = true;
    }
    // Prime registry
    registry.clear();
    for (const ndDef of obj.nodes) registry.ensure(ndDef.id);
  }

  async function evaluateAll() {
    if (!graph) throw new Error('Graph not loaded');
    // Evaluate in topo order
    const defs = new Map(graph.nodes.map(n => [n.id, n]));
    for (const id of order) {
      const nd = nodesById.get(id);
      const def = defs.get(id);
      const inputs = (def.inputs || []).map(inpId => registry.get(inpId)?.value);
      if (nd.evaluate) {
        const out = await nd.evaluate(ctx, inputs, def.params || {}, graph.params || {});
        registry.set(id, out);
      } else {
        registry.set(id, null);
      }
    }
  }

  return { register, loadGraph, evaluateAll, ctx, registry };
}
