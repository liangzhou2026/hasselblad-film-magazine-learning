/* Viewer and source-backed service sequence controller. Public document references use source links. */
window.initA12Viewer = function(ctx) {
 'use strict';
 const {T,scene,camera,renderer,host,groups,pickables,data,detailParts}=ctx;
 const profile=ctx.profile||{id:'A12',scope:'后期机械 A12',serial:'对照手册核对实物版本。',boundary:'教学示意',insertPage:23};
 const modelName=profile.id||'A12';
 function activeAnimation(){return state.workflow==='assembly'?window.A12_ASSEMBLY:window.A12_DISASSEMBLY;}
 const $=s=>document.querySelector(s), allParts=[...data.parts,...detailParts];
 const catalog=new Map(allParts.map(p=>[p.id,p])), roots=data.parts.map(p=>p.id), sequences=window.A12_SEQUENCES;
 const state={selected:'p_21548',explode:0,labels:true,lube:false,mode:'structure',theta:-1.05,phi:1.18,distance:225,tab:'part',isolated:null,fitIds:null,workflow:null,step:0,phase:'before',lesson:null,sequenceProgress:0,sequencePlaying:false,sequenceCamera:null};
 const labelObjects=[],hotspots=[],expanded=new Set(['center']),target=new T.Vector3(),raycaster=new T.Raycaster(),ndc=new T.Vector2();
 let width=1,height=1,focusSet=new Set(),lastHover=null,lessonPlayer=null,lastLessonChapter='';
 let stepFrame=0,stepLastTime=0;
 $('#magazine-model').value=modelName;
 host.setAttribute('aria-label','可拖动旋转和滚轮缩放的 '+modelName+' 三维结构模型；也可使用零件列表和固定视角按钮。');
 $('#magazine-scope').textContent=profile.scope;$('#magazine-version').textContent=profile.serial+' '+profile.boundary;
 $('#magazine-scope').title=profile.scope;
 $('#source-version').textContent=profile.scope+' '+profile.serial+' '+profile.boundary;
 $('#sequence-scope').textContent=profile.scope+'；片芯保持总成。拆卸与安装独立编排，零件位移用于认件，预紧和校准需对照原图。';
 $('#insert-source').dataset.page=profile.insertPage||23;$('#insert-source span').textContent='PDF 第 '+(profile.insertPage||23)+' 页 →';
 if(modelName!=='A12'){document.querySelectorAll('[data-tab="learn"]').forEach(b=>b.hidden=true);document.querySelector('[data-tab="care"]').hidden=true;document.querySelector('[data-mode="lubrication"]').hidden=true;}
 $('#magazine-model').onchange=e=>{pauseStep();const url=new URL(location.href);url.pathname=url.pathname.replace(/[^/]*$/,'index.html');url.searchParams.set('model',e.target.value);url.searchParams.set('mode',['A12','A16','A24'].includes(e.target.value)?state.workflow||'disassembly':'exploded');location.assign(url.href);};
 function syncModelLinks(){document.querySelectorAll('[data-model-link]').forEach(a=>{a.href='?model='+a.dataset.modelLink+'&mode='+(state.workflow||'disassembly');a.setAttribute('aria-current',a.dataset.modelLink===modelName?'page':'false');});}
 function pauseStep(){if(stepFrame)cancelAnimationFrame(stepFrame);stepFrame=0;stepLastTime=0;state.sequencePlaying=false;syncPlayback();if(state.workflow)updateChecks();}
 function syncPlayback(){
  $('#workflow-play').textContent=state.sequencePlaying?'暂停':state.sequenceProgress>=100?'重播本步':'播放本步';
  $('#workflow-play').setAttribute('aria-pressed',String(state.sequencePlaying));
  $('#workflow-progress').value=state.sequenceProgress;$('#workflow-value').value=Math.round(state.sequenceProgress)+'%';
  $('#workflow-progress').setAttribute('aria-valuetext',Math.round(state.sequenceProgress)+'%');
 }
 function seekStep(value){pauseStep();state.sequenceProgress=T.MathUtils.clamp(Number(value)||0,0,100);state.phase=state.sequenceProgress>=100?'after':'before';renderStep(); }
 function playStep(){
  if(!state.workflow||!activeAnimation())return;
  pauseStep();if(state.sequenceProgress>=100){state.sequenceProgress=0;state.phase='before';}
  state.sequencePlaying=true;syncPlayback();
  function tick(now){
   if(!state.sequencePlaying||!state.workflow)return;
   const delta=stepLastTime?Math.min(120,now-stepLastTime):0;stepLastTime=now;
   state.sequenceProgress=Math.min(100,state.sequenceProgress+delta/100*Number($('#workflow-speed').value));
   state.phase=state.sequenceProgress>=100?'after':'before';renderStep(true);
   if(state.sequenceProgress>=100){
    const continueNext=$('#workflow-auto').checked&&state.step<sequences[state.workflow].length-1;
    pauseStep();renderStep();if(continueNext){changeStep(state.step+1,!!state.sequenceCamera);playStep();}return;
   }
   stepFrame=requestAnimationFrame(tick);
  }
  stepFrame=requestAnimationFrame(tick);
 }
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function parentId(id){return catalog.get(id)?.parent||null;}
 function rootId(id){while(parentId(id))id=parentId(id);return id;}
 function inBranch(id,ancestor){while(id){if(id===ancestor)return true;id=parentId(id);}return false;}
 function owner(mesh){let o=mesh;while(o&&!o.userData.partId)o=o.parent;return o?.userData.partId;}
 function visible(o){while(o){if(!o.visible)return false;o=o.parent;}return true;}
 function isPartShown(id){if(!groups[id])return false;let result=false;groups[id].traverse(o=>{if(o.isMesh&&!o.userData.hotspot&&visible(o))result=true;});return result;}
 function reveal(id){let g=groups[id];while(g&&g!==scene){g.visible=true;g=g.parent;}}
 function clearIsolation(){state.isolated=null;for(const m of pickables)if(!m.userData.hotspot)m.visible=true;}
 function maskIsolation(id){clearIsolation();state.isolated=id;for(const g of Object.values(groups))g.visible=true;for(const m of pickables)if(!m.userData.hotspot)m.visible=inBranch(owner(m),id);}
 function pageButtons(pages){return [...new Set(pages)].map(n=>`<button data-page="${n}">PDF 第 ${n} 页</button>`).join('');}
 function bulletinLinks(pages=[]){return pages.filter(n=>Number.isInteger(Number(n))&&Number(n)>0).map(n=>`<a href="#source-dialog" data-public-document="bulletins" data-public-page="${Number(n)}">S7 通告索引 · 第 ${Number(n)} 页</a>`).join('');}
 function stepData(){return sequences[state.workflow||'disassembly'][state.step];}
 function cameraBounds(ids){const bounds=new T.Box3(),individual=[];scene.updateMatrixWorld(true);for(const m of pickables){if(m.userData.hotspot||!visible(m)||ids&&!ids.some(id=>inBranch(owner(m),id)))continue;const b=new T.Box3().setFromObject(m);if(!b.isEmpty()){bounds.union(b);individual.push(b);}}return {bounds,individual};}
 // Once the user moves the camera, keep its orbit centre and framing independent
 // of moving/hidden parts. Zoom and rotation still update the usual camera state.
 function holdSequenceCamera(){if(!state.workflow||state.sequenceCamera)return;state.sequenceCamera={target:target.clone(),scale:camera.position.distanceTo(target)/state.distance};}
 function updateCamera(){
  const direction=new T.Vector3(Math.sin(state.phi)*Math.sin(state.theta),Math.cos(state.phi),Math.sin(state.phi)*Math.cos(state.theta));
  let d=state.distance*(width<470?1.13:1);target.set(0,-1,0);
  if(state.workflow&&state.sequenceCamera){target.copy(state.sequenceCamera.target);d=state.distance*state.sequenceCamera.scale;}
  else if(state.explode>0||state.fitIds){
   const {bounds,individual}=cameraBounds(state.fitIds);
   if(!bounds.isEmpty()){
    bounds.getCenter(target);const right=new T.Vector3(Math.cos(state.theta),0,-Math.sin(state.theta)),up=new T.Vector3().crossVectors(direction,right),tan=Math.tan(camera.fov*Math.PI/360);let fit=0;
    for(const b of individual)for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new T.Vector3(x,y,z).sub(target),depth=p.dot(direction);fit=Math.max(fit,Math.abs(p.dot(right))/(tan*camera.aspect)+depth,Math.abs(p.dot(up))/tan+depth);}
    d=Math.max(2,fit*1.28*(state.distance/225));
   }
  }
  camera.near=Math.min(.1,d/150);camera.updateProjectionMatrix();camera.position.copy(target).addScaledVector(direction,d);camera.lookAt(target);camera.updateMatrixWorld();
 }
 const labelLayer=$('#labels-layer');
 function addLabel(id,text,kind){const g=groups[id];if(!g)return;const el=document.createElement('button');el.className='model-label'+(kind==='lube'?' lube':'');el.textContent=text;el.onclick=()=>selectPart(id);el.hidden=true;labelLayer.append(el);labelObjects.push({id,g,el,kind});}
 for(const p of allParts)addLabel(p.id,p.parent?`${p.name} · ${p.number}`:p.name,p.parent?'detail':'assembly');
 for(const [id,text] of [['p_21548','油 · 中心机构'],['p_14184','脂 · 发条 14184'],['p_308109','油 / 脂 · 图 7'],['p_12819','脂 · 轴 12819'],['p_20843','脂 · 锁定臂上侧']]){
  const g=groups[id];if(!g)continue;addLabel(id,text,'lube');const marker=new T.Mesh(new T.SphereGeometry(1.3,14,10),new T.MeshBasicMaterial({color:0xba7b27,depthTest:false}));marker.position.copy(g.userData.anchor);marker.userData={partId:id,hotspot:true};marker.renderOrder=30;marker.visible=false;g.add(marker);hotspots.push(marker);pickables.push(marker);
 }
 const selectedLabel=document.createElement('button');selectedLabel.className='model-label selected';selectedLabel.onclick=()=>setTab('part',!!state.workflow&&state.sequencePlaying);labelLayer.append(selectedLabel);
 function positionLabels(){
  const placed=[];let detailLabels=0;
  function place(el,id,force=false,shift=false){const g=groups[id],v=g.localToWorld(g.userData.anchor.clone()).project(camera);let x=(v.x*.5+.5)*width,y=(-v.y*.5+.5)*height;
   let show=v.z>-1&&v.z<1&&x>55&&x<width-55&&y>67&&y<height-38;
   if(shift&&show){const original=y;x=T.MathUtils.clamp(x,95,width-100);for(const offset of [0,34,-34,68,-68,102,-102]){const yy=original+offset;if(yy>76&&yy<height-38&&!placed.some(p=>Math.abs(p[0]-x)<150&&Math.abs(p[1]-yy)<31)){y=yy;break;}}}
   else if(!force&&placed.some(p=>Math.abs(p[0]-x)<145&&Math.abs(p[1]-y)<30))show=false;
   el.hidden=!show;if(show){el.style.left=x+'px';el.style.top=(y-12)+'px';placed.push([x,y]);}return show;
  }
  const exterior=['shell','cover','crank','frontplate','darkslide','insert'];selectedLabel.hidden=true;
  if(state.labels&&!state.lube&&!state.workflow&&!state.lesson&&isPartShown(state.selected)&&(state.mode!=='assembled'||exterior.includes(rootId(state.selected)))){const p=catalog.get(state.selected);selectedLabel.textContent=p.name+' · '+p.number;place(selectedLabel,state.selected,true);}
  for(const item of labelObjects){const {id,el,kind}=item;el.hidden=true;if(!isPartShown(id))continue;let enabled=false;
   if(kind==='lube')enabled=state.lube;
   else if(state.labels&&!state.lube&&(id!==state.selected||state.lesson||state.workflow)){
    if(state.workflow||state.lesson)enabled=focusSet.has(id);
    else if(kind==='detail')enabled=detailLabels<7&&rootId(id)===rootId(state.selected)&&(state.isolated||state.explode>.1);
    else enabled=['frontplate','spacing','drive','insert','pressure'].includes(id)&&!state.isolated;
    if(state.mode==='assembled'&&!exterior.includes(rootId(id)))enabled=false;
   }
   if(enabled&&place(el,id,false,kind==='lube')){if(kind==='detail')detailLabels++;}
  }
 }
 function render(){updateCamera();scene.updateMatrixWorld(true);renderer.render(scene,camera);positionLabels();}
 function resize(){width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;render();}
 function updateAppearance(shouldRender=true){
  for(const m of pickables){if(m.userData.hotspot||!m.material?.emissive)continue;const id=owner(m);if(!m.userData.originalMat)m.userData.originalMat=m.material;const original=m.userData.originalMat;
   const action=(state.workflow||state.lesson)&&[...focusSet].some(key=>inBranch(id,key)),selected=!state.workflow&&!state.lesson&&inBranch(id,state.selected);
   if(action||selected){const cache=action?'actionMat':'selectedMat';if(!m.userData[cache]){m.userData[cache]=original.clone();m.userData[cache].emissive.set(action?0xba7924:0x23755b);m.userData[cache].emissiveIntensity=action?.35:.08;}m.material=m.userData[cache];}else m.material=original;
  }
  for(const m of hotspots)m.visible=state.lube;if(shouldRender)render();
 }
 function mobileScroll(selector){if(window.matchMedia('(max-width:850px)').matches)$(selector).scrollIntoView({block:'start',behavior:'auto'});}
 function setTab(tab,keepPlayback=false){if(state.lesson&&tab!=='learn')lessonPlayer?.pause();if(tab!=='steps'&&!keepPlayback)pauseStep();state.tab=tab;document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));for(const id of ['learn','part','steps','care','sources'])$('#'+id+'-panel').hidden=id!==tab;if(tab==='learn')mobileScroll('.info-panel');}
 function selectPart(id,switchTab=true){if(!catalog.has(id))return;if(state.lesson){stopLesson();applyMode('structure');}state.selected=id;const p=catalog.get(id),isDetail=!!p.parent;expanded.add(rootId(id));syncExpanded();
  $('#selection-caption').textContent=p.name+' · '+p.number;
  const children=detailParts.filter(q=>q.parent===id);
  $('#part-panel').innerHTML=`<div class="eyebrow">PART · REFERENCE</div><h2>${esc(p.name)}</h2><p class="part-english">${esc(p.en)}</p><div class="part-number">${esc(p.number)}</div>${isDetail?`<button class="parent-link" data-select="${p.parent}">所属总成：${esc(catalog.get(p.parent).name)} ↑</button>`:''}<p>${esc(p.description)}</p>${children.length?`<h3>${children.length} 项可辨认子件</h3><div class="part-children">${children.map(q=>`<button data-select="${q.id}">${esc(q.name)} <small>${esc(q.number)}</small></button>`).join('')}</div>`:''}<div class="selection-actions"><button id="detail-isolate">独立放大</button><button id="detail-show">${isPartShown(id)?'隐藏零件':'显示零件'}</button>${children.length?'<button id="detail-explode">展开此总成</button>':''}</div><h3>养护与检查</h3><p>${esc(p.care)}</p><div class="lube-note"><strong>润滑资料</strong><p>${esc(p.lube)}</p></div><h3>手册依据</h3><div class="source-links">${pageButtons(p.pages)}</div><div class="info-note">${esc(p.evidence)}</div>`;
  $('#detail-isolate').onclick=()=>isolate(id);$('#detail-show').onclick=()=>{setVisible(id,!isPartShown(id));selectPart(id);};if($('#detail-explode'))$('#detail-explode').onclick=()=>{isolate(id);explode(75);};
  document.querySelectorAll('.part-row').forEach(row=>{const sel=row.dataset.id===id;row.classList.toggle('selected',sel);row.querySelector('[data-select]')?.setAttribute('aria-pressed',String(sel));});if(switchTab)setTab('part',!!state.workflow&&state.sequencePlaying);updateAppearance();
 }
 function updateChecks(){
  for(const p of allParts){const inp=document.querySelector(`input[data-part="${p.id}"]`);if(!inp)continue;inp.checked=isPartShown(p.id);const children=detailParts.filter(q=>q.parent===p.id);inp.indeterminate=children.length>0&&children.some(q=>isPartShown(q.id))&&children.some(q=>!isPartShown(q.id));}
  $('#visible-count').textContent=detailParts.filter(p=>isPartShown(p.id)).length+' / '+detailParts.length+' 子件';const b=$('#detail-show');if(b)b.textContent=isPartShown(state.selected)?'隐藏零件':'显示零件';
 }
 function endWorkflow(){pauseStep();stopLesson();if(state.workflow)for(const g of Object.values(groups))g.position.set(0,0,0);state.workflow=null;focusSet.clear();$('#workflow-controls').hidden=true;$('#free-controls').hidden=false;$('#step-state').textContent='已返回自由观察；重新选择拆卸或安装可继续步骤学习。';document.querySelectorAll('[data-sequence]').forEach(b=>b.setAttribute('aria-pressed','false'));if(state.tab==='steps')setTab('part');const p=catalog.get(state.selected);if(p)$('#selection-caption').textContent=p.name+' · '+p.number;}
 function clearModes(){state.mode='custom';document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed','false'));$('#mode-caption').textContent=modelName+' · 自定义观察';}
 function setVisible(id,v){endWorkflow();clearIsolation();if(v)reveal(id);else groups[id].visible=false;state.fitIds=null;clearModes();updateChecks();updateAppearance();}
 function explode(value){state.explode=value/100;$('#explode').value=value;$('#explode-value').value=Math.round(value)+'%';for(const g of Object.values(groups))g.position.copy(g.userData.spread).multiplyScalar(state.explode);render();}
 function applyMode(mode){endWorkflow();clearIsolation();state.mode=mode;state.fitIds=null;state.sequenceCamera=null;for(const g of Object.values(groups))g.visible=true;state.lube=mode==='lubrication';$('#show-lube').checked=state.lube;
  if(mode==='structure'||mode==='lubrication')for(const id of ['shell','cover','crank','darkslide','bridge'])groups[id].visible=false;
  state.theta=mode==='lubrication'?-Math.PI/2:-1.05;state.phi=mode==='lubrication'?Math.PI/2:1.18;state.distance=mode==='lubrication'?192:225;explode(mode==='exploded'?65:0);
  $('#mode-caption').textContent=modelName+' · '+{structure:'精细内部结构',assembled:'完整外观',exploded:'总成与子件分层',lubrication:'润滑资料索引'}[mode];document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));updateChecks();updateAppearance();
 }
 function fitParts(ids){const shown=ids.filter(id=>groups[id]&&isPartShown(id));if(!shown.length)return;state.sequenceCamera=null;state.fitIds=shown;state.distance=225;const part=catalog.get(shown[0]);state.theta=part?.section==='mechanism'?-1.48:-.65;state.phi=1.42;render();holdSequenceCamera();}
 function isolate(id){endWorkflow();maskIsolation(id);state.lube=false;$('#show-lube').checked=false;explode(0);clearModes();fitParts([id]);$('#mode-caption').textContent='独立认件 · '+catalog.get(id).name;updateChecks();updateAppearance();}
 function sequenceApplyActions(step){for(const id of step.remove){if(groups[id])groups[id].visible=false;}for(const id of step.add)if(groups[id])reveal(id);}
 function beginSequence(type,index=0){pauseStep();stopLesson();if(!sequences[type]?.length)return;state.workflow=type;state.step=T.MathUtils.clamp(index,0,sequences[type].length-1);state.phase='before';state.sequenceProgress=0;state.sequenceCamera=null;state.fitIds=null;state.distance=260;state.theta=-1.18;state.phi=1.38;$('#part-search').value='';searchParts('');setTab('steps');$('.info-panel').scrollTop=0;syncModelLinks();renderStep();}
 function renderStep(frameOnly=false){
  if(!state.workflow)return;const list=sequences[state.workflow],step=list[state.step];clearIsolation();for(const m of pickables)if(m.userData.teachingFilm)m.visible=false;for(const g of Object.values(groups))g.visible=true;
  // The assembly lesson begins in the actually represented final disassembly state.
  if(state.workflow==='assembly')for(const s of sequences.disassembly)sequenceApplyActions(s);
  for(let i=0;i<state.step;i++)sequenceApplyActions(list[i]);
  for(const g of Object.values(groups))g.position.set(0,0,0);
  const animation=activeAnimation(),animated=!!animation;
  const sample=animated?animation.apply({groups},step.id,state.sequenceProgress):null;
  if(!animated&&state.phase==='after')sequenceApplyActions(step);
  state.lube=false;$('#show-lube').checked=false;focusSet=new Set(sample?sample.focus:step.focus);state.mode='sequence';state.explode=0;$('#explode').value=0;$('#explode-value').value='0%';
  $('#workflow-controls').hidden=!animated;$('#free-controls').hidden=!!animated;
  if(sample){$('#workflow-phase').textContent=sample.phase;$('#workflow-boundary').textContent=sample.boundary;syncPlayback();}
  $('#mode-caption').textContent=(state.workflow==='assembly'?'安装':'拆卸')+' · '+(state.step+1)+' / '+list.length+' · '+(state.sequenceProgress<=0?'步骤起点':state.sequenceProgress>=100?'步骤终点':'演示中');
  if(frameOnly){updateAppearance();return;}
  if(animated){
   $('#workflow-count').textContent=modelName+' / '+(state.workflow==='assembly'?'安装':'拆卸')+' / '+String(state.step+1).padStart(2,'0')+' OF '+list.length;
   $('#workflow-step').innerHTML=list.map((s,i)=>'<option value="'+i+'">'+String(i+1).padStart(2,'0')+' · '+esc(s.title)+'</option>').join('');
   $('#workflow-step').value=state.step;$('#workflow-prev').disabled=state.step===0;$('#workflow-next').disabled=state.step===list.length-1;
  }
  $('#sequence-type').value=state.workflow;$('#step-count').textContent=String(state.step+1).padStart(2,'0')+' / '+list.length;$('#step-kind').textContent={action:'操作',check:'检查',adjustment:'调整'}[step.kind];$('#step-title').textContent=step.title;$('#step-body').textContent=step.body;$('#step-note').textContent=step.note;$('#step-sources').innerHTML=pageButtons(step.pages)+bulletinLinks(step.serviceInfoPages);
  const related=[...new Set(step.focus)].filter(id=>catalog.has(id));$('#step-parts').innerHTML='<h3>本步相关零件</h3>'+related.map(id=>`<button class="step-part" data-select="${id}"><span>${esc(catalog.get(id).name)}</span><small>${esc(catalog.get(id).number)}</small></button>`).join('');
  $('#step-prev').disabled=state.step===0;$('#step-next').disabled=state.step===list.length-1;
  document.querySelectorAll('[data-phase]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.phase===state.phase)));
  const focusAvailable=step.focus.some(id=>isPartShown(id));
  $('#focus-step').disabled=!focusAvailable;$('#focus-step').textContent=focusAvailable?'放大本步零件':'本步零件已取下';
  $('#step-state').textContent=(animated?'在模型下方播放或拖动本步进度；橙色标出当前操作零件。':state.phase==='before'?'操作前状态 · 金色高亮本步已在模型中的零件。':'操作后状态 · 按本步取下或装回零件；脱钩、润滑和校准仅用文字及原图说明。')+(!focusAvailable?' 本步零件已取下，可回看本步或打开手册原图。':'');
  $('#step-list').innerHTML=list.map((s,i)=>`<button data-step="${i}" class="${i===state.step?'current':''}"><span>${String(i+1).padStart(2,'0')}</span>${esc(s.title)}</button>`).join('');
  $('#selection-caption').textContent=step.title;
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed','false'));document.querySelectorAll('[data-sequence]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sequence===state.workflow)));
  for(const id of related)expanded.add(rootId(id));syncExpanded();updateChecks();updateAppearance();
 }
 function changeStep(index,keepView=false){pauseStep();if(!state.workflow)return;const list=sequences[state.workflow];state.step=T.MathUtils.clamp(index,0,list.length-1);state.phase='before';state.sequenceProgress=0;if(!keepView){state.sequenceCamera=null;state.fitIds=null;state.distance=260;state.theta=-(state.workflow==='assembly'?(state.step===23?-1.05:state.step<7?.38:1.35):(state.step>=15&&state.step<=19?.38:state.step===20?-1.35:1.35));state.phi=1.4;}$('.info-panel').scrollTop=0;renderStep();}
 function stopLesson(){
  if(!state.lesson)return;state.lesson=null;lessonPlayer?.stop();focusSet.clear();state.fitIds=null;lastLessonChapter='';
  $('#lesson-controls').hidden=true;$('#free-controls').hidden=false;$('#lesson-chapter-panel').hidden=true;$('#focus-part').textContent='放大所选';
  document.querySelectorAll('[data-lesson]').forEach(b=>b.setAttribute('aria-pressed','false'));
 }
 function startLesson(id){
  if(!lessonPlayer)return;applyMode('structure');state.lesson=id;state.mode='lesson';state.fitIds=null;state.distance=225;state.labels=true;$('#show-labels').checked=true;
  $('#part-search').value='';searchParts('');setTab('learn');$('.info-panel').scrollTop=0;$('#lesson-controls').hidden=false;$('#free-controls').hidden=true;$('#lesson-chapter-panel').hidden=false;$('#focus-part').textContent='放大本段';
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed','false'));document.querySelectorAll('[data-lesson]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lesson===id)));
  const lesson=lessonPlayer.lessons.find(l=>l.id===id);if(!lesson){stopLesson();return;}
  $('#lesson-chapters').innerHTML=lesson.chapters.map((c,i)=>`<button data-chapter="${i}" data-time="${c.start}"><span>${String(c.start).padStart(2,'0')} s</span>${esc(c.title)}</button>`).join('');
  lessonPlayer.setSpeed(Number($('#lesson-speed').value));lessonPlayer.start(id);mobileScroll('#viewport');
 }
 function updateLessonUI(s){
  if(!s.lessonId||!state.lesson)return;const time=n=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');
  $('#lesson-time').textContent=time(s.time)+' / '+time(s.duration);$('#lesson-progress').max=s.duration;$('#lesson-progress').value=s.time;$('#lesson-progress').setAttribute('aria-valuetext',s.time.toFixed(1)+' 秒，共 '+s.duration+' 秒');
  $('#lesson-play').textContent=s.playing?'暂停':s.time>=s.duration?'重新播放':'继续播放';$('#lesson-play').setAttribute('aria-pressed',String(s.playing));
  const key=s.lessonId+':'+s.chapter;
  if(key!==lastLessonChapter){lastLessonChapter=key;$('#lesson-current-title').textContent=s.title;$('#lesson-caption').textContent=s.caption;$('#lesson-pages').innerHTML=pageButtons(s.pages);$('#mode-caption').textContent='新手认件动画 · '+(s.chapter+1)+' / 4';$('#selection-caption').textContent=s.title;
   document.querySelectorAll('[data-chapter]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.chapter)===s.chapter)));updateChecks();
  }
 }
 function syncExpanded(){document.querySelectorAll('[data-children]').forEach(el=>el.hidden=!expanded.has(el.dataset.children));document.querySelectorAll('[data-expand]').forEach(b=>{const open=expanded.has(b.dataset.expand);b.textContent=open?'−':'＋';b.setAttribute('aria-expanded',String(open));});}
 function renderCatalog(){
  const sectionNames={body:'01 / 外壳与接合',film:'02 / 片芯与胶片',mechanism:'03 / 过片与计数'};
  function row(p,child=false){const kids=detailParts.filter(q=>q.parent===p.id);return `<div class="part-row ${child?'child-row':''}" data-id="${p.id}">${!child&&kids.length?`<button class="expand-part" data-expand="${p.id}" aria-label="展开${esc(p.name)}的子件" aria-expanded="false">＋</button>`:'<span class="tree-spacer"></span>'}<input type="checkbox" data-part="${p.id}" aria-label="显示${esc(p.name)}"><button data-select="${p.id}">${esc(p.name)}<small>${esc(p.number)}</small></button></div>`;}
  $('#parts-list').innerHTML=Object.entries(sectionNames).map(([section,name])=>`<div class="part-section">${name}</div>`+data.parts.filter(p=>p.section===section).map(p=>`<div class="assembly-block" data-assembly="${p.id}">${row(p)}<div class="detail-rows" data-children="${p.id}" hidden>${detailParts.filter(q=>rootId(q.id)===p.id).map(q=>row(q,true)).join('')}</div></div>`).join('')).join('');syncExpanded();
 }
 function searchablePart(p){return (p.name+' '+p.number+' '+p.en+' '+(window.A12_I18N?.english(p.name)||'')).toLowerCase();}
 function searchParts(text){const q=text.trim().toLowerCase();document.querySelectorAll('.assembly-block').forEach(block=>{const pid=block.dataset.assembly,p=catalog.get(pid),parentMatch=searchablePart(p).includes(q);let hits=0;block.querySelectorAll('.child-row').forEach(row=>{const c=catalog.get(row.dataset.id),matches=!q||parentMatch||searchablePart(c).includes(q);row.hidden=!matches;if(matches)hits++;});block.hidden=!!q&&!parentMatch&&!hits;const childList=block.querySelector('[data-children]');if(childList)childList.hidden=q?!hits:!expanded.has(pid);});}
 function openSource(page){pauseStep();if(state.lesson)lessonPlayer?.pause();window.PublicResources.openDocument('manual',page);}
 const photos=[{n:43,label:'A12 · 计数机构'},{n:45,label:'A12 · 拆解参考'},{n:44,label:'局部参考 · 杆件'},{n:41,label:'16 张型 · 不混用'},{n:42,label:'16 张型 · 对照'},{n:40,label:'型号未定 · 不混用'}];
 function openPhoto(n){pauseStep();if(state.lesson)lessonPlayer?.pause();const p=photos.find(p=>p.n===n);if(p)window.PublicResources.openPhoto(p);}
 $('#photo-grid').innerHTML=photos.map(p=>`<button class="photo-card public-photo-reference" data-photo="${p.n}"><span>${p.n} · ${p.label}</span><small>个人参考记录 · 无照片副本</small></button>`).join('');
 $('#care-list').innerHTML=data.guide.map((g,i)=>`<article class="care-step"><h3>${i+1} · ${esc(g.title)}</h3><p>${esc(g.body)}</p><div class="source-links">${pageButtons(g.pages)}</div></article>`).join('');
 renderCatalog();
 if(window.createA12BeginnerAnimation){
  lessonPlayer=window.createA12BeginnerAnimation({T,scene,camera,renderer,groups,pickables,catalog,render,
   activate:spec=>{state.fitIds=spec.fitIds;state.theta=spec.view.theta;state.phi=spec.view.phi;state.distance=225;},
   highlight:ids=>{focusSet=new Set(ids);updateAppearance(false);},onUpdate:updateLessonUI});
  $('#lesson-list').innerHTML=lessonPlayer.lessons.map(l=>`<button data-lesson="${l.id}" class="lesson-card" aria-pressed="false"><strong>▶ ${esc(l.title)}</strong><span>${esc(l.description)}</span><small>本地三维动画 · ${l.duration} 秒 · 可慢放</small></button>`).join('');
  $('#lesson-play').onclick=()=>{lessonPlayer.getState().playing?lessonPlayer.pause():lessonPlayer.play();};$('#lesson-replay').onclick=()=>{lessonPlayer.seek(0);lessonPlayer.play();};$('#lesson-progress').oninput=e=>{const seconds=Number(e.target.value);lessonPlayer.pause();lessonPlayer.seek(seconds);};$('#lesson-speed').onchange=e=>lessonPlayer.setSpeed(Number(e.target.value));$('#lesson-stop').onclick=()=>{applyMode('structure');setTab('learn');updateChecks();};
 }
 if(window.initA12VideoLibrary)window.initA12VideoLibrary({pause:()=>{pauseStep();lessonPlayer?.pause();}});
 document.addEventListener('click',e=>{
  const link=e.target.closest('a');
  if(link&&!link.closest('.responsive-jump-nav')){pauseStep();lessonPlayer?.pause();}
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.page)openSource(d.page);if(d.select)selectPart(d.select);if(d.mode)applyMode(d.mode);if(d.tab){if(d.tab==='steps'&&!state.workflow)beginSequence($('#sequence-type').value);else setTab(d.tab);}if(d.photo)openPhoto(Number(d.photo));
  if(d.expand){expanded.has(d.expand)?expanded.delete(d.expand):expanded.add(d.expand);syncExpanded();}
  if(d.sequence)beginSequence(d.sequence);if(d.step!==undefined&&state.workflow)changeStep(Number(d.step));if(d.phase&&state.workflow){pauseStep();state.phase=d.phase;state.sequenceProgress=d.phase==='after'?100:0;renderStep();}
  if(d.lesson)startLesson(d.lesson);if(d.chapter!==undefined&&state.lesson){lessonPlayer.pause();lessonPlayer.seek(Number(d.time));mobileScroll('#viewport');}
  if(d.view){holdSequenceCamera();if(state.lesson)lessonPlayer?.pause();state.theta=d.view==='side'?-Math.PI/2:d.view==='opposite'?Math.PI/2:d.view==='front'?0:-1.05;state.phi=d.view==='perspective'?1.18:Math.PI/2;render();}
 });
 document.addEventListener('change',e=>{if(e.target.matches('[data-part]'))setVisible(e.target.dataset.part,e.target.checked);});
 $('#part-search').oninput=e=>searchParts(e.target.value);$('#expand-parts').onclick=()=>{roots.forEach(id=>expanded.add(id));syncExpanded();};$('#collapse-parts').onclick=()=>{expanded.clear();syncExpanded();};
 $('#explode').oninput=e=>{endWorkflow();explode(Number(e.target.value));clearModes();updateAppearance();};$('#show-labels').onchange=e=>{state.labels=e.target.checked;render();};$('#show-lube').onchange=e=>{endWorkflow();state.lube=e.target.checked;clearModes();updateAppearance();};
 $('#show-all').onclick=()=>{endWorkflow();clearIsolation();for(const g of Object.values(groups))g.visible=true;state.fitIds=null;clearModes();updateChecks();updateAppearance();};$('#reset-model').onclick=()=>{state.labels=true;$('#show-labels').checked=true;$('#part-search').value='';searchParts('');applyMode('structure');selectPart('p_21548');};
 $('#isolate').onclick=()=>isolate(state.selected);$('#focus-part').onclick=()=>{if(state.lesson||state.workflow){lessonPlayer?.pause();fitParts([...focusSet]);}else fitParts([state.selected]);};$('#zoom-in').onclick=()=>{holdSequenceCamera();state.distance=Math.max(48,state.distance*.86);render();};$('#zoom-out').onclick=()=>{holdSequenceCamera();state.distance=Math.min(550,state.distance/.86);render();};
 $('#fit-model').onclick=()=>{state.sequenceCamera=null;state.fitIds=allParts.filter(p=>isPartShown(p.id)).map(p=>p.id);state.distance=225;render();holdSequenceCamera();};
 $('#open-manual').onclick=()=>openSource(12);$('#close-dialog').onclick=()=>$('#source-dialog').close();$('#source-dialog').onclick=e=>{if(e.target===$('#source-dialog'))$('#source-dialog').close();};
 $('#sequence-type').onchange=e=>beginSequence(e.target.value);$('#step-prev').onclick=()=>changeStep(state.step-1);$('#step-next').onclick=()=>changeStep(state.step+1);$('#focus-step').onclick=()=>fitParts(stepData().focus);$('#step-overview').onclick=()=>{state.sequenceCamera=null;state.fitIds=null;state.distance=225;render();holdSequenceCamera();};$('#exit-sequence').onclick=()=>{applyMode('structure');setTab('part');};
 $('#workflow-play').onclick=()=>state.sequencePlaying?pauseStep():playStep();
 $('#workflow-progress').oninput=e=>seekStep(e.target.value);$('#workflow-step').onchange=e=>changeStep(Number(e.target.value));
 $('#workflow-prev').onclick=()=>changeStep(state.step-1);$('#workflow-next').onclick=()=>changeStep(state.step+1);
 $('#workflow-reset').onclick=()=>beginSequence(state.workflow||'disassembly');$('#workflow-reference').onclick=()=>openSource(stepData().pages[0]);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseStep();});
 window.addEventListener('pagehide',pauseStep);
 const canvas=renderer.domElement,pointers=new Map();let dragging=false,lastX=0,lastY=0,moved=0,pinch=0;
 function hitAt(x,y){const r=canvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);raycaster.setFromCamera(ndc,camera);return raycaster.intersectObjects(pickables,false).find(h=>visible(h.object));}
 canvas.addEventListener('pointerdown',e=>{holdSequenceCamera();if(state.lesson)lessonPlayer?.pause();pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture(e.pointerId);dragging=true;lastX=e.clientX;lastY=e.clientY;moved=0;$('#hover-label').hidden=true;if(pointers.size===2){const[a,b]=[...pointers.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1]);moved=20;}});
 canvas.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId)){const hit=hitAt(e.clientX,e.clientY),id=hit&&owner(hit.object),hover=$('#hover-label');hover.hidden=!id;if(id){const r=canvas.getBoundingClientRect(),p=catalog.get(id);hover.textContent=p.name+' · '+p.number;hover.style.left=T.MathUtils.clamp(e.clientX-r.left+15,10,width-225)+'px';hover.style.top=T.MathUtils.clamp(e.clientY-r.top+16,10,height-50)+'px';}lastHover=id;return;}
  pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const[a,b]=[...pointers.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch&&d)state.distance=T.MathUtils.clamp(state.distance*pinch/d,48,550);pinch=d;moved=20;render();return;}
  if(dragging){const dx=e.clientX-lastX,dy=e.clientY-lastY;state.theta-=dx*.007;state.phi=T.MathUtils.clamp(state.phi-dy*.006,.12,Math.PI-.12);lastX=e.clientX;lastY=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);render();}
 });
 function pointerUp(e){const wasTracked=pointers.has(e.pointerId);pointers.delete(e.pointerId);dragging=pointers.size>0;if(e.type==='pointerup'&&wasTracked&&moved<6){const hit=hitAt(e.clientX,e.clientY);if(hit)selectPart(owner(hit.object));}if(pointers.size===1){[lastX,lastY]=pointers.values().next().value;pinch=0;moved=20;}if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}
 canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('pointerleave',()=>$('#hover-label').hidden=true);canvas.addEventListener('wheel',e=>{e.preventDefault();holdSequenceCamera();state.distance=T.MathUtils.clamp(state.distance*Math.exp(e.deltaY*.001),48,550);render();},{passive:false});
 new ResizeObserver(resize).observe(host);applyMode('structure');selectPart('p_21548');resize();$('#render-state').textContent=roots.length+' 总成 · '+detailParts.length+' 子件';
 const requestedMode=new URLSearchParams(location.search).get('mode');if(['disassembly','assembly'].includes(requestedMode))beginSequence(requestedMode);syncModelLinks();
 window.A12_APP={state,groups,scene,camera,renderer,catalog,detailParts,selectPart,applyMode,explode,openSource,render,beginSequence,changeStep,renderStep,isPartShown,getStats:()=>({assemblies:roots.length,detailParts:detailParts.length,meshes:pickables.length,triangles:renderer.info.render.triangles,version:T.REVISION})};
};
