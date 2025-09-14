export function makePlaneSurface(w, h) {
  return { type: 'surface', basis: 'plane', size: [w, h], transform: mat4Identity() };
}

export function triangulateRegularGrid(surface, segmentsX = 16, segmentsY = 16) {
  const [w, h] = surface.size;
  const nx = segmentsX, ny = segmentsY;
  const positions = new Float32Array((nx + 1) * (ny + 1) * 3);
  const indices = new Uint32Array(nx * ny * 6);
  let p = 0;
  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      const x = (-w / 2) + (w * i / nx);
      const y = 0;
      const z = (-h / 2) + (h * j / ny);
      positions[p++] = x; positions[p++] = y; positions[p++] = z;
    }
  }
  let t = 0;
  const row = nx + 1;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * row + i;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      indices[t++] = a; indices[t++] = c; indices[t++] = b;
      indices[t++] = b; indices[t++] = c; indices[t++] = d;
    }
  }
  const normals = computeFlatNormals(positions, indices);
  const bounds = computeAABB(positions);
  return { type: 'meshTri', positions, indices, normals, bounds };
}

export function computeFlatNormals(positions, indices) {
  const n = positions.length / 3;
  const normals = new Float32Array(n * 3);
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i], b = indices[i + 1], c = indices[i + 2];
    const ax = positions[3 * a], ay = positions[3 * a + 1], az = positions[3 * a + 2];
    const bx = positions[3 * b], by = positions[3 * b + 1], bz = positions[3 * b + 2];
    const cx = positions[3 * c], cy = positions[3 * c + 1], cz = positions[3 * c + 2];
    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const vx = cx - ax, vy = cy - ay, vz = cz - az;
    const nxv = uy * vz - uz * vy;
    const nyv = uz * vx - ux * vz;
    const nzv = ux * vy - uy * vx;
    normals[3 * a] += nxv; normals[3 * a + 1] += nyv; normals[3 * a + 2] += nzv;
    normals[3 * b] += nxv; normals[3 * b + 1] += nyv; normals[3 * b + 2] += nzv;
    normals[3 * c] += nxv; normals[3 * c + 1] += nyv; normals[3 * c + 2] += nzv;
  }
  // Normalize
  for (let i = 0; i < n; i++) {
    const x = normals[3 * i], y = normals[3 * i + 1], z = normals[3 * i + 2];
    const len = Math.hypot(x, y, z) || 1;
    normals[3 * i] = x / len; normals[3 * i + 1] = y / len; normals[3 * i + 2] = z / len;
  }
  return normals;
}

export function computeAABB(positions) {
  let minx = Infinity, miny = Infinity, minz = Infinity;
  let maxx = -Infinity, maxy = -Infinity, maxz = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minx) minx = x; if (y < miny) miny = y; if (z < minz) minz = z;
    if (x > maxx) maxx = x; if (y > maxy) maxy = y; if (z > maxz) maxz = z;
  }
  return { min: [minx, miny, minz], max: [maxx, maxy, maxz] };
}

export function mat4Identity() { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }

export function applyTRS(positions, translate=[0,0,0], rotate=[0,0,0], scale=[1,1,1]) {
  const [sx,sy,sz] = scale; const [rx,ry,rz] = rotate.map(r => r * Math.PI/180);
  const [tx,ty,tz] = translate;
  // Rotation matrices (XYZ order)
  const cx = Math.cos(rx), sxr = Math.sin(rx);
  const cy = Math.cos(ry), syr = Math.sin(ry);
  const cz = Math.cos(rz), szr = Math.sin(rz);
  // Combined rotation R = Rz * Ry * Rx
  const r00 = cz*cy;                const r01 = cz*syr*sxr - szr*cx; const r02 = cz*syr*cx + szr*sxr;
  const r10 = szr*cy;               const r11 = szr*syr*sxr + cz*cx; const r12 = szr*syr*cx - cz*sxr;
  const r20 = -syr;                 const r21 = cy*sxr;              const r22 = cy*cx;
  for (let i = 0; i < positions.length; i += 3) {
    let x = positions[i] * sx, y = positions[i+1] * sy, z = positions[i+2] * sz;
    const xr = r00*x + r01*y + r02*z;
    const yr = r10*x + r11*y + r12*z;
    const zr = r20*x + r21*y + r22*z;
    positions[i] = xr + tx; positions[i+1] = yr + ty; positions[i+2] = zr + tz;
  }
}

export function flipWindingInPlace(indices) {
  for (let i = 0; i < indices.length; i += 3) {
    const tmp = indices[i + 1];
    indices[i + 1] = indices[i + 2];
    indices[i + 2] = tmp;
  }
}

export function ensureUpwardNormals(positions, indices, normals) {
  // For mostly planar meshes on XZ plane, if average normal Y is negative, flip all
  let sumY = 0;
  for (let i = 0; i < normals.length; i += 3) sumY += normals[i + 1];
  const avgY = sumY / (normals.length / 3);
  if (avgY < 0) {
    flipWindingInPlace(indices);
    for (let i = 0; i < normals.length; i++) normals[i] = -normals[i];
  }
}
