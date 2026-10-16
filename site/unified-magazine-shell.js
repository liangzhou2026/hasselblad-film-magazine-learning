/* Additional catalogue models use the original A12 page and its three panels. */
(function (global) {
  'use strict';
  global.MAGAZINE_SHARED_SHELL = false;
  const requested = (new URLSearchParams(location.search).get('model') || 'A12').toUpperCase();
  const model = (global.MANUAL_MAGAZINES || []).find(item => item.id === requested);
  const picker = document.getElementById('magazine-model');
  // One menu in index.html supplies the labels, order and grouping to both viewers.
  picker.value = requested;
  const selectedOption = picker.options[picker.selectedIndex];
  const displayLabel = selectedOption ? selectedOption.textContent.split(' · ')[0] : requested;
  document.getElementById('magazine-title').textContent = `${displayLabel} 后背学习台`;
  document.title = `${displayLabel} · 后背学习台`;
  document.querySelector('.app-footer').firstElementChild.textContent = '手册 16 型后背 · A12 / A16 / A24 拆装学习 · 其他型号结构示意';
  const allModelsLink = document.getElementById('all-models-link');
  if (allModelsLink) allModelsLink.addEventListener('click', event => { event.preventDefault(); picker.focus(); picker.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
  if (!model || ['A12', 'A16', 'A24'].includes(requested)) return;

  global.MAGAZINE_SHARED_SHELL = true;
  global.MAGAZINE_ELEMENT_ALIASES = {
    'library-model': 'magazine-model',
    'model-title': 'magazine-title',
    'model-scope': 'magazine-scope',
    'model-boundary': 'magazine-version',
    'stage-model-name': 'mode-caption',
    'layer-progress': 'explode',
    'layer-value': 'explode-value',
    'layout-status': 'mode-caption',
    'layer-caption': 'selection-caption',
    'source-pdf': 'source-pdf-link',
    'close-source': 'close-dialog',
    'focus-selected': 'focus-part'
  };
  const $ = id => document.getElementById(id);
  document.body.classList.add('free-magazine');
  document.querySelector('.panel-hint').textContent = '点击名称或模型认件；勾选控制显示。';
  document.querySelector('.catalog-tools').innerHTML = '<span class="catalog-note">名称与编号按手册核对</span>';
  const count = document.createElement('p'); count.id = 'search-count'; count.className = 'panel-hint'; count.hidden = true; count.setAttribute('role', 'status'); $('part-search').after(count);
  const version = document.querySelector('.magazine-picker details');
  version.querySelector('a').remove();
  const family = document.createElement('p'); family.id = 'model-family'; version.append(family);

  document.querySelector('.learning-launch').innerHTML = '<span class="learning-context">自由观察</span><p>旋转、分层与独立查看零件 <span>· 仅作结构示意</span></p>';
  document.querySelector('[data-mode="lubrication"]').remove();
  $('workflow-controls').remove(); $('lesson-controls').remove();
  document.querySelectorAll('[data-tab="learn"], [data-tab="steps"], [data-tab="care"]').forEach(element => element.remove());
  ['learn-panel', 'steps-panel', 'care-panel', 'video-dialog'].forEach(id => $(id).remove());
  document.querySelector('[data-mode="assembled"]').id = 'layout-assembled';
  document.querySelector('[data-mode="exploded"]').id = 'layout-expanded';
  $('show-lube').parentElement.innerHTML = '<input id="transparent-shell" type="checkbox" checked> 外壳半透明';
  document.querySelector('#free-controls .model-boundary').textContent = '仅作结构展示；分层方向、形状与间距为示意，不表示拆卸或安装顺序。';
  $('part-panel').innerHTML = '<div class="eyebrow">PART · REFERENCE</div><h2 id="part-name">选择零件</h2><p id="part-english" class="part-english"></p><div id="part-number" class="part-number"></div><p id="part-description"></p><p id="part-relation"></p><div class="selection-actions"><button id="detail-isolate">独立放大</button><button id="toggle-selected">隐藏零件</button></div><h3>手册依据</h3><div id="part-pages" class="source-links"></div><p id="part-location" class="source-note"></p><div class="info-note" id="part-boundary"></div>';
  $('sources-panel').innerHTML = '<div class="eyebrow">REFERENCE</div><h2>文献与模型资料</h2><p>名称与编号仅采用手册中可核对的内容；未确认处不标注。形状、孔位、厚度和分层距离为展示近似。</p><h3>本型号手册页索引</h3><div id="model-pages" class="source-links"></div><details id="model-differences"><summary>共用件与型号差异</summary><ul id="difference-list"></ul></details><h3>保存三维模型</h3><div class="source-links"><a id="download-model">下载 3D（GLB）↓</a><a id="download-parts">零件表（JSON）↓</a></div><div class="manual-library-links"><button data-public-document="manual">阅读维修手册（66 页）</button><button data-public-document="user">阅读使用说明书（23 页）</button><button data-public-document="bulletins">阅读改型通告（193 页）</button></div><p><a href="https://www.galerie-photo.com/manuels/hasselblad-magasins.pdf" target="_blank" rel="noopener">维修手册来源站（66 页） ↗</a></p><p>本站提供原厂维修手册、使用说明书和改型通告，保留来源说明。个人参考照片不包含在公开版中。</p><div class="info-note">独立社区学习项目，与 Hasselblad 无隶属或背书关系。仅作三维结构演示，不作为实际装配、拆卸或维修依据。</div>';
  document.querySelectorAll('.info-tabs [data-tab]').forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.tab;
    document.querySelectorAll('.info-tabs [data-tab]').forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.tab === selected)));
    ['part', 'sources'].forEach(id => $(id + '-panel').hidden = id !== selected);
  }));
  $('open-manual').addEventListener('click', () => {
    const firstPage = (model.pages || [2])[0];
    global.PublicResources.openDocument('manual', firstPage);
  });
})(window);
