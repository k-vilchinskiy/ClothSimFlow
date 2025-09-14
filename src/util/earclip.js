// Minimal ear-clipping triangulation for a simple, non-self-intersecting polygon (no holes).
// Input: points = [[x,z], ...] in CCW order preferred.
// Output: Uint32Array of indices into points forming triangles.
export function earclipTriangulate(points) {
  const n = points.length;
  if (n < 3) return new Uint32Array();
  const idx = new Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;

  function area2(a, b, c) {
    return (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0]);
  }
  // Ensure CCW
  let A = 0;
  for (let i = 0; i < n; i++) {
    const p = points[i], q = points[(i+1)%n];
    A += p[0]*q[1] - q[0]*p[1];
  }
  const ccw = A > 0;
  if (!ccw) idx.reverse();

  const out = [];
  let guard = 0;
  function isPointInTri(p, a, b, c) {
    const s1 = area2(a,b,p); if (s1 < 0) return false;
    const s2 = area2(b,c,p); if (s2 < 0) return false;
    const s3 = area2(c,a,p); if (s3 < 0) return false;
    return true;
  }
  while (idx.length > 2 && guard++ < 10000) {
    let clipped = false;
    for (let i = 0; i < idx.length; i++) {
      const i0 = idx[(i - 1 + idx.length) % idx.length];
      const i1 = idx[i];
      const i2 = idx[(i + 1) % idx.length];
      const a = points[i0], b = points[i1], c = points[i2];
      // convex?
      if (area2(a,b,c) <= 0) continue;
      // contain any other point?
      let ok = true;
      for (let k = 0; k < idx.length; k++) {
        const ik = idx[k]; if (ik === i0 || ik === i1 || ik === i2) continue;
        if (isPointInTri(points[ik], a, b, c)) { ok = false; break; }
      }
      if (!ok) continue;
      out.push(i0, i1, i2);
      idx.splice(i,1);
      clipped = true;
      break;
    }
    if (!clipped) break; // probably self-intersecting
  }
  return new Uint32Array(out);
}

