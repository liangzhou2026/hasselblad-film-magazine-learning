/* Independent localization audit. Executes actual data builders and i18n.js.
 * DOM/MutationObserver are controlled doubles; this does not claim browser rendering. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const site = path.resolve(__dirname, '../site');
const read = name => fs.readFileSync(path.join(site, name), 'utf8');
const hasHan = value => /[\u3400-\u9fff]/.test(value);
const results = [], failures = [], residual = [], numericChanges = [], samples = [], modelResults = [];
const seen = new Set();
function check(name, action) { try { action(); results.push(name); } catch (error) { failures.push({ name, error: error.stack }); } }

class TextNode {
  constructor(value) { this.nodeType = 3; this.nodeValue = value; this.parentElement = null; }
  get isConnected() { return !!this.parentElement?.isConnected; }
}
class Element {
  constructor(tag = 'div') { this.nodeType = 1; this.tagName = tag.toUpperCase(); this.children = []; this.parentElement = null; this.attributes = {}; this.dataset = {}; this.listeners = {}; this.value = ''; this.className = ''; }
  get isConnected() { return this.tagName === 'HTML' || !!this.parentElement?.isConnected; }
  append(...nodes) { for (const node of nodes) { this.children.push(node); node.parentElement = this; } }
  matches(selectors) { return selectors.split(',').some(raw => { const selector = raw.trim(); const tag = selector.match(/^[a-z]+/i)?.[0]; if (tag && this.tagName !== tag.toUpperCase()) return false; const cls = selector.match(/\.([\w-]+)/)?.[1]; if (cls && !this.className.split(/\s+/).includes(cls)) return false; const attrs = [...selector.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)]; for (const [,name,value] of attrs) if (!this.hasAttribute(name) || (value !== undefined && this.getAttribute(name) !== value)) return false; return !!(tag || cls || attrs.length); }); }
  closest(selector) { for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node; return null; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
  addEventListener(name, handler) { (this.listeners[name] ||= []).push(handler); }
}
function localization() {
  const html = new Element('html'), head = new Element('head'), body = new Element('body'), select = new Element('select');
  html.append(head, body); select.setAttribute('data-no-i18n', ''); body.append(select);
  const observers = [], storage = new Map(), events = [];
  const document = { documentElement: html, head, body,
    getElementById(id) { return id === 'language-select' ? select : null; }, addEventListener() {},
    createTreeWalker(root, types, filter) { const nodes = []; const walk = node => { for (const child of node.children || []) { if (filter.acceptNode(child) === 2) continue; nodes.push(child); walk(child); } }; walk(root); let index = 0; return { nextNode() { return nodes[index++] || null; } }; }
  };
  const ctx = vm.createContext({ document, console, URL, URLSearchParams,
    location: { search: '?model=A12&lang=zh', href: 'http://127.0.0.1/site/index.html?model=A12&lang=zh' }, history: { replaceState() {} },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    NodeFilter: { SHOW_ELEMENT: 1, SHOW_TEXT: 4, FILTER_REJECT: 2, FILTER_ACCEPT: 1 },
    MutationObserver: class { constructor(fn) { this.callback = fn; observers.push(this); } disconnect() {} observe() {} },
    CustomEvent: class { constructor(type, values) { this.type = type; Object.assign(this, values); } }, dispatchEvent: event => events.push(event)
  });
  ctx.window = ctx;
  for (const file of ['i18n-catalog-en.js', 'i18n-parts-en.js', 'i18n-courses-en.js', 'i18n-ui-en.js', 'i18n.js']) vm.runInContext(read(file), ctx, { filename: file });
  return { ctx, document, body, head, select, storage, events, emit: records => observers[0].callback(records) };
}
const locale = localization(), english = value => locale.ctx.A12_I18N.english(value);
function capture(scope, field, source) {
  if (typeof source !== 'string' || !hasHan(source)) return;
  const key = scope + '\n' + field + '\n' + source; if (seen.has(key)) return; seen.add(key);
  const translated = english(source); samples.push({ scope, field, source, translated });
  if (hasHan(translated)) residual.push({ scope, field, source, translated });
  // Numeric identifiers, decimal dimensions and digit-form page numbers must survive.
  const originalNumbers = source.match(/\d+(?:\.\d+)?/g) || [];
  const translatedNumbers = translated.match(/\d+(?:\.\d+)?/g) || [];
  const missing = [...new Set(originalNumbers)].filter(number => !translatedNumbers.includes(number));
  if (missing.length) numericChanges.push({ scope, field, source, translated, missing });
}
function textFields(scope, record, fields) { for (const field of fields) capture(scope, field, record[field]); }
const visibleFields = ['name','number','description','care','evidence','lube'];
function canvas() { const element = { width: 0, height: 0 }; const drawing = new Proxy({ canvas: element, measureText: value => ({ width: String(value).length * 40 }) }, { get: (object, key) => key in object ? object[key] : () => {} }); element.getContext = () => drawing; return element; }
const files = ['vendor/three.min.js','magazine-surfaces.js','rollfilm-orientation.js','manual-magazine-catalog.js','parts-data.js','service-sequences.js','detail-model.js','body-details.js','magazine-fasteners.js','magazine-variants.js','assembly-variants.js','disassembly-animation.js','assembly-animation.js','beginner-animation.js','video-library.js','manual-magazine-models.js','precision-factories.js','precision-magazine-models.js','special-magazine-details.js','manual-part-labels.js','free-magazine-layout.js','learning-magazine-model.js'];
function modelContext() { const ctx = vm.createContext({ console: { ...console, warn() {} }, document: { createElement(tag) { assert.equal(tag, 'canvas'); return canvas(); } } }); ctx.window = ctx; ctx.self = ctx; for (const file of files) vm.runInContext(read(file), ctx, { filename: file }); return ctx; }
const modelIds = ['A12','A16','A24','A16S','A32','A12TCC','A16TCC','A24TCC','E12','E16','E24','E12CC','MAGAZINE70','POLAROID100','POLAPLUS','POLABASIC'];
for (const model of modelIds) {
  check(model + ': actual model construction and final visible metadata', () => {
    const ctx = modelContext(), before = samples.length;
    const info = ctx.MANUAL_MAGAZINES.find(value => value.id === model);
    for (const [field, value] of Object.entries(info)) {
      if (Array.isArray(value)) value.forEach((item,index) => { if (typeof item === 'string') capture(model + ':catalog', field + '[' + index + ']', item); });
      else capture(model + ':catalog', field, value);
    }
    let parts;
    if (['A12','A16','A24'].includes(model)) {
      const app = read('app.js'), start = app.indexOf(' const materials='), end = app.indexOf('\n try{', start);
      assert.ok(start >= 0 && end > start);
      vm.runInContext(`{ const T=THREE,scene=new T.Scene(); ${app.slice(start,end)} globalThis.fixture={factories,scene,pickables,detailParts}; }`,ctx);
      const { factories, detailParts } = ctx.fixture;
      detailParts.push(...ctx.buildA12Details(factories).parts, ...ctx.buildA12BodyDetails(factories).parts, ...ctx.buildMagazineFasteners(factories, ctx.A12_SEQUENCES));
      const originalAssembly = JSON.parse(JSON.stringify(ctx.A12_SEQUENCES.assembly));
      const profile = ctx.A12_VARIANTS.prepare(model, { factories, data: ctx.A12_DATA, detailParts, sequences: ctx.A12_SEQUENCES });
      ctx.prepareA12AssemblyVariant(profile, ctx.A12_SEQUENCES, originalAssembly);
      textFields(model + ':final-profile', profile, ['label','scope','serial','boundary']);
      parts = [...ctx.A12_DATA.parts,...detailParts];
      parts.forEach(part => textFields(model + ':' + part.id, part, visibleFields));
      for (const kind of ['disassembly','assembly']) {
        assert.equal(ctx.A12_SEQUENCES[kind].length, kind === 'assembly' ? 26 : 22);
        for (const step of ctx.A12_SEQUENCES[kind]) textFields(model + ':' + kind + ':' + step.id, step, ['title','body','note','warning','evidence']);
      }
      for (const item of ctx.A12_DATA.guide || []) textFields(model + ':guide', item, ['title','body']);
      const searchLine = read('viewer-controller.js').split('\n').find(line => line.startsWith(' function searchablePart('));
      ctx.A12_I18N = locale.ctx.A12_I18N; vm.runInContext(searchLine, ctx);
      for (const part of parts) assert.ok(ctx.searchablePart(part).includes(english(part.name).toLowerCase()), model + ' English searchable name ' + part.id);
    } else {
      const assembly = ctx.buildLearningMagazineModel(ctx.THREE, model); parts = assembly.parts;
      assert.ok(parts.length > 10);
      capture(model + ':assembly', 'boundary', assembly.boundary);
      for (const part of parts) textFields(model + ':' + part.id, part, ['labelName','labelNumber','labelDescription']);
      for (const item of assembly.displayDifferences || []) if (typeof item === 'string') capture(model + ':differences', 'description', item); else textFields(model + ':differences', item, ['title','description']);
      const filterLine = read('magazine-library.js').split('\n').find(line => line.includes('if (filter && !'));
      assert.ok(filterLine && filterLine.includes('window.A12_I18N?.english(operationName(part))'), 'Actual free-model filter lacks English translation');
      const condition = filterLine.slice(filterLine.indexOf('if (')+4, filterLine.lastIndexOf(') return;'));
      ctx.A12_I18N = locale.ctx.A12_I18N;
      vm.runInContext(`function operationName(part) { return part.labelName || '未标注组件'; } function displayNumber(part) { return part.labelNumber || ''; } function rejectsSearch(part,filter) { return ${condition}; }`,ctx);
      for (const part of parts) assert.equal(ctx.rejectsSearch(part, english(part.labelName || '未标注组件').toLowerCase()), false, model + ' translated search ' + part.id);
    }
    if (model === 'A12') {
      for (const video of ctx.A12_VIDEOS) { textFields('video:' + video.id, video, ['title','level','summary','evidence','caution']); for (const clip of video.clips) textFields('video:' + video.id + ':' + clip.start, clip, ['title','basis']); }
      const beginner = ctx.createA12BeginnerAnimation({ groups: {}, requestAnimationFrame() {}, cancelAnimationFrame() {} });
      assert.equal(beginner.lessons.length, 4);
      for (const lesson of beginner.lessons) { textFields('lesson:' + lesson.id, lesson, ['title','description','boundary']); for (const chapter of lesson.chapters || []) textFields('lesson:' + lesson.id + ':' + chapter.start, chapter, ['title','caption']); }
    }
    modelResults.push({ model, parts: parts.length, captured: samples.length-before });
  });
  global.gc?.();
}

const dynamicExamples = [
  'PDF 第 13 页','打开已选择的 PDF · 第 66 页','S7 通告索引 · 第 120 页','照片索引 45',
  '匹配 7 项 · 模型共 122 个组件','12 项可辨认子件','18 总成 · 88 子件','122 个示意组件','88 子件','26 步','1.5 秒，共 28 秒',
  '本地三维动画 · 28 秒 · 可慢放','展开A16中央机构总成的子件','显示 A24释放臂 · 22315',
  'A12 三维结构模型，拖动旋转，滚轮或按钮缩放。',
  '可拖动旋转和滚轮缩放的 A16 三维结构模型；也可以使用左侧零件列表和固定视角按钮。',
  'A12 · 精细内部结构','所属总成：中心机构 ↑','润滑资料：无图示润滑要求',
  '手册原文：Shell。名称按 PDF 第 39 页件表翻译；位置、形状为演示。',
  'A12 · 1 / 22 · 拆卸动画','A16 · 3 / 26 · 安装动画',
];
dynamicExamples.forEach((source,index) => capture('dynamic',String(index),source));
check('actual engine handles dynamic counts, ARIA labels and sentence prefixes', () => {
  const rows = samples.filter(row=>row.scope==='dynamic');
  assert.equal(rows.filter(row=>hasHan(row.translated)).length,0,JSON.stringify(rows.filter(row=>hasHan(row.translated))));
});

check('Chinese-English-Chinese roundtrip preserves original text and attributes', () => {
  const parent = new Element('button'), text = new TextNode('后背外壳'); parent.append(text); parent.setAttribute('aria-label','显示后背外壳'); locale.body.append(parent);
  locale.ctx.A12_I18N.setLanguage('en'); assert.equal(text.nodeValue,english('后背外壳')); assert.equal(parent.getAttribute('aria-label'),'Show '+english('后背外壳'));
  locale.ctx.A12_I18N.setLanguage('zh'); assert.equal(text.nodeValue,'后背外壳'); assert.equal(parent.getAttribute('aria-label'),'显示后背外壳');
});
check('dynamic new nodes, changed text and changed attributes are translated and restored', () => {
  locale.ctx.A12_I18N.setLanguage('en'); const parent = new Element('button'), text = new TextNode('压片板与板簧'); parent.append(text); parent.setAttribute('title','中心机构'); locale.body.append(parent);
  locale.emit([{type:'childList',addedNodes:[parent]}]); assert.equal(text.nodeValue,english('压片板与板簧')); assert.equal(parent.getAttribute('title'),english('中心机构'));
  text.nodeValue = 'A16中央机构总成'; locale.emit([{type:'characterData',target:text}]); assert.equal(text.nodeValue,english('A16中央机构总成'));
  parent.setAttribute('title','A24释放臂'); locale.emit([{type:'attributes',target:parent}]); assert.equal(parent.getAttribute('title'),english('A24释放臂'));
  locale.ctx.A12_I18N.setLanguage('zh'); assert.equal(text.nodeValue,'A16中央机构总成'); assert.equal(parent.getAttribute('title'),'A24释放臂');
});
check('input value and editable/local filename text remain untouched', () => {
  const input = new Element('input'); input.value='我的胶卷 22371'; input.setAttribute('placeholder','查名称或零件编号'); locale.body.append(input);
  const editable = new Element('div'); editable.setAttribute('contenteditable','true'); const text = new TextNode('后背外壳'); editable.append(text); locale.body.append(editable);
  const filename = new Element('span'); filename.className='local-pdf-name'; const fileText=new TextNode('我的维修手册.pdf'); filename.append(fileText); locale.body.append(filename);
  locale.ctx.A12_I18N.setLanguage('en'); assert.equal(input.value,'我的胶卷 22371'); assert.equal(input.getAttribute('placeholder'),english('查名称或零件编号')); assert.equal(text.nodeValue,'后背外壳'); assert.equal(fileText.nodeValue,'我的维修手册.pdf');
  locale.ctx.A12_I18N.setLanguage('zh'); assert.equal(input.value,'我的胶卷 22371'); assert.equal(input.getAttribute('placeholder'),'查名称或零件编号');
});
check('language changes preserve arbitrary playback state and do not reload', () => {
  const playback = { sequencePlaying: true, sequenceProgress: 43.5, step: 3, workflow: 'assembly' }; locale.ctx.A12_APP = { state: playback };
  const before=JSON.stringify(playback); locale.ctx.A12_I18N.setLanguage('en'); locale.ctx.A12_I18N.setLanguage('zh'); assert.equal(JSON.stringify(playback),before);
  assert.equal(locale.ctx.location.href,'http://127.0.0.1/site/index.html?model=A12&lang=zh');
});
check('numeric identifiers, decimal dimensions and digit-form page references survive translation', () => {
  assert.equal(numericChanges.length, 0, JSON.stringify(numericChanges));
});
check('all sampled final model and course text is translated without remaining Chinese', () => {
  assert.equal(residual.length, 0, JSON.stringify(residual.slice(0, 20)));
});
console.log(JSON.stringify({
  checks: { passed: results.length, failed: failures.length },
  models: modelResults.length,
  parts: modelResults.reduce((total, model) => total + model.parts, 0),
  capturedStrings: samples.length,
  remainingChinese: residual.length,
  numericChanges: numericChanges.length,
  scope: 'Actual model builders and localization engine; controlled DOM, no browser or GPU assertion.',
  ...(failures.length ? { failures } : {}),
  ...(residual.length ? { residual: residual.slice(0, 20) } : {}),
  ...(numericChanges.length ? { numericChangeDetails: numericChanges.slice(0, 12) } : {})
}));
if (failures.length || residual.length || numericChanges.length) process.exitCode = 1;
