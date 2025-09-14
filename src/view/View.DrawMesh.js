export class ViewDrawMesh {
  constructor(id, params={}) { this.id = id; this.params = params; this.initialized = false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params, globalParams) {
    const src = inputs[0];
    if (!src) return null;
    const renderParams = { ...(globalParams?.render||{}), ...(params||{}) };
    if (src.type === 'meshTri') {
      try {
        const v = (src.positions?.length||0) / 3;
        const t = (src.indices?.length||0) / 3;
        console.log('[Mesh]', this.id, { verts: v, tris: t, bounds: src.bounds });
      } catch {}
      ctx.view.updateMeshFor(this.id, src, {
        wireframe: !!renderParams.wireframe,
        doubleSided: !!renderParams.doubleSided,
        color: renderParams.color || '#66aaff',
      });
      return null;
    }
    if (src.type === 'surface' && src.basis === 'plane') {
      // For visualization, generate a regular grid mesh
      const segments = 32;
      const [w,h] = src.size;
      const nx = segments, ny = segments;
      const positions = new Float32Array((nx + 1) * (ny + 1) * 3);
      const indices = new Uint32Array(nx * ny * 6);
      let p = 0;
      for (let j = 0; j <= ny; j++) {
        for (let i = 0; i <= nx; i++) {
          const x = (-w / 2) + (w * i / nx);
          const y = 0; // default plane at height 0
          const z = (-h / 2) + (h * j / ny);
          positions[p++] = x; positions[p++] = y; positions[p++] = z;
        }
      }
      let t = 0; const row = nx + 1;
      for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
          const a = j * row + i; const b = a + 1; const c = a + row; const d = c + 1;
          indices[t++] = a; indices[t++] = c; indices[t++] = b;
          indices[t++] = b; indices[t++] = c; indices[t++] = d;
        }
      }
      // Flat normals along +Y
      const normals = new Float32Array(positions.length);
      for (let i = 0; i < positions.length; i+=3) { normals[i] = 0; normals[i+1] = 1; normals[i+2] = 0; }
      const bounds = { min:[-w/2,0,-h/2], max:[w/2,0,h/2] };
      console.log('[Mesh]', this.id, { verts: positions.length/3, tris: indices.length/3, bounds });
      ctx.view.updateMeshFor(this.id, { type:'meshTri', positions, indices, normals, bounds }, { wireframe: !!renderParams.wireframe, doubleSided: !!renderParams.doubleSided, color: renderParams.color || '#66aaff' });
    }
    return null;
  }
}
