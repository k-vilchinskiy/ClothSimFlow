import cdt2d from 'cdt2d';
import { poissonDiskInPolygon } from '../../../util/poisson.js';
import { computeFlatNormals, computeAABB, ensureUpwardNormals } from '../../../util/geometry.js';

// Constrained Delaunay Triangulation of polygon with optional interior Poisson Steiner points
export class MeshingPolygonCDT {
  constructor(id, params={}) { this.id=id; this.params=params; this.initialized=false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) {
    const poly = inputs[0];
    if (!poly || poly.type !== 'polygon2D' || !poly.points?.length) throw new Error('Meshing.Polygon.CDT: invalid input');
    const radius = params.radius != null ? Number(params.radius) : null;
    const verts = poly.points.slice();
    // Optional interior steiner points for irregularity
    if (radius && radius > 0) {
      const steiner = poissonDiskInPolygon(poly.points, Math.max(1e-5, radius));
      for (const p of steiner) verts.push([p[0], p[1]]);
    }
    // Constraints: boundary edges between original polygon vertices (first N verts)
    const N = poly.points.length;
    const edges = [];
    for (let i=0;i<N;i++) edges.push([i, (i+1)%N]);
    // CDT
    const tris = cdt2d(verts, edges, { exterior: false, delaunay: true });
    const positions = new Float32Array(verts.length * 3);
    for (let i=0;i<verts.length;i++){ positions[3*i]=verts[i][0]; positions[3*i+1]=0; positions[3*i+2]=verts[i][1]; }
    const indices = new Uint32Array(tris.length * 3);
    for (let i=0;i<tris.length;i++){ const t=tris[i]; indices[3*i]=t[0]; indices[3*i+1]=t[1]; indices[3*i+2]=t[2]; }
    const normals = computeFlatNormals(positions, indices);
    ensureUpwardNormals(positions, indices, normals);
    const bounds = computeAABB(positions);
    return { type:'meshTri', positions, indices, normals, bounds };
  }
}

