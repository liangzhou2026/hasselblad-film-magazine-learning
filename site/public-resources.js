/* Public distribution: references stay at their source; optional PDFs stay in this browser. */
(function (global) {
  'use strict';
  const sources = Object.freeze({
    manual: { title: 'Film Magazines 维修手册', pages: 66, url: 'https://www.galerie-photo.com/manuels/hasselblad-magasins.pdf', source: 'Galerie-photo 保存的原厂维修手册' },
    user: { title: 'A-type Film Magazines 使用说明书', pages: 23, url: 'https://butkus.org/chinon/hasselblad/hasselblad_a-type_magazines/hasselblad_a-type_magazines.htm', source: 'Butkus 使用说明书来源页' },
    bulletins: { title: 'Service Infos 改型通告', pages: 193, url: '', source: '开发时使用的 S7 合集；目前未配置可核实的公开来源链接' }
  });
  const localFiles = new Map();
  const $ = id => document.getElementById(id);
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
    $('source-title').textContent = title; $('source-caption').textContent = caption;
    $('source-image').hidden = true; $('source-image').removeAttribute('src');
    const oldError = $('source-error'); if (oldError) oldError.hidden = true;
    $('source-pdf-link').hidden = true; $('source-pdf-link').removeAttribute('href');
    let content = $('public-source-content');
    if (!content) { content = document.createElement('div'); content.id = 'public-source-content'; content.className = 'public-source-content'; document.querySelector('.source-image-wrap').append(content); }
    content.replaceChildren();
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
    content.append(paragraph('本公开版保留资料索引，不分发原厂手册扫描件或页面图片。三维形状和动画位移仍是教学重建，请结合对应版本的原文与实物理解。'));
    content.append(paragraph('文献来源：' + source.source, 'source-note'));
    if (source.url) {
      const link = $('source-pdf-link'); link.href = source.url + (kind === 'manual' ? '#page=' + page : '');
      link.textContent = kind === 'manual' ? '打开来源站 PDF 此页 ↗' : '打开说明书来源页 ↗'; link.hidden = false;
      content.append(paragraph('来源站需要联网；若浏览器未跳到指定页，请手动输入页码。'));
    } else {
      content.append(paragraph('此项页码指开发时使用的 193 页 S7 合集。可选择你自行取得的同版 PDF；此处不提供未经核实的下载地址。'));
    }
    const section = document.createElement('section'); section.className = 'local-pdf-option';
    const label = document.createElement('label'); label.htmlFor = 'public-local-pdf'; label.textContent = '已有这份资料？选择本地 PDF';
    const input = document.createElement('input'); input.id = 'public-local-pdf'; input.type = 'file'; input.accept = '.pdf,application/pdf';
    const status = paragraph('文件仅在当前浏览器会话中使用，不上传，也不加入公开包。刷新后需重新选择。', 'source-note');
    section.append(label, input, status);
    const local = localFiles.get(kind);
    if (local) {
      const link = document.createElement('a'); link.href = local.url + '#page=' + page; link.target = '_blank'; link.rel = 'noopener';
      link.textContent = '打开已选择的 PDF · 第 ' + page + ' 页 ↗';
      section.append(paragraph(local.name, 'local-pdf-name'), link);
    }
    input.addEventListener('change', () => {
      const file = input.files && input.files[0]; if (!file) return;
      if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') { status.textContent = '请选择 PDF 文件。'; return; }
      const previous = localFiles.get(kind); if (previous) URL.revokeObjectURL(previous.url);
      localFiles.set(kind, { name: file.name, url: URL.createObjectURL(file) });
      openDocument(kind, page);
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
  global.PublicResources = Object.freeze({ sources, openDocument, openPhoto, releaseAssetUrl, bindDownload });
})(window);
