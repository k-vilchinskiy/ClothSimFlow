import { earclipTriangulate } from '../../../util/earclip.js';
import { computeFlatNormals, computeAABB, ensureUpwardNormals } from '../../../util/geometry.js';

// Inputs: Geom.Polygon2D { type:'polygon2D', points:[[x,z], ...] }
// Output: Geom.MeshTri at y=0
export class MeshingTriangulatePolygon {
  constructor(id, params={}) { this.id=id; this.params=params; this.initialized=false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) {
    const poly = inputs[0];
    if (!poly || poly.type !== 'polygon2D' || !poly.points?.length) throw new Error('Meshing.TriangulatePolygon: invalid input');
    const points = poly.points;
    const indices = earclipTriangulate(points);
    const positions = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) { positions[3*i] = points[i][0]; positions[3*i+1] = 0; positions[3*i+2] = points[i][1]; }
    const normals = computeFlatNormals(positions, indices);
    ensureUpwardNormals(positions, indices, normals);
    const bounds = computeAABB(positions);
    return { type:'meshTri', positions, indices, normals, bounds };
  }
}
