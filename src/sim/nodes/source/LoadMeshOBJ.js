import { parseOBJ } from '../../../util/obj.js';
import { computeFlatNormals, computeAABB, ensureUpwardNormals } from '../../../util/geometry.js';

export class LoadMeshOBJ {
  constructor(id, params={}) { this.id = id; this.params = params; this.initialized = false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) {
    const url = params.url;
    if (!url) throw new Error('LoadMeshOBJ: params.url is required');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`LoadMeshOBJ: failed to fetch ${url}: ${res.status}`);
    const text = await res.text();
    const { positions, indices } = parseOBJ(text);
    const normals = computeFlatNormals(positions, indices);
    // Do not force upward normals for full 3D OBJ globally; still safe to ensure non-negative avgY for mostly planar meshes
    ensureUpwardNormals(positions, indices, normals);
    const bounds = computeAABB(positions);
    return { type: 'meshTri', positions, indices, normals, bounds };
  }
}
