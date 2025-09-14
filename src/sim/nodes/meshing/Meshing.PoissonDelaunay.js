import { poissonDisk } from '../../../util/poisson.js';
import { delaunayTriangulate } from '../../../util/delaunay.js';
import { computeFlatNormals, computeAABB } from '../../../util/geometry.js';

export class MeshingPoissonDelaunay {
  constructor(id, params={}) { this.id = id; this.params = params; this.initialized = false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) {
    const src = inputs[0];
    if (!src) throw new Error('Meshing.PoissonDelaunay: missing input');
    if (src.type === 'surface' && src.basis === 'plane') {
      const [w, h] = src.size;
      const radius = Number(params.radius ?? 0.05);
      // Jitter not used in basic Bridson; relaxIters placeholder
      const samples = poissonDisk(w, h, Math.max(1e-3, radius));
      // Preserve exact rectangle boundary by seeding corner and edge points
      const halfW = w / 2, halfH = h / 2;
      const corners = [
        [-halfW, -halfH], [ halfW, -halfH], [ halfW,  halfH], [-halfW,  halfH]
      ];
      const edgeStep = Math.max(radius, Math.min(w, h) / 16);
      function addEdge(x0, y0, x1, y1) {
        const len = Math.hypot(x1-x0, y1-y0);
        const n = Math.max(1, Math.floor(len / edgeStep));
        for (let i = 1; i < n; i++) {
          const t = i / n; samples.push([x0 + t*(x1-x0), y0 + t*(y1-y0)]);
        }
      }
      // Add edges without duplicating corners (they'll be added separately)
      addEdge(-halfW, -halfH,  halfW, -halfH);
      addEdge( halfW, -halfH,  halfW,  halfH);
      addEdge( halfW,  halfH, -halfW,  halfH);
      addEdge(-halfW,  halfH, -halfW, -halfH);
      for (const c of corners) samples.push(c);
      // Centered around (0,0), matches plane origin
      const { positions, indices } = delaunayTriangulate(samples);
      const normals = computeFlatNormals(positions, indices);
      const bounds = computeAABB(positions);
      return { type: 'meshTri', positions, indices, normals, bounds };
    }
    // Fallback: return input if already a mesh
    if (src.type === 'meshTri') return src;
    throw new Error('Meshing.PoissonDelaunay: unsupported input type');
  }
}
