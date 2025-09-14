export function pointInPolygon(pt, poly) {
  // poly: [[x,z], ...] simple polygon; ray casting
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], zi = poly[i][1];
    const xj = poly[j][0], zj = poly[j][1];
    const intersect = ((zi > pt[1]) !== (zj > pt[1])) &&
      (pt[0] < (xj - xi) * (pt[1] - zi) / (zj - zi + 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function polygonBounds(poly) {
  let minx = Infinity, minz = Infinity, maxx = -Infinity, maxz = -Infinity;
  for (const p of poly) {
    if (p[0] < minx) minx = p[0]; if (p[0] > maxx) maxx = p[0];
    if (p[1] < minz) minz = p[1]; if (p[1] > maxz) maxz = p[1];
  }
  return { min: [minx, minz], max: [maxx, maxz], width: maxx - minx, height: maxz - minz };
}

function orient(a,b,c) {
  const v = (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0]);
  return Math.sign(v);
}
function onSeg(a,b,p) {
  return Math.min(a[0],b[0]) - 1e-9 <= p[0] && p[0] <= Math.max(a[0],b[0]) + 1e-9 &&
         Math.min(a[1],b[1]) - 1e-9 <= p[1] && p[1] <= Math.max(a[1],b[1]) + 1e-9;
}
export function segmentsIntersectProper(a,b,c,d) {
  // Proper (non-collinear) intersection test; returns true only when segments cross at interior points
  const o1 = orient(a,b,c), o2 = orient(a,b,d), o3 = orient(c,d,a), o4 = orient(c,d,b);
  return (o1 * o2 < 0) && (o3 * o4 < 0);
}
