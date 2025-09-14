import { applyTRS, computeFlatNormals, computeAABB, triangulateRegularGrid, ensureUpwardNormals } from '../../../util/geometry.js';

export class MeshTransform {
  constructor(id, params={}) { this.id = id; this.params = params; this.initialized = false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) {
    const src = inputs[0];
    if (!src) throw new Error('Mesh.Transform: missing input');
    const t = params.translate || [0,0,0];
    const r = params.rotate || [0,0,0];
    const s = params.scale || [1,1,1];
    // Handle surface: generate a regular grid mesh and apply TRS so XForm affects visualization
    if (src.type === 'surface') {
      const mesh = triangulateRegularGrid(src, 32, 32);
      const positions = new Float32Array(mesh.positions);
      applyTRS(positions, t, r, s);
      const indices = mesh.indices;
      const normals = computeFlatNormals(positions, indices);
      ensureUpwardNormals(positions, indices, normals);
      const bounds = computeAABB(positions);
      return { type: 'meshTri', positions, indices, normals, bounds };
    }
    if (src.type === 'meshTri') {
      const positions = new Float32Array(src.positions); // copy
      applyTRS(positions, t, r, s);
      const indices = new Uint32Array(src.indices);
      const normals = computeFlatNormals(positions, indices);
      ensureUpwardNormals(positions, indices, normals);
      const bounds = computeAABB(positions);
      return { type: 'meshTri', positions, indices, normals, bounds };
    }
    return src;
  }
}
