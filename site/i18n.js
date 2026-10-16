/* Presentation-only localization. Does not mutate model data or restart playback. */
(function (global) {
  'use strict';
  const dictionary = Object.assign(Object.create(null), global.A12_EN_CATALOG, global.A12_EN_PARTS, global.A12_EN_COURSES, global.A12_EN_UI);
  const cjk = /[\u3400-\u9fff]/;
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const keys = Object.keys(dictionary).filter(key => cjk.test(key)).sort((a, b) => b.length - a.length);
  const phrases = new RegExp(keys.map(escape).join('|'), 'g');
  const cache = new Map(), originals = new WeakMap(), attributes = new WeakMap();
  const excluded = 'script,style,[contenteditable],.local-pdf-name,[data-no-i18n]';
  const attrNames = ['aria-label', 'aria-valuetext', 'title', 'placeholder', 'label', 'alt'];
  let language = 'zh', observer;
  const normalize = value => value === 'en' ? 'en' : ['zh', 'zh-CN'].includes(value) ? 'zh' : null;
  try { language = normalize(new URLSearchParams(location.search).get('lang')) || normalize(localStorage.getItem('a12-language')) || 'zh'; } catch (_) {}

  function english(value) {
    const source = String(value ?? '');
    if (!cjk.test(source)) return source;
    if (cache.has(source)) return cache.get(source);
    const trimmed = source.trim();
    let result;
    if (Object.hasOwn(dictionary, trimmed)) result = source.replace(trimmed, dictionary[trimmed]);
    else {
      result = source
        .replace(/PolaBasic 共用件依据 PDF 第 (\d+) 页的共用说明。/g, 'Shared PolaBasic parts follow the common-parts notes on PDF page $1.')
        .replace(/手册原文：(.*?)。名称按 PDF 第 (\d+) 页件表翻译；位置、形状为演示。/g, (_, term, page) => `Manual term: ${term}. Name from the parts list on PDF page ${page}; position and shape are illustrative. `)
        .replace(/名称按 PDF 第 (\d+) 页件表翻译；位置、形状为演示。/g, 'Name from the parts list on PDF page $1; position and shape are illustrative. ')
        .replace(/^所选 (\S+) 片芯中的(.+?)；结构与编号对照 PDF ([\d、]+)。$/, (_, model, part, pages) => `Selected ${model} insert: ${english(part)}. See PDF pages ${pages.replace(/、/g, ', ')} for structure and part numbers.`)
        .replace(/^原厂件表列 (\d+) 枚 ([^；]+)；此处逐件展开用于清点，位置和松紧次序为示意。$/, 'The factory parts list specifies $1 screws $2. Each is separated for counting; positions and tightening/loosening order are illustrative.')
        .replace(/^([A-Z0-9]+)增加独立片芯电路端盖、ISO(和第二)?拨盘、定位钢珠\/弹簧、柔性电路、四根导线和两组不同接点；不沿用普通A12片芯编号。$/, (_, model, second) => `${model} adds a separate electronic insert end cap, ${second ? 'ISO and second dials' : 'ISO dial'}, a detent ball/spring, flexible circuit, four wires and two different contact sets; standard A12 insert part numbers are not reused.`)
        .replace(/打开已选择的 PDF · 第 (\d+) 页/g, 'Open selected PDF · Page $1')
        .replace(/S7 通告索引 · 第 (\d+) 页/g, 'S7 bulletin index · Page $1')
        .replace(/PDF 第\s*(\d+)\s*页/g, 'PDF page $1')
        .replace(/照片索引 (\d+)/g, 'Photo reference $1')
        .replace(/匹配 (\d+) 项 · 模型共 (\d+) 个组件/g, '$1 matches · $2 components in model')
        .replace(/(\d+) 项可辨认子件/g, '$1 identifiable parts')
        .replace(/(\d+) 总成 · (\d+) 子件/g, '$1 assemblies · $2 parts')
        .replace(/(\d+) 个示意组件/g, '$1 illustrative components')
        .replace(/(\d+) 子件/g, '$1 parts')
        .replace(/(\d+) 步/g, '$1 steps')
        .replace(/([\d.]+) 秒，共 ([\d.]+) 秒/g, '$1 seconds of $2 seconds')
        .replace(/本地三维动画 · (\d+) 秒 · 可慢放/g, 'Local 3D animation · $1 seconds · Slow playback available')
        .replace(/^展开(.+)的子件$/, (_, name) => 'Expand parts of ' + english(name))
        .replace(/^显示\s*(.+)$/, (_, name) => 'Show ' + english(name))
        .replace(/可拖动旋转和滚轮缩放的 (.+?) 三维结构模型；也可(?:以使用左侧|使用)零件列表和(?:固定)?视角按钮。/g, (_, model) => `${model} 3D model. Drag to rotate, scroll to zoom, or use the part list and preset-view buttons.`)
        .replace(/(.+?) 三维结构模型，拖动旋转，滚轮或按钮缩放。/g, (_, model) => `${model} 3D model. Drag to rotate; scroll or use the buttons to zoom.`)
        .replace(/三维模型无法显示：(.+?)。请确认浏览器支持 WebGL，并重新载入页面。型号信息与维修手册仍可查看。/g, (_, error) => 'Unable to display the 3D model: ' + english(error) + '. Check WebGL support and reload. Model information and manual references remain available.');
      result = result.replace(phrases, match => dictionary[match]);
    }
    if (!cjk.test(result)) result = result.replace(/，/g, ', ').replace(/；/g, '; ').replace(/：/g, ': ').replace(/。/g, '. ').replace(/（/g, ' (').replace(/）/g, ')');
    if (cache.size > 6000) cache.clear();
    cache.set(source, result);
    return result;
  }
  function t(value) { return language === 'en' ? english(value) : String(value ?? ''); }
  function translateText(node) {
    if (!node.parentElement || node.parentElement.closest(excluded + ',textarea,input')) return;
    const current = node.nodeValue;
    let record = originals.get(node);
    if (!record || current !== record.output) record = { source: current, output: current };
    const output = t(record.source);
    record.output = output; originals.set(node, record);
    if (current !== output) node.nodeValue = output;
  }
  function translateAttributes(element) {
    if (element.closest('[data-no-i18n],.local-pdf-name')) return;
    let records = attributes.get(element);
    if (!records) { records = new Map(); attributes.set(element, records); }
    for (const name of attrNames) {
      if (!element.hasAttribute(name)) continue;
      const current = element.getAttribute(name);
      let record = records.get(name);
      if (!record || current !== record.output) record = { source: current, output: current };
      record.output = t(record.source); records.set(name, record);
      if (current !== record.output) element.setAttribute(name, record.output);
    }
    if (element.matches('meta[name="description"]')) {
      const current = element.content, record = records.get('content') || { source: current };
      record.output = t(record.source); records.set('content', record); element.content = record.output;
    }
  }
  function translateTree(root) {
    if (root.nodeType === 3) { translateText(root); return; }
    if (root.nodeType !== 1 || root.closest(excluded)) return;
    translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) { return node.nodeType === 1 && node.matches(excluded) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    let node;
    while ((node = walker.nextNode())) node.nodeType === 3 ? translateText(node) : translateAttributes(node);
  }
  function observe() { observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attrNames }); }
  function refresh() {
    observer.disconnect(); translateTree(document.head); translateTree(document.body); observe();
  }
  function setLanguage(value) {
    language = normalize(value) || 'zh';
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    document.documentElement.dataset.language = language;
    document.getElementById('language-select').value = language;
    try { localStorage.setItem('a12-language', language); } catch (_) {}
    try { const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url); } catch (_) {}
    refresh();
    global.dispatchEvent(new CustomEvent('a12-languagechange', { detail: { language } }));
  }
  observer = new MutationObserver(records => {
    observer.disconnect();
    const roots = new Set();
    for (const record of records) {
      if (record.type === 'attributes') translateAttributes(record.target);
      else if (record.type === 'characterData') translateText(record.target);
      else for (const node of record.addedNodes) roots.add(node);
    }
    for (const node of roots) if (node.isConnected) translateTree(node);
    observe();
  });
  global.A12_I18N = Object.freeze({ t, english, setLanguage, refresh, get language() { return language; } });
  document.getElementById('language-select').addEventListener('change', event => setLanguage(event.target.value));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-model-link]');
    if (!link) return;
    const url = new URL(link.href, location.href); url.searchParams.set('lang', language); link.href = url.href;
  }, true);
  setLanguage(language);
})(window);
