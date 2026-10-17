/* Move existing controls without rebuilding a viewer or changing playback. */
(function () {
  'use strict';
  const workspace = document.querySelector('.workspace');
  const parts = document.querySelector('.parts-panel');
  const info = document.querySelector('.info-panel');
  const stage = document.querySelector('.stage-panel');
  const picker = document.querySelector('.magazine-picker');
  const viewport = document.getElementById('viewport');
  const viewButtons = document.querySelector('.view-buttons');
  if (!workspace || !parts || !info || !stage || !picker || !viewport || !viewButtons) return;

  const pickerHome = document.createComment('Original model-picker position');
  picker.before(pickerHome);
  const dock = document.createElement('section');
  dock.className = 'responsive-model-dock';
  workspace.before(dock);

  const jumpNav = document.createElement('nav');
  jumpNav.className = 'responsive-jump-nav';
  jumpNav.dataset.noI18n = '';
  dock.after(jumpNav);
  const targets = [stage, parts, info];
  const targetIds = ['responsive-model', 'responsive-parts', 'responsive-reference'];
  const labels = { zh: ['3D 观察', '零件列表', '学习资料'], en: ['3D view', 'Parts', 'Reference'] };
  const links = targets.map((target, index) => {
    target.id = target.id || targetIds[index];
    const link = document.createElement('a');
    link.href = '#' + target.id;
    link.addEventListener('click', event => {
      event.preventDefault();
      target.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    jumpNav.append(link);
    return link;
  });

  const viewTools = document.createElement('details');
  viewTools.className = 'responsive-view-tools';
  const viewSummary = document.createElement('summary');
  viewSummary.dataset.noI18n = '';
  viewTools.append(viewSummary, viewButtons);
  viewport.append(viewTools);

  const compactPicker = matchMedia('(max-width: 1199px)');
  const compactViews = matchMedia('(max-width: 1023px)');
  function placePicker() {
    if (compactPicker.matches) dock.append(picker);
    else pickerHome.after(picker);
  }
  function placeViews() { viewTools.open = !compactViews.matches; translate(); }
  function translate() {
    const english = document.documentElement.lang.startsWith('en');
    const lang = english ? 'en' : 'zh';
    links.forEach((link, index) => { link.textContent = labels[lang][index]; });
    jumpNav.setAttribute('aria-label', english ? 'Jump to a learning area' : '跳转学习区域');
    dock.setAttribute('aria-label', english ? 'Choose a magazine' : '选择后背型号');
    viewSummary.textContent = english ? 'Views and zoom' : '视角与缩放';
    const hint = viewport.querySelector('.stage-instructions')?.firstChild;
    if (hint?.nodeType === 3) hint.nodeValue = compactViews.matches
      ? (english ? 'One finger to rotate · Pinch to zoom · Tap to select' : '单指旋转 · 双指缩放 · 点击选择')
      : (english ? 'Drag to rotate · Scroll to zoom · Click to select' : '拖动旋转 · 滚轮缩放 · 点击选择');
  }
  compactPicker.addEventListener('change', placePicker);
  compactViews.addEventListener('change', placeViews);
  window.addEventListener('a12-languagechange', translate);
  placePicker();
  placeViews();
  translate();
})();
