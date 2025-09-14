export const SAMPLE_GRAPHS = {
  plane: {
    nodes: [
      { id: 'Plane', type: 'CreatePlaneBySize', params: { w: 1.0, h: 1.0 } },
      { id: 'Xform', type: 'Mesh.Transform', inputs: ['Plane'], params: { translate: [0,1,0], rotate: [0,0,0], scale: [1,1,1] } },
      { id: 'View', type: 'View.DrawMesh', inputs: ['Xform'], params: {} },
    ],
    params: { render: { wireframe: false } },
  },
  poissonDelaunay: {
    nodes: [
      { id: 'Plane', type: 'CreatePlaneBySize', params: { w: 1.0, h: 1.0 } },
      { id: 'Tri', type: 'Meshing.PoissonDelaunay', inputs: ['Plane'], params: { radius: 0.08, jitter: 0.5, relaxIters: 2 } },
      { id: 'Xform', type: 'Mesh.Transform', inputs: ['Tri'], params: { translate: [0,1,0], rotate: [0,0,0], scale: [1,1,1] } },
      { id: 'View', type: 'View.DrawMesh', inputs: ['Xform'], params: {} },
    ],
    params: { render: { wireframe: true } },
  },
  multi: {
    nodes: [
      { id: 'Plane', type: 'CreatePlaneBySize', params: { w: 1.0, h: 1.0 } },
      { id: 'PlaneX', type: 'Mesh.Transform', inputs: ['Plane'], params: { translate: [-1,0,0], rotate: [0,0,0], scale: [1,1,1] } },
      { id: 'PlaneView', type: 'View.DrawMesh', inputs: ['PlaneX'], params: {} },

      { id: 'Tri', type: 'Meshing.PoissonDelaunay', inputs: ['Plane'], params: { radius: 0.08 } },
      { id: 'TriX', type: 'Mesh.Transform', inputs: ['Tri'], params: { translate: [1,0,0], rotate: [0,0,0], scale: [1,1,1] } },
      { id: 'TriView', type: 'View.DrawMesh', inputs: ['TriX'], params: {} },

      { id: 'Obj', type: 'LoadMeshOBJ', params: { url: 'data/models/Realistic_White_Female_Low_Poly.obj' } },
      { id: 'ObjX', type: 'Mesh.Transform', inputs: ['Obj'], params: { translate: [0,0,0], rotate: [0,0,0], scale: [0.05,0.05,0.05] } },
      { id: 'ObjView', type: 'View.DrawMesh', inputs: ['ObjX'], params: {} },
    ],
    params: { render: { wireframe: false } },
  },
  polygon: {
    nodes: [
      { id: 'Poly', type: 'LoadPolygonSVG', params: { url: 'data/svg/sweater.svg', scale: 0.1 } },
      { id: 'PolyTri', type: 'Meshing.Polygon.CDT', inputs: ['Poly'], params: { radius: 0.05 } },
      { id: 'PolyX', type: 'Mesh.Transform', inputs: ['PolyTri'], params: { translate: [0,0,0], rotate: [0,0,0], scale: [1,1,1] } },
      { id: 'PolyView', type: 'View.DrawMesh', inputs: ['PolyX'], params: {} },
      { id: 'PolyLine', type: 'View.DrawLines', inputs: ['Poly'], params: { color: '#ffcc00' } },
    ],
    params: { render: { wireframe: false } },
  },
};
