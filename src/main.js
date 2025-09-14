import { createRuntime } from './sim/runtime.js';
import { registerBuiltinNodes } from './sim/nodes/register.js';
import { ThreeView } from './view/threeView.js';
import { SAMPLE_GRAPHS } from './sampleGraphs.js';

const canvas = document.getElementById('canvas');
const statusEl = document.getElementById('status');
const jsonInput = document.getElementById('jsonInput');
const chkWire = document.getElementById('chkWire');
const btnFit = document.getElementById('btnFit');
const matColor = document.getElementById('matColor');
const matDouble = document.getElementById('matDouble');

const view = new ThreeView(canvas);
const runtime = createRuntime({ view });
registerBuiltinNodes(runtime);

function setStatus(text) { statusEl.textContent = text; }

function loadGraphJSON(obj) {
  // Inject render params from UI
  obj.params = obj.params || {};
  obj.params.render = obj.params.render || {};
  obj.params.render.wireframe = !!chkWire.checked;
  obj.params.render.color = matColor.value;
  obj.params.render.doubleSided = !!matDouble.checked;
  return obj;
}

async function runCurrent() {
  try {
    setStatus('Parsing…');
    const obj = JSON.parse(jsonInput.value);
    await runtime.loadGraph(loadGraphJSON(obj));
    setStatus('Executing…');
    await runtime.evaluateAll();
    setStatus('Done');
  } catch (err) {
    console.error(err);
    setStatus('Error: ' + err.message);
  }
}

document.getElementById('btnRun').addEventListener('click', runCurrent);
document.getElementById('btnPlane').addEventListener('click', () => {
  jsonInput.value = JSON.stringify(SAMPLE_GRAPHS.plane, null, 2);
  runCurrent();
});
document.getElementById('btnIrregular').addEventListener('click', () => {
  jsonInput.value = JSON.stringify(SAMPLE_GRAPHS.poissonDelaunay, null, 2);
  runCurrent();
});
document.getElementById('btnMulti').addEventListener('click', () => {
  jsonInput.value = JSON.stringify(SAMPLE_GRAPHS.multi, null, 2);
  runCurrent();
});
document.getElementById('btnPoly').addEventListener('click', () => {
  jsonInput.value = JSON.stringify(SAMPLE_GRAPHS.polygon, null, 2);
  runCurrent();
});
chkWire.addEventListener('change', runCurrent);
btnFit.addEventListener('click', () => view.frameAll());
// Material live updates (no recompute)
function updateMaterialLive() {
  view.updateMaterial({
    wireframe: !!chkWire.checked,
    color: matColor.value,
    doubleSided: !!matDouble.checked,
  });
}
matColor.addEventListener('input', updateMaterialLive);
matDouble.addEventListener('change', updateMaterialLive);

// Initial load
jsonInput.value = JSON.stringify(SAMPLE_GRAPHS.plane, null, 2);
runCurrent();
