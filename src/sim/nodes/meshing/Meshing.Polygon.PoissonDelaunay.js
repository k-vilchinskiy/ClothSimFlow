import Delaunator from 'delaunator';
import { poissonDiskInPolygon } from '../../../util/poisson.js';
import { computeFlatNormals, computeAABB, ensureUpwardNormals } from '../../../util/geometry.js';
import { polygonBounds, pointInPolygon, segmentsIntersectProper } from '../../../util/polygon.js';

export class MeshingPolygonPoissonDelaunay {
  constructor(id, params={}) { this.id=id; this.params=params; this.initialized=false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) {
    const poly = inputs[0];
    if (!poly || poly.type !== 'polygon2D' || !poly.points?.length) throw new Error('Meshing.Polygon.PoissonDelaunay: invalid input');
    const radius = Number(params.radius ?? 0.05);
    const samples = poissonDiskInPolygon(poly.points, Math.max(1e-5, radius));
    // Densify boundary to encourage Delaunay to keep edges along the contour
    const stepBase = Math.max(1e-6, radius * 0.6);
    const bnd = [];
    const N = poly.points.length;
    for (let i=0;i<N;i++) {
      const a = poly.points[i]; const b = poly.points[(i+1)%N];
      const dx = b[0]-a[0], dz = b[1]-a[1];
      const len = Math.hypot(dx, dz);
      const n = Math.max(2, Math.ceil(len / stepBase)); // include endpoints
      for (let k=0;k<n; k++) { const t=k/(n-1); bnd.push([a[0]+t*dx, a[1]+t*dz]); }
    }
    // Merge and dedup points
    const epsKey = 1e-6;
    const key = (p) => p[0].toFixed(6)+","+p[1].toFixed(6);
    const map = new Map();
    const pts = [];
    function addPoint(p){ const k=key(p); if(!map.has(k)){ map.set(k, pts.length); pts.push(p);} }
    for (const p of bnd) addPoint(p);
    for (const p of samples) addPoint(p);
    if (pts.length < 3) return { type:'meshTri', positions:new Float32Array(), indices:new Uint32Array(), normals:new Float32Array(), bounds:{min:[0,0,0],max:[0,0,0]} };
    // Delaunay triangulation
    const dela = Delaunator.from(pts, p => p[0], p => p[1]);
    const tri = dela.triangles;
    // Filter triangles: centroid inside and edges not crossing polygon boundary (properly)
    const indicesArr = [];
    const eps = 1e-9;
    const eq2 = (p,q) => Math.abs(p[0]-q[0])<eps && Math.abs(p[1]-q[1])<eps;
    function accept(ai,bi,ci) {
      const a=pts[ai], b=pts[bi], c=pts[ci];
      const cx=(a[0]+b[0]+c[0])/3, cz=(a[1]+b[1]+c[1])/3;
      if (!pointInPolygon([cx,cz], poly.points)) return false;
      for (let i=0;i<N;i++){
        const p0=poly.points[i], p1=poly.points[(i+1)%N];
        if (!(eq2(a,p0)||eq2(a,p1)||eq2(b,p0)||eq2(b,p1)) && segmentsIntersectProper(a,b,p0,p1)) return false;
        if (!(eq2(b,p0)||eq2(b,p1)||eq2(c,p0)||eq2(c,p1)) && segmentsIntersectProper(b,c,p0,p1)) return false;
        if (!(eq2(c,p0)||eq2(c,p1)||eq2(a,p0)||eq2(a,p1)) && segmentsIntersectProper(c,a,p0,p1)) return false;
      }
      return true;
    }
    for (let i=0;i<tri.length;i+=3){ const a=tri[i], b=tri[i+1], c=tri[i+2]; if (accept(a,b,c)) { indicesArr.push(a,b,c); } }
    const positions = new Float32Array(pts.length * 3);
    for (let i=0;i<pts.length;i++){ positions[3*i]=pts[i][0]; positions[3*i+1]=0; positions[3*i+2]=pts[i][1]; }
    const indices = new Uint32Array(indicesArr);
    const normals = computeFlatNormals(positions, indices);
    ensureUpwardNormals(positions, indices, normals);
    const bounds = computeAABB(positions);
    return { type:'meshTri', positions, indices, normals, bounds };
  }
}
