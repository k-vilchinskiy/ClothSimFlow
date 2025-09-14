// Load a simple polygon/polyline from an SVG file.
// Supports <polygon points="x,y x,y ..."> and <polyline ...>. Optional scale param.
export class LoadPolygonSVG {
  constructor(id, params={}) { this.id=id; this.params=params; this.initialized=false; }
  async init(ctx) { this.initialized = true; }
  async evaluate(ctx, inputs, params) {
    const url = params.url; const scale = Number(params.scale ?? 1);
    if (!url) throw new Error('LoadPolygonSVG: params.url is required');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`LoadPolygonSVG: failed ${url}: ${res.status}`);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    let el = doc.querySelector('polygon');
    if (!el) el = doc.querySelector('polyline');
    if (!el) throw new Error('LoadPolygonSVG: no <polygon> or <polyline> found');
    const ptsAttr = el.getAttribute('points');
    if (!ptsAttr) throw new Error('LoadPolygonSVG: points attribute missing');
    const tokens = ptsAttr.trim().split(/\s+/);
    const points = [];
    for (const tok of tokens) {
      const [xs, ys] = tok.split(',');
      if (xs === undefined || ys === undefined) continue;
      const x = parseFloat(xs) * scale;
      const y = parseFloat(ys) * scale;
      // Map SVG y-down to our z-up plane: use (x, -y)
      points.push([x, -y]);
    }
    if (points.length < 3) throw new Error('LoadPolygonSVG: not enough points');
    return { type: 'polygon2D', points };
  }
}

