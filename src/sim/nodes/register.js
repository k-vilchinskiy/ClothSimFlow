import { CreatePlaneBySize } from './source/CreatePlaneBySize.js';
import { LoadMeshOBJ } from './source/LoadMeshOBJ.js';
import { LoadPolygonSVG } from './source/LoadPolygonSVG.js';
import { MeshingPoissonDelaunay } from './meshing/Meshing.PoissonDelaunay.js';
import { MeshTransform } from './meshing/Mesh.Transform.js';
import { MeshingTriangulatePolygon } from './meshing/Meshing.TriangulatePolygon.js';
import { MeshingPolygonPoissonDelaunay } from './meshing/Meshing.Polygon.PoissonDelaunay.js';
import { MeshingPolygonCDT } from './meshing/Meshing.Polygon.CDT.js';
import { ViewDrawMesh } from '../../view/View.DrawMesh.js';
import { ViewDrawLines } from '../../view/View.DrawLines.js';

// Stubs
import { AccelAABBGrid } from './stubs/Accel.AABBGrid.js';
import { AccelBVH } from './stubs/Accel.BVH.js';
import { SimPD_Predict } from './stubs/Sim.PD.Predict.js';
import { SimPD_LocalProjections } from './stubs/Sim.PD.LocalProjections.js';
import { SimPD_GlobalSolve_ModalWarmStart } from './stubs/Sim.PD.GlobalSolve.ModalWarmStart.js';
import { SimPD_GlobalSolve_ModalReuse } from './stubs/Sim.PD.GlobalSolve.ModalReuse.js';
import { SimPD_GlobalSolve_AJacobi } from './stubs/Sim.PD.GlobalSolve.AJacobi.js';
import { SimCollide_BroadPhase } from './stubs/Sim.Collide.BroadPhase.js';
import { SimCollide_PartialCCD } from './stubs/Sim.Collide.PartialCCD.js';
import { SimBarrier_NDB } from './stubs/Sim.Barrier.NDB.js';
import { SimCollide_FullCCD_LineSearch } from './stubs/Sim.Collide.FullCCD.LineSearch.js';
import { SimPD_ResidualForwarding } from './stubs/Sim.PD.ResidualForwarding.js';

export function registerBuiltinNodes(runtime) {
  runtime.register('CreatePlaneBySize', CreatePlaneBySize);
  runtime.register('LoadMeshOBJ', LoadMeshOBJ);
  runtime.register('LoadPolygonSVG', LoadPolygonSVG);
  runtime.register('Meshing.PoissonDelaunay', MeshingPoissonDelaunay);
  runtime.register('Meshing.TriangulatePolygon', MeshingTriangulatePolygon);
  runtime.register('Meshing.Polygon.PoissonDelaunay', MeshingPolygonPoissonDelaunay);
  runtime.register('Meshing.Polygon.CDT', MeshingPolygonCDT);
  runtime.register('Mesh.Transform', MeshTransform);
  runtime.register('View.DrawMesh', ViewDrawMesh);
  runtime.register('View.DrawLines', ViewDrawLines);

  // Stubs for future expansion
  runtime.register('Accel.AABBGrid', AccelAABBGrid);
  runtime.register('Accel.BVH', AccelBVH);
  runtime.register('Sim.PD.Predict', SimPD_Predict);
  runtime.register('Sim.PD.LocalProjections', SimPD_LocalProjections);
  runtime.register('Sim.PD.GlobalSolve.ModalWarmStart', SimPD_GlobalSolve_ModalWarmStart);
  runtime.register('Sim.PD.GlobalSolve.ModalReuse', SimPD_GlobalSolve_ModalReuse);
  runtime.register('Sim.PD.GlobalSolve.AJacobi', SimPD_GlobalSolve_AJacobi);
  runtime.register('Sim.Collide.BroadPhase', SimCollide_BroadPhase);
  runtime.register('Sim.Collide.PartialCCD', SimCollide_PartialCCD);
  runtime.register('Sim.Barrier.NDB', SimBarrier_NDB);
  runtime.register('Sim.Collide.FullCCD.LineSearch', SimCollide_FullCCD_LineSearch);
  runtime.register('Sim.PD.ResidualForwarding', SimPD_ResidualForwarding);
}
