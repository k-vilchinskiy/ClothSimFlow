export class ViewDrawLines {
  constructor(id, params={}) { this.id = id; this.params = params; this.initialized = false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params, globalParams) {
    const src = inputs[0];
    if (!src) return null;
    if (src.type === 'polygon2D' && Array.isArray(src.points) && src.points.length >= 2) {
      const pos = new Float32Array(src.points.length * 3);
      for (let i=0;i<src.points.length;i++){ pos[3*i]=src.points[i][0]; pos[3*i+1]=0.001; pos[3*i+2]=src.points[i][1]; }
      const color = params.color || (globalParams?.render?.color) || '#ffffff';
      ctx.view.updateLinesFor(this.id, pos, { color, closed: true, y: 0 });
    }
    return null;
  }
}

