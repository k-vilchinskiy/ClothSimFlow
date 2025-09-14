import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// ViewHelper removed for now

export class ThreeView {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.autoClear = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111111);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera = new THREE.PerspectiveCamera(50, w/h, 0.01, 5000);
    this.camera.position.set(1.5, 1.0, 1.5);
    this.camera.lookAt(0,0,0);
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(2,3,2);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.05;
    this.controls.maxDistance = 3000;

    // No ViewHelper / gizmo for now

    this.contentGroup = new THREE.Group();
    this.scene.add(this.contentGroup);
    this.meshes = new Map(); // id -> THREE.Mesh
    this.lines = new Map();  // id -> THREE.Line

    // Ground grid (floor)
    const grid = new THREE.GridHelper(10, 20, 0x333333, 0x222222);
    grid.position.y = -0.001;
    this.scene.add(grid);

    const resize = () => {
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = Math.max(1e-6, w / Math.max(1, h));
      this.camera.updateProjectionMatrix();
      this.render();
    };
    window.addEventListener('resize', resize);
    setTimeout(resize, 0);

    this._start();
  }

  updateMeshFor(id, meshTri, opts={ wireframe:false, doubleSided:false, color:'#66aaff' }) {
    if (!meshTri) return;
    const prev = this.meshes.get(id);
    if (prev) { this.contentGroup.remove(prev); prev.geometry.dispose(); prev.material.dispose(); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(meshTri.positions, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(meshTri.normals, 3));
    geo.setIndex(new THREE.BufferAttribute(meshTri.indices, 1));
    const color = new THREE.Color(opts.color || '#66aaff');
    const mat = new THREE.MeshStandardMaterial({
      color,
      wireframe: !!opts.wireframe,
      side: opts.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
      roughness: 0.6,
      metalness: 0.0,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    this.contentGroup.add(mesh);
    this.meshes.set(id, mesh);
    this.lastBounds = null; // recompute on frameAll via group
    // Aim camera and orbit target to center of object, keep distance
    const box = new THREE.Box3().setFromObject(this.contentGroup);
    if (isFinite(box.min.x) && isFinite(box.max.x)) {
      const center = new THREE.Vector3(); box.getCenter(center);
      this.controls.target.copy(center);
      this.camera.lookAt(center);
      // Ensure initial camera distance makes whole content visible from a default angle
      this.frameAll({ defaultDir: true });
    }
    this.render();
  }

  frameAll(opts = {}) {
    const box = new THREE.Box3();
    if (this.lastBounds) {
      box.min.set(this.lastBounds.min[0], this.lastBounds.min[1], this.lastBounds.min[2]);
      box.max.set(this.lastBounds.max[0], this.lastBounds.max[1], this.lastBounds.max[2]);
    } else {
      box.setFromObject(this.contentGroup);
    }
    if (!isFinite(box.min.x) || !isFinite(box.max.x)) return;
    const center = new THREE.Vector3(); box.getCenter(center);
    const sphere = new THREE.Sphere(); box.getBoundingSphere(sphere);
    const margin = 1.25;
    const fovY = this.camera.fov * Math.PI / 180;
    const tanY = Math.tan(fovY / 2);
    const fovX = 2 * Math.atan(Math.tan(fovY / 2) * this.camera.aspect);
    const tanX = Math.tan(fovX / 2);
    const distY = sphere.radius / Math.max(1e-6, tanY);
    const distX = sphere.radius / Math.max(1e-6, tanX);
    const dist = Math.max(distX, distY) * margin;
    let dir;
    if (opts.defaultDir) {
      dir = new THREE.Vector3(1, 1, 1);
      this.camera.up.set(0, 1, 0);
    } else {
      dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
      if (dir.lengthSq() < 1e-6) dir.set(1,1,1);
    }
    dir.normalize();
    const pos = new THREE.Vector3().copy(center).add(dir.multiplyScalar(dist));
    this.camera.position.copy(pos);
    this.camera.near = 0.01;
    this.camera.far = Math.max(2000, dist + sphere.radius * 20);
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(center);
    this.controls.update();
  }

  render() {
    // Draw scene, then overlay helper; allow renderer to manage clears
    this.renderer.render(this.scene, this.camera);
    // No overlay rendering
  }

  updateMaterial(opts) {
    for (const mesh of this.meshes.values()) {
      const mat = mesh.material;
      if ('wireframe' in opts) mat.wireframe = !!opts.wireframe;
      if ('color' in opts) mat.color.set(opts.color);
      if ('doubleSided' in opts) mat.side = opts.doubleSided ? THREE.DoubleSide : THREE.FrontSide;
      mat.needsUpdate = true;
    }
    this.render();
  }

  clearAll() {
    for (const [id, mesh] of this.meshes.entries()) {
      this.contentGroup.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.meshes.clear();
    for (const [id, line] of this.lines.entries()) {
      this.contentGroup.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    }
    this.lines.clear();
    this.lastBounds = null;
    this.render();
  }

  updateLinesFor(id, positions, opts={ color:'#ffffff', closed:true, y:0 }) {
    // positions: Float32Array of [x,y,z] points
    const prev = this.lines.get(id);
    if (prev) { this.contentGroup.remove(prev); prev.geometry.dispose(); prev.material.dispose(); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    let obj;
    const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(opts.color || '#ffffff') });
    if (opts.closed) obj = new THREE.LineLoop(geo, mat); else obj = new THREE.Line(geo, mat);
    obj.position.y = opts.y ?? 0;
    this.contentGroup.add(obj);
    this.lines.set(id, obj);
    // keep target centered
    const box = new THREE.Box3().setFromObject(this.contentGroup);
    if (isFinite(box.min.x) && isFinite(box.max.x)) {
      const center = new THREE.Vector3(); box.getCenter(center);
      this.controls.target.copy(center);
      this.camera.lookAt(center);
    }
    this.render();
  }


  _start() {
    const loop = () => {
      this.controls.update();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // (old custom gizmo helpers removed)
}
