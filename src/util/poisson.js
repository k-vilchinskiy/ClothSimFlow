// Simple Poisson disk sampling (Bridson) in 2D rectangle [-w/2,w/2] x [-h/2,h/2]
export function poissonDisk(width, height, radius, k = 30, rng = Math.random) {
  const cellSize = radius / Math.SQRT2;
  const gridWidth = Math.ceil(width / cellSize);
  const gridHeight = Math.ceil(height / cellSize);
  const grid = new Array(gridWidth * gridHeight).fill(-1);
  const samples = [];
  const active = [];

  function gridIdx(x, y) { return y * gridWidth + x; }
  function toGrid(p) {
    const gx = Math.floor((p[0] + width/2) / cellSize);
    const gy = Math.floor((p[1] + height/2) / cellSize);
    return [
      Math.min(gridWidth - 1, Math.max(0, gx)),
      Math.min(gridHeight - 1, Math.max(0, gy)),
    ];
  }
  function inBounds(p) { return p[0] >= -width/2 && p[0] <= width/2 && p[1] >= -height/2 && p[1] <= height/2; }
  function dist2(a, b) { const dx=a[0]-b[0], dy=a[1]-b[1]; return dx*dx+dy*dy; }

  // Initial sample
  const p0 = [ (rng()-0.5)*width, (rng()-0.5)*height ];
  samples.push(p0); active.push(0);
  let g = toGrid(p0); grid[gridIdx(g[0], g[1])] = 0;

  while (active.length) {
    const aPos = (active.length * rng()) | 0; // position in active array
    const idx = active[aPos];                 // sample index
    const base = samples[idx];
    let found = false;
    for (let n = 0; n < k; n++) {
      const ang = 2*Math.PI*rng();
      const rad = radius * (1 + rng());
      const p = [ base[0] + rad*Math.cos(ang), base[1] + rad*Math.sin(ang) ];
      if (!inBounds(p)) continue;
      const [gx, gy] = toGrid(p);
      let ok = true;
      for (let yy = Math.max(gy-2,0); yy <= Math.min(gy+2, gridHeight-1); yy++) {
        for (let xx = Math.max(gx-2,0); xx <= Math.min(gx+2, gridWidth-1); xx++) {
          const sidx = grid[gridIdx(xx,yy)];
          if (sidx >= 0 && dist2(samples[sidx], p) < radius*radius) { ok = false; break; }
        }
        if (!ok) break;
      }
      if (ok) {
        grid[gridIdx(gx, gy)] = samples.length;
        samples.push(p); active.push(samples.length-1); found = true; break;
      }
    }
    if (!found) {
      const last = active.pop();
      if (aPos < active.length) active[aPos] = last;
    }
  }
  return samples;
}

import { polygonBounds, pointInPolygon } from './polygon.js';

export function poissonDiskInPolygon(polyXZ, radius, k = 30, rng = Math.random) {
  const bounds = polygonBounds(polyXZ);
  const width = Math.max(1e-9, bounds.width);
  const height = Math.max(1e-9, bounds.height);
  const cellSize = radius / Math.SQRT2;
  const gw = Math.ceil(width / cellSize);
  const gh = Math.ceil(height / cellSize);
  const grid = new Array(gw * gh).fill(-1);
  const samples = [];
  const active = [];
  const originX = bounds.min[0], originZ = bounds.min[1];
  function gridIdx(x, y) { return y * gw + x; }
  function toGrid(p) {
    const gx = Math.floor((p[0] - originX) / cellSize);
    const gy = Math.floor((p[1] - originZ) / cellSize);
    return [ Math.min(gw-1, Math.max(0, gx)), Math.min(gh-1, Math.max(0, gy)) ];
  }
  function inPoly(p) { return pointInPolygon(p, polyXZ); }
  function dist2(a,b) { const dx=a[0]-b[0], dy=a[1]-b[1]; return dx*dx+dy*dy; }

  // Seed with a random point inside polygon
  let p0 = null; let guard=0;
  while (!p0 && guard++ < 1000) {
    const x = originX + rng() * width;
    const z = originZ + rng() * height;
    if (inPoly([x,z])) p0 = [x,z];
  }
  if (!p0) return [];
  samples.push(p0); active.push(0);
  let g = toGrid(p0); grid[gridIdx(g[0], g[1])] = 0;

  while (active.length) {
    const aPos = (active.length * rng()) | 0;
    const idx = active[aPos];
    const base = samples[idx];
    let found = false;
    for (let n = 0; n < k; n++) {
      const ang = 2*Math.PI*rng();
      const rad = radius * (1 + rng());
      const p = [ base[0] + rad*Math.cos(ang), base[1] + rad*Math.sin(ang) ];
      if (!inPoly(p)) continue;
      const [gx, gy] = toGrid(p);
      let ok = true;
      for (let yy = Math.max(gy-2,0); yy <= Math.min(gy+2, gh-1); yy++) {
        for (let xx = Math.max(gx-2,0); xx <= Math.min(gx+2, gw-1); xx++) {
          const sidx = grid[gridIdx(xx,yy)];
          if (sidx >= 0 && dist2(samples[sidx], p) < radius*radius) { ok = false; break; }
        }
        if (!ok) break;
      }
      if (ok) {
        grid[gridIdx(gx, gy)] = samples.length;
        samples.push(p); active.push(samples.length-1); found = true; break;
      }
    }
    if (!found) {
      const last = active.pop();
      if (aPos < active.length) active[aPos] = last;
    }
  }
  return samples;
}
