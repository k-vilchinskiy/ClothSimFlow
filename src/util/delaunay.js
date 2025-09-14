// Minimal Bowyer-Watson Delaunay triangulation in 2D for small point sets.
// Returns { positions:[x,y,z]*, indices:[...] } suitable for a flat Z=0 mesh.

function superTriangle(points) {
  // Compute bounding super-triangle
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) { if (p[0]<minX) minX=p[0]; if (p[0]>maxX) maxX=p[0]; if (p[1]<minY) minY=p[1]; if (p[1]>maxY) maxY=p[1]; }
  const dx = maxX - minX, dy = maxY - minY; const dmax = Math.max(dx, dy) * 10;
  const midx = (minX + maxX) / 2, midy = (minY + maxY) / 2;
  return [ [midx - dmax, midy - dmax], [midx, midy + dmax], [midx + dmax, midy - dmax] ];
}

function circumcircle(tri, p0, p1, p2) {
  const ax = p0[0], ay = p0[1], bx = p1[0], by = p1[1], cx = p2[0], cy = p2[1];
  const A = bx - ax, B = by - ay, C = cx - ax, D = cy - ay;
  const E = A*(ax+bx) + B*(ay+by);
  const F = C*(ax+cx) + D*(ay+cy);
  const G = 2*(A*(cy-by) - B*(cx-bx));
  let centerX, centerY, r2;
  if (Math.abs(G) < 1e-12) {
    // Collinear; choose large circle
    const minx = Math.min(ax, bx, cx), miny = Math.min(ay, by, cy);
    const maxx = Math.max(ax, bx, cx), maxy = Math.max(ay, by, cy);
    centerX = (minx + maxx)/2; centerY = (miny + maxy)/2;
    const dx = centerX - minx, dy = centerY - miny; r2 = dx*dx + dy*dy;
  } else {
    centerX = (D*E - B*F) / G;
    centerY = (A*F - C*E) / G;
    const dx = centerX - ax, dy = centerY - ay; r2 = dx*dx + dy*dy;
  }
  tri.cx = centerX; tri.cy = centerY; tri.r2 = r2; return tri;
}

function edgeKey(a, b) { return a < b ? `${a},${b}` : `${b},${a}`; }

export function delaunayTriangulate(points) {
  if (points.length < 3) return { positions: new Float32Array(), indices: new Uint32Array() };
  const pts = points.slice();
  const st = superTriangle(points);
  const stIdx = [pts.push(st[0]) - 1, pts.push(st[1]) - 1, pts.push(st[2]) - 1];
  let triangles = [ { a: stIdx[0], b: stIdx[1], c: stIdx[2] } ];
  circumcircle(triangles[0], pts[stIdx[0]], pts[stIdx[1]], pts[stIdx[2]]);

  for (let i = 0; i < points.length; i++) {
    const p = pts[i];
    const bad = [];
    for (const tri of triangles) {
      const dx = p[0] - tri.cx, dy = p[1] - tri.cy;
      if (dx*dx + dy*dy <= tri.r2) bad.push(tri);
    }
    const edgeCount = new Map();
    function addEdge(u, v) {
      const k = edgeKey(u, v); edgeCount.set(k, (edgeCount.get(k) || 0) + 1);
    }
    for (const tri of bad) { addEdge(tri.a, tri.b); addEdge(tri.b, tri.c); addEdge(tri.c, tri.a); }
    triangles = triangles.filter(t => bad.indexOf(t) === -1);
    for (const [k, c] of edgeCount) {
      if (c !== 1) continue; // shared, skip
      const [sa, sb] = k.split(',').map(n => parseInt(n, 10));
      const tri = { a: sa, b: sb, c: i };
      circumcircle(tri, pts[tri.a], pts[tri.b], pts[tri.c]);
      triangles.push(tri);
    }
  }
  // Remove triangles touching super-triangle vertices
  triangles = triangles.filter(t => t.a < points.length && t.b < points.length && t.c < points.length);
  // Enforce consistent CCW winding (so normals point +Y for XZ plane)
  const ccw = (ia, ib, ic) => {
    const a = points[ia], b = points[ib], c = points[ic];
    const area2 = (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0]);
    return area2 >= 0; // true if CCW or collinear
  };
  for (const t of triangles) {
    if (!ccw(t.a, t.b, t.c)) { const tmp = t.b; t.b = t.c; t.c = tmp; }
  }

  const positions = new Float32Array(points.length * 3);
  for (let i = 0; i < points.length; i++) { positions[3*i] = points[i][0]; positions[3*i+1] = 0; positions[3*i+2] = points[i][1]; }
  const indices = new Uint32Array(triangles.length * 3);
  for (let i = 0; i < triangles.length; i++) { const t = triangles[i]; indices[3*i] = t.a; indices[3*i+1] = t.b; indices[3*i+2] = t.c; }
  return { positions, indices };
}
