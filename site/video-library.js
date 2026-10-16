/* Curated original YouTube sources. No third-party media is copied or loaded until requested. */
window.A12_VIDEOS = [
 {id:'VlvNmShs9Ok',title:'空后背清洁入门',original:'Hasselblad 500C/M — Quick check and clean of the analog medium format film camera',author:'Wolfgang Ullrich Photography',level:'入门 · A12N 章节',pages:[23,24],lesson:'empty-back',
  summary:'从片芯和胶片接触面认件开始。作者标注了 A12N 后背清洁章节。',evidence:'作者公开章节；未逐帧核对',caution:'视频是 A12N 版本，不能据此确认与你手上的后背完全一致；不要把镜头清洁章节套用于后背。',
  clips:[{start:32,end:86,title:'A12N 后背清洁',basis:'作者章节 0:32；下一章从 1:26 开始。'}]},
 {id:'HjjxmYltCa8',title:'A12 插刀口遮光件',original:'Change the light trap in HASSELBLAD A12 magasin',author:'mikeno62',level:'基础维修 · A12',pages:[5,7,12,13],lesson:'light-trap',
  summary:'观察外板与插刀口遮光组件。已抽样查看外板及工作台画面。',evidence:'原页及抽样画面核对',caution:'没有可用字幕，未核对整片。仅凭画面不能确定密封材料、厚度和实物生产版本。',
  clips:[{start:100,title:'外板周边操作画面',basis:'1:40 播放器画面核对；这是观察入口，不是动作起点。'}]},
 {id:'f6Dq9aURcqw',title:'遮光件定位与外板装回',original:'Fix Old Cameras: Hasselblad Film Magazine Seal',author:'Fix Old Cameras',level:'基础维修 · 型号需对照',pages:[5,7,12,14],lesson:'light-trap',
  summary:'重点看外板九枚螺钉、旧密封检查，以及原厂遮光件定位。',evidence:'英文自动字幕核对；非逐帧复核',caution:'片中也有自制密封件。其材料、尺寸和“只有一处会漏光”的概括不作为本教程结论；保留垫片与锁簧原位，修后仍需试卷。',
  clips:[{start:54,end:79,title:'外板九枚螺钉',basis:'自动字幕 0:54–1:19。'},{start:92,end:120,title:'检查旧密封状态',basis:'自动字幕 1:32–2:00。'},{start:229,end:252,title:'原厂遮光件定位',basis:'自动字幕 3:49–4:12；自制件讲解从随后开始。'},{start:360,end:395,title:'外板装回与功能检查',basis:'自动字幕 6:00–6:35。'}]},
 {id:'U2dYp0k8QKw',title:'抽出插刀仍不能释放',original:'Fix Old Cameras: Hasselblad Film Back Jams Camera',author:'Fix Old Cameras',level:'故障认知 · 插刀联锁',pages:[7,12,14],lesson:'light-trap',
  summary:'展示插刀联锁卡滞案例，并在装回后检查联锁随插刀进出动作。',evidence:'英文自动字幕核对；非逐帧复核',caution:'案例提及腐蚀及修整。不要把锉磨当成常规保养；先判断实物原因，并保留垫片与弹簧位置。',
  clips:[{start:16,end:34,title:'辨认故障表现',basis:'自动字幕 0:16–0:34。'},{start:113,end:140,title:'装回后检查插刀联锁',basis:'自动字幕 1:53–2:20。'}]},
 {id:'Mg-fQ7LiFTc',title:'A12 漏光密封案例',original:'Hasselblad A12 Light Leak Fix',author:'Hansom’s Repairs',level:'案例 · A12',pages:[5,7,11],lesson:'light-trap',
  summary:'作者介绍老化密封材料导致漏光的维修案例，可作不同实物状态的对照。',evidence:'仅核对原页标题与作者简介',caution:'尚未核对操作画面和章节。案例修复结果不代表你的后背一定是相同故障。',clips:[]},
 {id:'aJPaDQ3olGA',title:'首张不停片与修后复查',original:'En : Fix: 1st frame non-stop issue, repair guide for Hasselblad A12, A16, and A24 film backs',author:'Hasselblad Expert',level:'进阶案例 · 多型号',pages:[8,9,11],lesson:'lubrication',
  summary:'先了解首张不停片的现象，再观察修后重复检查自动停片的环节。',evidence:'原页及英文自动字幕核对',caution:'作者案例中的喷剂或临时润滑做法不纳入常规养护。A16 专用偏心调整不套用到 A12；油脂按手册第 8–9 页区分。',
  clips:[{start:12,end:27,title:'首张不停的故障主题',basis:'自动字幕 0:12–0:27。'},{start:233,end:264,title:'重复检查自动停片',basis:'自动字幕 3:53–4:24；未独立核实其校准正确性。'}]}
];
window.initA12VideoLibrary=function(ctx){
 'use strict';
 const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const time=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
 const url=(id,start=0)=>'https://www.youtube.com/watch?v='+id+(start?'&t='+start+'s':'');
 $('#video-list').innerHTML=window.A12_VIDEOS.map(v=>`<article class="video-card"><div class="video-level">${esc(v.level)}</div><h4>${esc(v.title)}</h4><p class="video-by">${esc(v.author)}</p><p>${esc(v.summary)}</p><details><summary>观看提示与核实范围</summary><p>${esc(v.caution)}</p><small>${esc(v.evidence)}</small><p class="video-original-title">${esc(v.original)}</p></details><div class="video-clips">${v.clips.map((c,i)=>`<button data-video="${v.id}" data-clip="${i}"><span>▶ ${time(c.start)}</span>${esc(c.title)}</button>`).join('')}</div><div class="video-actions"><button data-video="${v.id}">原片播放器</button><a href="${url(v.id)}" target="_blank" rel="noopener">YouTube ↗</a><button data-lesson="${v.lesson}">配套动画</button></div><div class="source-links">${v.pages.map(n=>`<button data-page="${n}">PDF ${n}</button>`).join('')}</div></article>`).join('');
 function open(id,clip){
  const v=window.A12_VIDEOS.find(v=>v.id===id);if(!v)return;ctx.pause?.();
  const c=Number.isInteger(clip)?v.clips[clip]:null, start=c?.start||0;
  $('#video-title').textContent=v.title+(c?' · '+c.title:'');$('#video-author').textContent=v.author+' · '+v.evidence;
  $('#video-original').href=url(id,start);$('#video-segment-note').textContent=c?c.basis+' 这是原视频的限时播放入口，没有下载或剪辑副本。':'打开的是作者原视频。'+v.evidence+'。';$('#video-caution').textContent=v.caution;
  const frame=document.createElement('iframe');frame.title=v.original;frame.allow='encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
  frame.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=0&playsinline=1&rel=0&start='+start+(c?.end?'&end='+c.end:'');$('#video-player').replaceChildren(frame);$('#video-dialog').showModal();
 }
 function close(){ $('#video-dialog').close(); }
 $('#close-video').onclick=close;$('#video-dialog').addEventListener('close',()=>$('#video-player').replaceChildren());$('#video-dialog').addEventListener('click',e=>{if(e.target===$('#video-dialog'))close();});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-video]');if(b)open(b.dataset.video,b.dataset.clip===undefined?null:Number(b.dataset.clip));if(e.target.closest('#video-list a, #video-original'))ctx.pause?.();});
 return {open,close};
};
