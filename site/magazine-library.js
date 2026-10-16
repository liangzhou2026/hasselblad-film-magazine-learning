(() => {
  'use strict';
  if (window.MAGAZINE_SHARED_SHELL === false) return;
  const sharedShell = window.MAGAZINE_SHARED_SHELL === true;
  const $ = id => document.getElementById((window.MAGAZINE_ELEMENT_ALIASES || {})[id] || id);
  const catalog = window.MANUAL_MAGAZINES || [];
  const requested = (new URLSearchParams(location.search).get('model') || 'A16S').toUpperCase();
  const requestedMode = new URLSearchParams(location.search).get('mode') || 'exploded';
  const initialMode = ['structure', 'assembled', 'exploded'].includes(requestedMode) ? requestedMode : 'exploded';
  const model = catalog.find(item => item.id === requested);
  const sideDirection = window.ROLLFILM_MODEL_IDS.includes(requested) ? -1 : 1;
  const preciseModels = ['A12', 'A16', 'A24'];
  const error = message => { $('error-message').textContent = message; $('error-message').hidden = false; $('render-state').textContent = '模型未载入'; };
  if (!catalog.length) { error('型号目录没有载入。请重新打开本页，或查看本地维修手册。'); return; }
  // Keep the single index.html menu intact: the same groups, labels and order for all 16 models.
  $('library-model').addEventListener('change', event => {
    const id = event.target.value;
    const mode = preciseModels.includes(id) ? 'structure' : 'exploded';
    location.href = `index.html?model=${encodeURIComponent(id)}&mode=${mode}`;
  });
  if (!model) { $('model-title').textContent = '未知型号'; error(`维修手册目录中没有型号“${requested}”。请使用上方型号菜单选择。`); return; }
  if (preciseModels.includes(model.id)) { location.replace(`index.html?model=${encodeURIComponent(model.id)}&mode=${['assembly','disassembly'].includes(requestedMode) ? requestedMode : 'structure'}`); return; }
  const normalizedUrl = new URL(location.href); normalizedUrl.searchParams.set('mode', initialMode); history.replaceState(null, '', normalizedUrl);
  $('library-model').value = model.id;
  $('stage-model-name').textContent = model.label;
  $('model-family').textContent = model.familyLabel || model.family;
  $('model-scope').textContent = model.scope || '';
  $('model-scope').title = model.scope || '';
  $('model-boundary').textContent = model.boundary || '';
  window.PublicResources.bindDownload($('download-model'), `${model.id.toLowerCase()}.glb`);
  window.PublicResources.bindDownload($('download-parts'), `${model.id.toLowerCase()}.parts.json`);
  $('canvas-host').setAttribute('aria-label', `${model.label} 三维结构模型，拖动旋转，滚轮或按钮缩放。`);
  let state = { mode: initialMode, progress: initialMode === 'exploded' ? .65 : 0, selected: null, visible: new Set(), isolated: null, yaw: sideDirection * 1.05, pitch: .39, distance: 300, fitDistance: 300, target: null, dragging: false, pointerDown: null };
  const pageNumbers = pages => [...new Set((Array.isArray(pages) ? pages : [pages]).filter(page => Number.isInteger(Number(page)) && Number(page) > 0).map(Number))];
  function openSource(page) {
    window.PublicResources.openDocument('manual', page);
  }
  $('close-source').addEventListener('click', () => $('source-dialog').close());
  $('source-dialog').addEventListener('click', event => { if (event.target === $('source-dialog')) $('source-dialog').close(); });
  function renderPages(host, pages) {
    host.replaceChildren();
    pageNumbers(pages).forEach(page => {
      const button = document.createElement('button'); button.textContent = `PDF 第 ${page} 页`; button.addEventListener('click', () => openSource(page));
      host.append(button);
    });
  }
  renderPages($('model-pages'), model.pages);
  let THREE = window.THREE, renderer, scene, stage, camera, assembly, parts, raycaster, meshToPart, selectedLabel;
  try {
    if (!THREE || typeof window.buildLearningMagazineModel !== 'function' || typeof window.createFreeMagazineLayout !== 'function') throw new Error('三维引擎或自由展示模型文件没有载入');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    $('canvas-host').append(renderer.domElement);
    scene = new THREE.Scene();
    stage = window.configureMagazineStage(THREE, scene, renderer);
    assembly = window.buildLearningMagazineModel(THREE, model.id);
    if (!assembly || !assembly.root || !assembly.parts || !assembly.parts.length) throw new Error('该型号没有可显示的三维零件');
    scene.add(assembly.root); parts = assembly.parts;
    const layout = window.createFreeMagazineLayout(THREE, parts);
    meshToPart = new Map(); raycaster = new THREE.Raycaster();
    parts.forEach(part => {
      if (!part.group) throw new Error(`零件 ${part.id} 缺少三维结构`);
      part.home = part.group.position.clone();
      if (!layout.has(part.id)) throw new Error(`组件 ${part.id} 缺少展示位置`);
      part.spreadVector = layout.get(part.id).clone();
      part.group.traverse(object => {
        if (!object.isMesh) return;
        meshToPart.set(object, part);
        const original = Array.isArray(object.material) ? object.material : [object.material];
        object.material = original.map(material => material.clone());
        object.userData.libraryMaterials = object.material.map(material => ({ material, emissive: material.emissive && material.emissive.clone(), emissiveIntensity: material.emissiveIntensity, opacity: material.opacity, transparent: material.transparent, depthWrite: material.depthWrite }));
        if (!Array.isArray(original) || original.length === 1) object.material = object.material[0];
      });
      state.visible.add(part.id);
    });
    camera = new THREE.PerspectiveCamera(36, 1, .1, 10000);
    state.target = new THREE.Vector3();
    const modelBox = new THREE.Box3().setFromObject(assembly.root); modelBox.getCenter(state.target);
    state.modelCenter = state.target.clone(); state.modelSize = modelBox.getSize(new THREE.Vector3());
    state.fitDistance = Math.max(state.modelSize.length() * 1.6, 120); state.distance = state.fitDistance;
    selectedLabel = document.createElement('button'); selectedLabel.className = 'model-label selected'; selectedLabel.addEventListener('click', () => selectPart(state.selected)); $('labels-layer').append(selectedLabel);
    $('part-boundary').textContent = '模型的形状、位置和展开间距均为展示近似，不作装配或维修操作依据。';
    const differences = assembly.displayDifferences || [];
    [...new Set(differences.map(item => typeof item === 'string' ? item : item.description || item.title || JSON.stringify(item)))].forEach(text => { const item = document.createElement('li'); item.textContent = text; $('difference-list').append(item); });
    $('model-differences').hidden = !differences.length;
  } catch (exception) {
    error(`三维模型无法显示：${exception.message}。请确认浏览器支持 WebGL，并重新载入页面。型号信息与维修手册仍可查看。`);
    return;
  }
  function displayName(part) { return typeof part.labelName === 'string' ? part.labelName.trim() : ''; }
  function displayNumber(part) { return part.labelNumber == null ? '' : String(part.labelNumber).trim(); }
  function operationName(part) { return displayName(part) || '未标注组件'; }
  function actualLabel(part) { return [displayName(part), displayNumber(part)].filter(Boolean).join(' · '); }
  function updateVisibleCount() { $('visible-count').textContent = `${parts.filter(part => part.group.visible).length} / ${parts.length}`; }
  function renderList() {
    const filter = $('part-search').value.trim().toLowerCase(); $('parts-list').replaceChildren();
    let count = 0;
    parts.forEach(part => {
      if (filter && !`${operationName(part)} ${displayNumber(part)} ${part.nameSource?.english || ''} ${window.A12_I18N?.english(operationName(part)) || ''}`.toLowerCase().includes(filter)) return;
      const row = document.createElement('div'); row.className = `part-row${part.id === state.selected ? ' selected' : ''}${part.group.visible ? '' : ' part-hidden'}`;
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = part.group.visible; checkbox.setAttribute('aria-label', `显示 ${actualLabel(part) || operationName(part)}`);
      checkbox.addEventListener('change', () => { state.isolated = null; checkbox.checked ? state.visible.add(part.id) : state.visible.delete(part.id); applyVisibility(); });
      const button = document.createElement('button'); button.className = 'part-select'; button.dataset.part = part.id; button.setAttribute('aria-pressed', String(part.id === state.selected));
      const name = document.createElement('span'); name.textContent = operationName(part); const number = document.createElement('small'); number.textContent = displayNumber(part); button.append(name); if (displayNumber(part)) button.append(number);
      const spacer = document.createElement('span'); spacer.className = 'tree-spacer'; spacer.setAttribute('aria-hidden', 'true');
      button.addEventListener('click', () => { selectPart(part.id); }); row.append(spacer, checkbox, button); $('parts-list').append(row); count++;
    });
    if (!count) { const empty = document.createElement('p'); empty.className = 'no-results'; empty.textContent = '没有匹配的零件。'; $('parts-list').append(empty); }
    $('search-count').hidden = !filter;
    $('search-count').textContent = `匹配 ${count} 项 · 模型共 ${parts.length} 个组件`;
    updateVisibleCount();
  }
  function applyVisibility() {
    parts.forEach(part => part.group.visible = state.isolated ? part.id === state.isolated : state.visible.has(part.id));
    $('isolate').textContent = state.isolated ? '退出单独查看' : '只看所选';
    const current = parts.find(part => part.id === state.selected); if (current) $('toggle-selected').textContent = current.group.visible ? '隐藏零件' : '显示零件';
    applyMaterials(); renderList();
  }
  function selectPart(id) {
    const part = parts.find(item => item.id === id); if (!part) return;
    state.selected = id;
    if (sharedShell) {
      $('layer-caption').textContent = actualLabel(part) || '未标注组件';
      document.querySelector('[data-tab="part"]').click();
    }
    if (state.isolated) {
      state.isolated = id;
      parts.forEach(item => item.group.visible = item.id === id);
      $('isolate').textContent = '退出单独查看';
      fitModel();
    }
    applyMaterials();
    $('part-name').textContent = operationName(part); $('part-number').textContent = displayNumber(part); $('part-number').hidden = !displayNumber(part);
    $('part-english').textContent = displayName(part) ? (part.nameSource?.english || '') : ''; $('part-english').hidden = !$('part-english').textContent;
    $('part-description').textContent = (part.labelDescription || '本组件仅作形状示意；请对照原厂图。').replace(/^手册原文：[^。]+。/, '');
    $('part-relation').textContent = part.labelRelation || ''; $('part-relation').hidden = !part.labelRelation;
    $('part-location').textContent = displayName(part) ? '名称依据手册资料标注。' : '本件没有可核对的手册名称，因此不作名称标注。';
    renderPages($('part-pages'), part.labelPages && part.labelPages.length ? part.labelPages : model.pages);
    $('toggle-selected').textContent = part.group.visible ? '隐藏零件' : '显示零件';
    selectedLabel.replaceChildren();
    if (displayName(part)) { const name = document.createElement('span'); name.textContent = displayName(part); selectedLabel.append(name); }
    if (displayNumber(part)) { const number = document.createElement('small'); number.textContent = (displayName(part) ? ' · ' : '') + displayNumber(part); selectedLabel.append(number); }
    renderList();
  }
  function applyMaterials() {
    parts.forEach(part => part.group.traverse(object => {
      (object.userData.libraryMaterials || []).forEach(saved => {
        const ghost = $('transparent-shell').checked && part.inspectionOccluder === true && !state.isolated;
        saved.material.opacity = ghost ? Math.min(saved.opacity, part.id === state.selected ? .35 : .16) : saved.opacity;
        saved.material.transparent = ghost || saved.transparent; saved.material.depthWrite = ghost ? false : saved.depthWrite;
        if (saved.material.emissive) {
          saved.material.emissive.copy(saved.emissive); saved.material.emissiveIntensity = saved.emissiveIntensity;
          if (part.id === state.selected) { saved.material.emissive.set(0x23755b); saved.material.emissiveIntensity = .08; }
        }
        saved.material.needsUpdate = true;
        object.castShadow = !ghost; object.receiveShadow = !ghost;
      });
    }));
  }
  function applyProgress() {
    parts.forEach(part => {
      part.group.position.copy(part.home).addScaledVector(part.spreadVector, state.progress);
    });
    stage.setFloorY(new THREE.Box3().setFromObject(assembly.root).min.y - 3);
    $('layer-progress').value = String(state.progress * 100); $('layer-value').textContent = `${Math.round(state.progress * 100)}%`;
    const caption = state.mode === 'structure' ? '内部结构' : state.progress <= 0 ? '完整外观' : '分层爆炸';
    $('layout-status').textContent = sharedShell ? `${model.label} · ${caption}` : caption;
    if (!sharedShell) $('layer-caption').textContent = state.progress <= 0 ? '合拢位置为示意' : '沿原有总成方向分层';
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
    $('layout-assembled').setAttribute('aria-pressed', String(state.mode === 'assembled')); $('layout-expanded').setAttribute('aria-pressed', String(state.mode === 'exploded'));
    const url = new URL(location.href); url.searchParams.set('mode', state.mode); history.replaceState(null, '', url);
  }
  function applyMode(mode) {
    state.mode = mode; state.progress = mode === 'exploded' ? .65 : 0; state.isolated = null;
    $('transparent-shell').checked = mode !== 'assembled';
    state.visible = new Set(parts.filter(part => mode !== 'structure' || part.inspectionOccluder !== true).map(part => part.id));
    applyProgress(); applyVisibility(); fitModel();
  }
  function updateCamera() {
    camera.position.set(state.target.x + Math.sin(state.yaw) * Math.cos(state.pitch) * state.distance, state.target.y + Math.sin(state.pitch) * state.distance, state.target.z + Math.cos(state.yaw) * Math.cos(state.pitch) * state.distance);
    camera.lookAt(state.target); camera.updateMatrixWorld();
  }
  function fitModel() {
    assembly.root.updateMatrixWorld(true);
    const normal = new THREE.Vector3(Math.sin(state.yaw) * Math.cos(state.pitch), Math.sin(state.pitch), Math.cos(state.yaw) * Math.cos(state.pitch));
    const right = new THREE.Vector3(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
    const up = normal.clone().cross(right), projected = [];
    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity, minD = Infinity, maxD = -Infinity;
    parts.filter(part => part.group.visible).forEach(part => {
      const box = new THREE.Box3().setFromObject(part.group);
      if (box.isEmpty()) return;
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        const point = new THREE.Vector3(x, y, z), u = point.dot(right), v = point.dot(up), d = point.dot(normal);
        projected.push({ u, v, d }); minU = Math.min(minU, u); maxU = Math.max(maxU, u); minV = Math.min(minV, v); maxV = Math.max(maxV, v); minD = Math.min(minD, d); maxD = Math.max(maxD, d);
      }
    });
    if (!projected.length) return;
    const centerU = (minU + maxU) / 2, centerV = (minV + maxV) / 2, centerD = (minD + maxD) / 2;
    state.target.copy(right).multiplyScalar(centerU).addScaledVector(up, centerV).addScaledVector(normal, centerD);
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), tanH = tanV * camera.aspect;
    let distance = 1;
    projected.forEach(point => { distance = Math.max(distance, Math.abs(point.u - centerU) / tanH + point.d - centerD, Math.abs(point.v - centerV) / tanV + point.d - centerD); });
    state.fitDistance = distance * 1.12; state.distance = state.fitDistance;
  }
  function resize() {
    const width = $('canvas-host').clientWidth, height = $('canvas-host').clientHeight;
    renderer.setSize(width, height, false); camera.aspect = Math.max(width / Math.max(height, 1), .1); camera.updateProjectionMatrix();
    fitModel();
  }
  function updateLabel() {
    const part = parts.find(item => item.id === state.selected);
    if (!part || !actualLabel(part) || !part.group.visible || !$('show-labels').checked) { selectedLabel.hidden = true; return; }
    const box = new THREE.Box3().setFromObject(part.group), point = box.getCenter(new THREE.Vector3()); point.y = box.max.y;
    point.project(camera); const width = $('canvas-host').clientWidth, height = $('canvas-host').clientHeight;
    const x = (point.x + 1) / 2 * width, y = (-point.y + 1) / 2 * height - 9;
    selectedLabel.hidden = point.z > 1 || point.z < -1 || x < 0 || x > width || y < 18 || y > height;
    selectedLabel.style.left = `${Math.max(80, Math.min(width - 80, x))}px`; selectedLabel.style.top = `${y}px`;
  }
  function pick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
    const objects = [...meshToPart.keys()].filter(mesh => { for (let parent = mesh; parent; parent = parent.parent) if (!parent.visible) return false; return true; });
    const hits = raycaster.intersectObjects(objects, false);
    const hit = $('transparent-shell').checked && !state.isolated ? hits.find(item => meshToPart.get(item.object).inspectionOccluder !== true) || hits[0] : hits[0];
    return hit && meshToPart.get(hit.object);
  }
  renderer.domElement.addEventListener('pointerdown', event => {
    state.dragging = true; state.pointerDown = { x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false }; renderer.domElement.setPointerCapture(event.pointerId); $('hover-label').hidden = true;
  });
  renderer.domElement.addEventListener('pointermove', event => {
    if (state.dragging && state.pointerDown) {
      const point = state.pointerDown, dx = event.clientX - point.lastX, dy = event.clientY - point.lastY;
      if (Math.hypot(event.clientX - point.x, event.clientY - point.y) > 4) point.moved = true;
      if (point.moved) { state.yaw -= dx * .008; state.pitch = Math.max(-1.35, Math.min(1.35, state.pitch + dy * .008)); document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', 'false')); }
      point.lastX = event.clientX; point.lastY = event.clientY; return;
    }
    const hit = pick(event); $('hover-label').hidden = !hit || !actualLabel(hit); renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
    if (hit && actualLabel(hit)) { const rect = renderer.domElement.getBoundingClientRect(); $('hover-label').textContent = actualLabel(hit); $('hover-label').style.left = `${Math.max(8, Math.min(rect.width - 225, event.clientX - rect.left + 12))}px`; $('hover-label').style.top = `${Math.max(8, Math.min(rect.height - 60, event.clientY - rect.top + 12))}px`; }
  });
  renderer.domElement.addEventListener('pointerup', event => {
    if (state.pointerDown && !state.pointerDown.moved) { const hit = pick(event); if (hit) selectPart(hit.id); }
    state.dragging = false; state.pointerDown = null; if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
  });
  renderer.domElement.addEventListener('pointercancel', () => { state.dragging = false; state.pointerDown = null; });
  renderer.domElement.addEventListener('pointerleave', () => $('hover-label').hidden = true);
  function zoom(factor) { state.distance = Math.max(state.fitDistance * .06, Math.min(state.fitDistance * 3.5, state.distance * factor)); }
  renderer.domElement.addEventListener('wheel', event => { event.preventDefault(); zoom(Math.exp(Math.max(-100, Math.min(100, event.deltaY)) * .002)); }, { passive: false });
  $('zoom-in').addEventListener('click', () => zoom(.82)); $('zoom-out').addEventListener('click', () => zoom(1.22));
  $('fit-model').addEventListener('click', () => { fitModel(); });
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    const view = button.dataset.view; state.yaw = sideDirection * (view === 'side' ? Math.PI / 2 : view === 'opposite' ? -Math.PI / 2 : view === 'front' ? 0 : 1.05); state.pitch = ['isometric', 'perspective'].includes(view) ? .39 : 0;
    document.querySelectorAll('[data-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); fitModel();
  }));
  $('focus-selected').addEventListener('click', () => {
    const part = parts.find(item => item.id === state.selected); if (!part) return;
    if (!part.group.visible) { state.visible.add(part.id); state.isolated = null; applyVisibility(); }
    const box = new THREE.Box3().setFromObject(part.group); box.getCenter(state.target);
    state.distance = Math.max(box.getSize(new THREE.Vector3()).length() * 2, 10);
  });
  $('isolate').addEventListener('click', () => { state.isolated = state.isolated ? null : state.selected; applyVisibility(); fitModel(); });
  $('detail-isolate').addEventListener('click', () => { state.isolated = state.selected; applyVisibility(); fitModel(); });
  $('toggle-selected').addEventListener('click', () => {
    const part = parts.find(item => item.id === state.selected); if (!part) return;
    const wasVisible = part.group.visible; state.isolated = null; wasVisible ? state.visible.delete(part.id) : state.visible.add(part.id); applyVisibility();
  });
  $('show-all').addEventListener('click', () => { state.visible = new Set(parts.map(part => part.id)); state.isolated = null; applyVisibility(); fitModel(); });
  $('part-search').addEventListener('input', renderList);
  $('layer-progress').addEventListener('input', event => {
    if (state.mode === 'structure') { state.visible = new Set(parts.map(part => part.id)); state.isolated = null; applyVisibility(); }
    state.progress = Math.max(0, Math.min(1, Number(event.target.value) / 100)); state.mode = state.progress > 0 ? 'exploded' : 'assembled'; applyProgress(); fitModel();
  });
  if (sharedShell) document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => applyMode(button.dataset.mode)));
  else {
    $('layout-assembled').addEventListener('click', () => applyMode('assembled'));
    $('layout-expanded').addEventListener('click', () => applyMode('exploded'));
  }
  $('transparent-shell').addEventListener('change', applyMaterials);
  $('reset-model').addEventListener('click', () => {
    state.mode = 'exploded'; state.progress = .65; state.visible = new Set(parts.map(part => part.id)); state.isolated = null; state.yaw = sideDirection * 1.05; state.pitch = .39;
    $('part-search').value = ''; $('show-labels').checked = true; $('transparent-shell').checked = true;
    applyProgress(); applyVisibility(); selectPart(parts[0].id); fitModel();
    document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(['isometric', 'perspective'].includes(button.dataset.view))));
  });
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); error('浏览器三维渲染上下文已中断。请重新载入页面；手册链接仍可打开。'); });
  function frame() { updateCamera(); renderer.render(scene, camera); updateLabel(); requestAnimationFrame(frame); }
  applyMode(initialMode); selectPart(parts[0].id); resize();
  new ResizeObserver(resize).observe($('canvas-host'));
  $('render-state').textContent = `${parts.length} 个示意组件`;
  requestAnimationFrame(frame);
})();
