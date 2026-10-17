/* Original reference documents are read on demand; personal photographs stay excluded. */
(function (global) {
  'use strict';
  const sources = Object.freeze({
    manual: { title: 'Film Magazines 维修手册', pages: 66, pdf: 'manuals/service-manual.pdf', pagePrefix: 'manuals/pages/service-p', pageDigits: 2, url: 'https://www.galerie-photo.com/manuels/hasselblad-magasins.pdf', source: 'Galerie-photo 保存的原厂维修手册' },
    user: { title: 'A-type Film Magazines 使用说明书', pages: 23, pdf: 'manuals/user-manual.pdf', pagePrefix: 'manuals/pages/user-p', pageDigits: 2, url: 'https://butkus.org/chinon/hasselblad/hasselblad_a-type_magazines/hasselblad_a-type_magazines.htm', source: 'Butkus 使用说明书来源页' },
    bulletins: { title: 'Service Infos 改型通告', pages: 193, pdf: 'manuals/service-bulletins.pdf', pagePrefix: 'manuals/pages/bulletin-p', pageDigits: 3, url: '', source: '项目目录中的 S7 改型通告合集，193 页；公开来源地址尚未核实' }
  });
  const localFiles = new Map();
  const $ = id => document.getElementById(id);
  let activeDocument = null, readerRevision = 0;
  function validPage(value, kind) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 1 && number <= sources[kind].pages ? number : 1;
  }
  function paragraph(text, className) {
    const element = document.createElement('p'); element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function resetDialog(title, caption) {
    readerRevision++; activeDocument = null;
    $('source-title').textContent = title; $('source-caption').textContent = caption;
    const image = $('source-image'); image.onload = null; image.onerror = null;
    image.hidden = true; image.removeAttribute('src');
    document.querySelector('.source-image-wrap').append(image);
    const oldError = $('source-error'); if (oldError) oldError.hidden = true;
    $('source-pdf-link').hidden = true; $('source-pdf-link').removeAttribute('href');
    let content = $('public-source-content');
    if (!content) { content = document.createElement('div'); content.id = 'public-source-content'; content.className = 'public-source-content'; document.querySelector('.source-image-wrap').append(content); }
    content.replaceChildren(); content.classList.remove('document-reader');
    return content;
  }
  function showDialog() {
    const dialog = $('source-dialog');
    if (!dialog.open) dialog.showModal();
    document.querySelector('.source-image-wrap').scrollTop = 0;
  }
  function openDocument(kind = 'manual', value = 1) {
    if (!Object.hasOwn(sources, kind)) return;
    const source = sources[kind], page = validPage(value, kind);
    const content = resetDialog(source.title + ' · PDF 第 ' + page + ' 页', 'PDF 阅读器页码从封面算第 1 页；不同扫描版本的页码可能不同。');
    const revision = readerRevision; activeDocument = { kind, page }; content.classList.add('document-reader');
    const pdfUrl = source.pdf + '#page=' + page + '&view=FitH';
    const pdfLink = $('source-pdf-link'); pdfLink.href = pdfUrl; pdfLink.textContent = '新窗口打开 PDF 此页 ↗'; pdfLink.hidden = false;
    const toolbar = document.createElement('div'); toolbar.className = 'manual-toolbar';
    const chooser = document.createElement('select'); chooser.id = 'manual-document-select'; chooser.setAttribute('aria-label', '选择参考资料');
    for (const [key, documentSource] of Object.entries(sources)) {
      const option = document.createElement('option'); option.value = key; option.textContent = documentSource.title;
      chooser.append(option);
    }
    chooser.value = kind; chooser.addEventListener('change', () => openDocument(chooser.value, 1));
    const previous = document.createElement('button'); previous.type = 'button'; previous.id = 'manual-prev'; previous.textContent = '上一页'; previous.disabled = page === 1;
    previous.addEventListener('click', () => openDocument(kind, page - 1));
    const next = document.createElement('button'); next.type = 'button'; next.id = 'manual-next'; next.textContent = '下一页'; next.disabled = page === source.pages;
    next.addEventListener('click', () => openDocument(kind, page + 1));
    const form = document.createElement('form'); form.className = 'manual-page-form'; form.noValidate = true;
    const pageLabel = document.createElement('label'); pageLabel.htmlFor = 'manual-page-input'; pageLabel.textContent = '页码';
    const pageInput = document.createElement('input'); pageInput.id = 'manual-page-input'; pageInput.type = 'number'; pageInput.min = '1'; pageInput.max = String(source.pages); pageInput.step = '1'; pageInput.value = String(page); pageInput.required = true; pageInput.setAttribute('aria-label', 'PDF 页码');
    const total = document.createElement('span'); total.textContent = '/ ' + source.pages;
    const go = document.createElement('button'); go.type = 'submit'; go.textContent = '跳转';
    form.append(pageLabel, pageInput, total, go); toolbar.append(chooser, previous, form, next); content.append(toolbar);
    const status = paragraph('', 'manual-reader-status'); status.id = 'manual-reader-status'; status.setAttribute('role', 'status'); content.append(status);
    form.addEventListener('submit', event => {
      event.preventDefault(); const target = Number(pageInput.value);
      if (!Number.isInteger(target) || target < 1 || target > source.pages) {
        status.textContent = '请输入有效页码。'; pageInput.setAttribute('aria-invalid', 'true'); pageInput.focus(); return;
      }
      openDocument(kind, target);
    });
    const viewer = document.createElement('div'); viewer.className = 'manual-page-viewer'; content.append(viewer);
    const image = $('source-image'); image.alt = source.title + ' · PDF 第 ' + page + ' 页'; image.hidden = false;
    status.textContent = '正在载入原图…';
    image.onload = () => { if (readerRevision === revision) status.textContent = '手册原图 · 可在新窗口打开完整 PDF'; };
    image.onerror = () => {
      if (readerRevision !== revision) return;
      image.hidden = true; status.textContent = '原图未能载入，请使用“新窗口打开 PDF 此页”查看或下载完整手册。';
    };
    viewer.append(image); image.src = source.pagePrefix + String(page).padStart(source.pageDigits, '0') + '.jpg';
    const actions = document.createElement('div'); actions.className = 'manual-document-actions';
    const download = document.createElement('a'); download.href = source.pdf; download.download = source.pdf.split('/').pop(); download.textContent = '下载原版 PDF ↓'; actions.append(download);
    if (source.url) {
      const external = document.createElement('a'); external.href = source.url; external.target = '_blank'; external.rel = 'noopener'; external.textContent = '查看公开来源 ↗'; actions.append(external);
    }
    content.insertBefore(actions, status);
    content.append(paragraph('文献来源：' + source.source, 'source-note'), paragraph('手册与扫描件版权归原权利人；不适用项目代码的 MIT 许可证。三维形状和动画位移为教学重建，请对照原文与实物。', 'source-note'));
    const section = document.createElement('details'); section.className = 'local-pdf-option';
    const summary = document.createElement('summary'); summary.textContent = '可选：选择自己的 PDF';
    const label = document.createElement('label'); label.htmlFor = 'public-local-pdf'; label.textContent = '选择本地同版 PDF';
    const input = document.createElement('input'); input.id = 'public-local-pdf'; input.type = 'file'; input.accept = '.pdf,application/pdf';
    const localStatus = paragraph('文件仅在当前浏览器会话中使用，不上传，也不加入公开包。刷新后需重新选择。', 'source-note');
    section.append(summary, label, input, localStatus);
    const localResult = document.createElement('div'); section.append(localResult);
    function showLocal(local) {
      localResult.replaceChildren();
      const link = document.createElement('a'); link.href = local.url + '#page=' + page; link.target = '_blank'; link.rel = 'noopener';
      link.textContent = '打开已选择的 PDF · 第 ' + page + ' 页 ↗'; localResult.append(paragraph(local.name, 'local-pdf-name'), link);
    }
    const local = localFiles.get(kind);
    if (local) showLocal(local);
    input.addEventListener('change', () => {
      const file = input.files && input.files[0]; if (!file) return;
      if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') { localStatus.textContent = '请选择 PDF 文件。'; return; }
      const previous = localFiles.get(kind); if (previous) URL.revokeObjectURL(previous.url);
      const local = { name: file.name, url: URL.createObjectURL(file) }; localFiles.set(kind, local); showLocal(local);
    });
    content.append(section); showDialog();
  }
  function openPhoto(reference) {
    const content = resetDialog('个人照片参考 · ' + reference.label, '照片索引 ' + reference.n + ' · 公开版不包含原始照片');
    content.append(paragraph('开发时曾以维护者提供的实物照片辅助辨认外观和局部结构。当前公开版没有附带这些个人收集照片，也不将其再分发许可包含在代码的 MIT 许可证中。'));
    content.append(paragraph('此索引仅记录研究依据。不同后背的代际、序列号和零件状态可能不同；散放的备件不代表实际装配数量。'));
    showDialog();
  }
  function releaseAssetUrl(filename) {
    const config = global.PUBLIC_RELEASE_CONFIG || {};
    let repository = config.repository || '';
    if (!repository && config.repoUrl) {
      try {
        const url = new URL(config.repoUrl);
        if (url.protocol === 'https:' && url.hostname === 'github.com' && !url.username && !url.password && !url.search && !url.hash) repository = url.pathname.replace(/^\/|\/$/g, '');
      } catch (_) { return null; }
    }
    if (typeof repository !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(repository)) return null;
    if (['.', '..'].includes(repository.split('/')[1])) return null;
    if (!config.releaseTag || typeof config.releaseTag !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(config.releaseTag)) return null;
    if (!/^[a-z0-9-]+\.(glb|parts\.json)$/.test(filename)) return null;
    return 'https://github.com/' + repository + '/releases/download/' + encodeURIComponent(config.releaseTag) + '/' + encodeURIComponent(filename);
  }
  function bindDownload(anchor, filename) {
    if (!anchor) return;
    const url = releaseAssetUrl(filename);
    anchor.removeAttribute('download');
    if (url) {
      anchor.href = url; anchor.target = '_blank'; anchor.rel = 'noopener';
      anchor.removeAttribute('aria-disabled'); anchor.removeAttribute('tabindex');
    } else {
      anchor.removeAttribute('href'); anchor.setAttribute('aria-disabled', 'true'); anchor.setAttribute('tabindex', '-1');
    }
    let note = $('public-download-status');
    if (!note) { note = paragraph('', 'public-download-status'); note.id = 'public-download-status'; anchor.parentElement.after(note); }
    note.textContent = url ? '附件由项目的 GitHub Releases 单独提供；不会在打开三维网页时自动下载。' : '此预览尚未配置发布仓库。三维模型可直接观察；GLB 和零件表下载需等待维护者发布 GitHub Release。';
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-public-document]');
    if (!trigger) return;
    event.preventDefault(); openDocument(trigger.dataset.publicDocument, trigger.dataset.publicPage || 1);
  });
  $('source-dialog').addEventListener('close', () => { activeDocument = null; });
  $('source-dialog').addEventListener('keydown', event => {
    if (!activeDocument || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,select,textarea')) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const { kind, page } = activeDocument, next = page + (event.key === 'ArrowRight' ? 1 : -1);
    if (next >= 1 && next <= sources[kind].pages) { event.preventDefault(); openDocument(kind, next); }
  });
  global.addEventListener('beforeunload', () => { for (const local of localFiles.values()) URL.revokeObjectURL(local.url); });
  global.PublicResources = Object.freeze({ sources, openDocument, openPhoto, releaseAssetUrl, bindDownload });
})(window);
