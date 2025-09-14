export function parseOBJ(text) {
  const verts = [];
  const faces = [];
  const lines = text.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    const tag = parts[0];
    if (tag === 'v' && parts.length >= 4) {
      verts.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    } else if (tag === 'f' && parts.length >= 4) {
      const idxs = parts.slice(1).map(tok => {
        const s = tok.split('/')[0];
        let i = parseInt(s, 10);
        if (isNaN(i)) i = 0;
        if (i < 0) i = verts.length + i + 1; // negative indices are relative to end
        return i - 1; // to 0-based
      });
      // Triangulate fan if polygon
      for (let k = 1; k < idxs.length - 1; k++) {
        faces.push([idxs[0], idxs[k], idxs[k+1]]);
      }
    }
  }
  const positions = new Float32Array(verts.length * 3);
  for (let i = 0; i < verts.length; i++) {
    positions[3*i] = verts[i][0];
    positions[3*i+1] = verts[i][1];
    positions[3*i+2] = verts[i][2];
  }
  const indices = new Uint32Array(faces.length * 3);
  for (let i = 0; i < faces.length; i++) {
    indices[3*i] = faces[i][0];
    indices[3*i+1] = faces[i][1];
    indices[3*i+2] = faces[i][2];
  }
  return { positions, indices };
}

