/* Fine roll-film variants reuse the actual A12/A16/A24 construction modules.
 * Stable p_* keys are animation slots, not a claim that a substituted part has
 * the number embedded in the key. Always display parts[].number.
 */
(function(global){
 'use strict';
 const supported=['A16S','A32','A12TCC','A16TCC','A24TCC','E12','E16','E24','E12CC'];
 const filmRoots=new Set(['insert','pressure','rollers','spools']);
 const boundary='复用已有 A12/A16/A24 精细零件构建器；同编号表示本册列出的共用件，不能由此推断跨版本可直接互换。新增型号差件依据各自爆炸图重建，尺寸、齿形、弹簧弯折和运动仍为教学示意。';
 const clone=o=>JSON.parse(JSON.stringify(o));
 const normal=n=>String(n||'').replace(/\s/g,'').replace(/[（(].*$/,'');
 function context(T,base){
  if(!global.createPrecisionMagazineFactories||!global.buildA12Details||!global.buildA12BodyDetails||!global.buildMagazineFasteners||!global.A12_VARIANTS)throw new Error('Precision magazine builders are not loaded');
  const ctx=global.createPrecisionMagazineFactories(T),F=ctx.factories;
  const data=clone(global.A12_DATA),sequences=clone(global.A12_SEQUENCES);
  const details=[...global.buildA12Details(F).parts,...global.buildA12BodyDetails(F).parts,...global.buildMagazineFasteners(F,sequences)];
  const original=new Map([...data.parts,...details].map(p=>[p.id,{meta:clone(p),meshes:F.groups[p.id]?.children.filter(o=>o.isMesh).map(m=>m.clone())||[]} ]));
  global.A12_VARIANTS.prepare(base,{factories:F,data,detailParts:details,sequences});
  // For the same original spare, preserve the detailed mesh builder output.
  // Variant builders intentionally simplify several otherwise shared items.
  if(base==='A16')for(const p of details){const old=original.get(p.id);if(filmRoots.has(p.parent)&&old?.meshes.length&&normal(old.meta.number)===normal(p.number)&&!['p_14261','p_824033'].includes(p.id)){
    F.resetGroup(p.id);old.meshes.forEach(m=>F.groups[p.id].add(m.clone()));
  }}
  for(const o of [...F.groups.shell.children])if(o.isMesh&&o.position.x===0&&o.position.z===2&&[44,46].includes(o.position.y))F.groups.shell.remove(o);
  return {T,F,data,details,sequences,base,original,scene:ctx.scene,metadata:new Map([...data.parts,...details].map(p=>[p.id,p])),differences:[]};
 }
 function flatten(ctx,model){
  const {T,F,metadata}=ctx,root=new T.Group(),parts=[];root.name=model;ctx.scene?.updateMatrixWorld(true);
  for(const g of Object.values(F.groups))g.updateWorldMatrix(true,true);
  for(const [id,meta] of metadata){const original=F.groups[id];if(!original)continue;const meshes=original.children.filter(o=>o.isMesh);if(!meshes.length)continue;
   let assembly=meta.assembly||id,parent=original;
   while(parent.userData.parentId&&F.groups[parent.userData.parentId]){parent=F.groups[parent.userData.parentId];assembly=parent.userData.partId;}
   if(meta.assembly)assembly=meta.assembly;
   const group=new T.Group();group.name=id;group.userData={partId:id,assembly,estimated:true};
   for(const o of meshes){const c=o.clone();c.geometry=o.geometry.clone();c.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();c.applyMatrix4(original.matrixWorld);c.userData={...o.userData,partId:id,estimated:true};group.add(c);}
   root.add(group);let spread=new T.Vector3();let p=original;
   while(p&&p!==ctx.scene){if(p.userData.spread?.isVector3)spread.add(p.userData.spread);p=p.parent;}
   const description=meta.description||meta.evidence||'原厂图确认部件身份，几何为教学示意。';
   const row={id,name:meta.name,number:meta.number||'',pages:[...new Set(meta.pages||[])],description,group,spread:spread.toArray(),assembly,subassembly:meta.subassembly||'',sharedWith:meta.sharedWith??[ctx.base],difference:meta.difference||'',care:meta.care||'',evidence:meta.evidence||boundary};
   group.userData.number=row.number;group.userData.name=row.name;group.userData.assembly=assembly;parts.push(row);
  }
  global.orientRollfilmRoot(T,root,model);
  root.updateMatrixWorld(true);return {root,parts,boundary,modelId:model,differences:ctx.differences,precision:true,baseModel:ctx.base};
 }
 global.buildPrecisionBaseline=function(T,model){const id=String(model).toUpperCase();if(!['A12','A16','A24'].includes(id))throw new Error('Unsupported precision baseline: '+id);return flatten(context(T,id),id);};

 global.buildPrecisionMagazineModel=function(T,requested){
  const model=String(requested).toUpperCase();if(!supported.includes(model))throw new Error('Unsupported precision magazine: '+model);
  const count=model==='A32'?32:model.includes('24')?24:model.includes('16')?16:12;
  const base=count===16||count===32?'A16':count===24?'A24':'A12',ctx=context(T,base),{F,metadata}=ctx;
  const electronic=model.startsWith('E')||model.endsWith('TCC'),dual=model.endsWith('TCC')||model==='E12CC',old=model==='A16S',a32=model==='A32';
  // These exterior revisions were actually inspected in the linked retailer
  // photographs, rather than inferred from search captions or another model.
  const photoElectronic=['A12TCC','E12','E16','E12CC'].includes(model);
  const photoEvidence='外观核对：reference/online-rollfilm-photo-evidence.md（2026-09-30）。黑色拨盘、浅色刻字与折叠锁柄参考对应实拍；文字角度、尺寸和行程仍为示意。';
  const mechanismPages=a32?[62,63,64]:electronic?[31,32,33]:[12,13,14];
  const filmPages=old?[25,26]:electronic?[40,41,42]:[27,28];
  const shellPages=a32?[65,66]:old?[15,16]:model.endsWith('TCC')?[38,39]:[34,35];
  const {groups,mesh,box,cylinder,gear,lever,rod,spring,screw,extrudeSide,badge,frontFrame,side,sideOutline}=F;
  const prefix=p=>String(p).replace(/A12|A16|A24/g,model);
  function set(id,patch){const m=metadata.get(id);if(!m)throw new Error('Missing precision slot: '+id);Object.assign(m,patch);return m;}
  function clear(id){F.resetGroup(id);return groups[id];}
  function ownClear(id){const g=groups[id];for(const c of [...g.children])if(c.isMesh)g.remove(c);return g;}
  function drop(id){const g=groups[id];if(g){g.parent?.remove(g);delete groups[id];}metadata.delete(id);}
  function add(id,assembly,name,number,pages,anchor,spread,description,subassembly=''){
   if(!groups[assembly]){const g=new T.Group();g.userData={partId:assembly,spread:new T.Vector3(),anchor:new T.Vector3()};groups[assembly]=g;ctx.scene?.add(g);}
   const g=F.detail(id,assembly,anchor,spread);metadata.set(id,{id,parent:assembly,assembly,name,number,pages,description,subassembly,sharedWith:[],difference:'本型号差异件；几何按对应原厂图重建，尺寸未实测。',evidence:boundary});return g;
  }
  function hole(s,x,y,r){const p=new T.Path();p.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(p);}
  function ring(g,x,y,z,r,inner,depth,mat='silver'){const s=new T.Shape();s.absarc(0,0,r,0,Math.PI*2,false);if(inner)hole(s,0,0,inner);return extrudeSide(g,s,depth,[x,y,z],mat);}
  function plate(g,w,h,z,depth=.8,mat='silver',holes=[]){const s=new T.Shape();s.moveTo(-w/2+1,-h/2);s.lineTo(w/2-1,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+1);s.lineTo(w/2,h/2-1);s.quadraticCurveTo(w/2,h/2,w/2-1,h/2);s.lineTo(-w/2+1,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-1);s.lineTo(-w/2,-h/2+1);s.quadraticCurveTo(-w/2,-h/2,-w/2+1,-h/2);for(const p of holes)hole(s,...p);const b=Math.min(.065,depth*.12),geo=new T.ExtrudeGeometry(s,{depth:depth-2*b,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:2,curveSegments:24});geo.translate(0,0,b);return mesh(g,geo,mat,[0,0,z]);}
  function tube(g,points,r=.24,mat='silver'){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(20,points.length*5),r,7,false),mat);}
  function dialLegend(g,y,contrast){
   const outer=contrast?8.5:9.2,inner=6.55,c=document.createElement('canvas');c.width=c.height=512;
   const drawing=c.getContext('2d'),labels=contrast?['−4','−3','−2','−1','0','+1','+2','+3']:['12','25','50','100','200','400','800','1600','3200','6400'];
   drawing.clearRect(0,0,512,512);drawing.fillStyle='#efeee5';drawing.font='500 '+(contrast?'29':'25')+'px Arial';drawing.textAlign='center';drawing.textBaseline='middle';
   labels.forEach((label,i)=>{const a=i/labels.length*Math.PI*2-Math.PI/2;drawing.save();drawing.translate(256+Math.cos(a)*214,256+Math.sin(a)*214);drawing.rotate(a+Math.PI/2);drawing.fillText(label,0,0);drawing.restore();});
   const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
   const ink=new T.MeshStandardMaterial({map:texture,transparent:true,roughness:.82,metalness:.02,depthWrite:false});
   const face=mesh(g,new T.RingGeometry(inner,outer,96),ink,[-46.24,y,-10]);face.rotation.y=-Math.PI/2;
   face.userData.photoDetail='White dial legends; angular positions are illustrative';
  }
  function makeScrew(id,assembly,number,pages,pos,axis='x',spread=[18,0,0],name='固定螺钉',subassembly=''){
   const g=add(id,assembly,name,number,pages,pos,spread,'原件号与数量按零件表；螺纹、孔位与拧紧扭矩未测量。',subassembly);cylinder(g,.65,3,pos,'silver',axis);
   const sign=axis==='x'&&pos[0]<0?-1:1,head=pos.map((n,i)=>n+(i===(axis==='x'?0:2)?sign*1.45:0));
   F.slottedCap(g,1.35,.48,head,'chrome',sign<0?'-x':axis,.35);return g;
  }
  function replaceIdentity(id,name,number,pages,why){set(id,{name,number,pages,sharedWith:[],difference:why,description:name+'。'+why+'；轮廓、厚度与配合为原图认件示意。',care:'按当前型号原图核对，不以模型尺寸判断互换、调校或预紧。'});}
  // Clear stale baseline-only explanatory claims while keeping concrete origins.
  for(const m of metadata.values()){
   const isFilm=filmRoots.has(m.parent)||filmRoots.has(m.id);m.name=prefix(m.name);
   m.description=prefix(m.description||'');m.sharedWith=[base];
   if(isFilm){m.pages=filmPages;m.description='所选 '+model+' 片芯中的'+m.name+'；结构与编号对照 PDF '+filmPages.join('、')+'。';}
   else if(['shell','cover','crank'].includes(m.parent)||['shell','cover','crank'].includes(m.id)||m.id==='p_22356'||m.id==='p_810761')m.pages=shellPages;
   else m.pages=mechanismPages;
   m.care='仅按本型号手册检查与装配。三维不验证实际间距、焦平面、弹簧预紧或电气功能。';m.evidence=boundary;
  }
  // A new shell revision is not the A12 1996 fastener arrangement.
  for(const id of ['p_shell_leather','p_823013_shell_1','p_823013_shell_2','p_823013_shell_3','p_823017_shell_1','p_823017_shell_2'])drop(id);
  for(let i=0;i<3;i++)makeScrew('v_shell_screw_'+(i+1),'shell','823013',shellPages,[-36.8,[-35,0,35][i],17.3],'x',[-9-i*4,0,2],'外壳固定螺钉 '+(i+1));
  for(let i=0;i<2;i++)makeScrew('v_shell_side_screw_'+(i+1),'shell','823017',shellPages,[36.5,i?-34:34,16],'x',[10+i*5,0,3],'外壳侧向固定螺钉 '+(i+1));
  const shellLeather=add('v_shell_leather','shell','外壳螺钉处饰皮（局部示意）',a32||model.startsWith('E')?'30312':'21537',shellPages,[0,30,-27],[0,0,-18],'小片只标识螺钉覆盖区域，不表示原厂饰皮被分割成独立零件。');for(const y of [-35,0,35])box(shellLeather,.3,7,5,[-38,y,17.5],'leather');
  set('shell',{number:'308023',description:model+'所选原厂外壳图，保留旧式/本型螺钉配置。',sharedWith:['A12','A16','A24'],difference:'紧固件配置按本型壳体页单独列出；不是按1996 A12壳体一律套用。'});
  const cover=ownClear('cover');side(cover,43,1.8,'chrome',[[23,-2,11],[-26,13,2.8]],.2);const rim=sideOutline(.2);rim.holes.push(new T.Path(sideOutline(2).getPoints(32)));extrudeSide(cover,rim,7.8,[35.2,0,0],'chrome');cylinder(cover,3.6,.5,[45.7,-26,13],'chrome');cylinder(cover,2.7,.65,[46,-26,13],'black');badge(cover,'1',3.5,3.5,[46.4,-26,13],'x');cylinder(cover,2.2,.5,[46,-33,12],'chrome');cylinder(cover,1.6,.6,[46.35,-33,12],'white');badge(cover,model,12,3.5,[45.55,-3,9],'x');
  set('cover',{number:a32?'607305':count===12?'30483':'30499',sharedWith:a32?[]:[base],difference:a32?'A32专用侧盖身份；开口仍对齐原有卷片轴和下方计数窗。':''});
  set('p_cover_leather',{number:old?'13080':'308411',pages:shellPages,sharedWith:old?[]:[base],difference:old?'A16S所选旧式右侧盖饰皮，与1996饰皮编号不同。':''});
  set('spools',{number:'教学耗材，无原厂零件号',description:'卷轴与胶卷仅表达走片空间，不用于判定胶片装量、片距或现售耗材适配。'});
  if(a32||model.startsWith('E')){
   const holder=add('v_slide_holder','shell','后部插刀存放架',a32?'308536':'308366',shellPages,[0,8,-32],[0,0,-35],'本型壳体图上的插刀存放结构，和插刀口光阱分开。');frontFrame(holder,0,0,-32,68,76,2,2,'black');box(holder,68,3,4,[0,-37,-33],'black');
  }

  // Count-specific families retain the real fine mechanism layout at y = -23.
  if(old||model==='A16TCC'){
   const g=clear('p_22371');const original=ctx.original.get('p_22371');original.meshes.forEach(m=>g.add(m.clone()));
   replaceIdentity('p_22371',model+'片距齿轮','21583',mechanismPages,'按21583较早16张图重建。共用细齿、凸台与通孔构建方式，未声称齿数或尺寸相同');
   g.scale.set(1,.97,.97); // Bake this model-local illustrative profile when flattening.
  }
  const supportNo=a32?'607311':old?'30516':count===16?'309344':'308364';
  set('support',{number:supportNo,sharedWith:[],difference:'支架按'+model+'件表选用，电子接触结构与A32计数连接件单列。'});
  if(old){
   const support=ownClear('support');side(support,33,2,'dark',[[24,-2,6.2],[-23,-3,2.3],[2,0,2.8]],1.2);frontFrame(support,0,0,19.8,69,78,4,6,'dark');for(const y of [-38,38])box(support,66,2.2,38,[0,y,-1],'dark');
   const frame=clear('p_22710');frontFrame(frame,0,0,21.65,46,46,.65,2.5,'chrome');for(const y of [-27.5,27.5])box(frame,61,15,.6,[0,y,21.5],'black');for(const x of [-27.5,27.5])box(frame,15,40,.6,[x,0,21.5],'black');for(const x of [-22,22])for(const y of [-22,22])cylinder(frame,1,.45,[x,y,22.1],'chrome','z');
   replaceIdentity('p_22710','A16S 小方形画幅框','21587',[12,13],'A16S小方形开口，与A16矩形画幅不同');ctx.differences.push('A16S 使用21587小方形画幅框、30516支架和旧式片芯，不能把A16只改铭牌。');
  }else if(count!==16&&electronic){set('p_22710',{name:model+'方形画幅框',number:'22710',pages:[31,32],sharedWith:['A12'],difference:''});}
  if(electronic){
   const p=clear('p_40380'),s=new T.Shape();s.moveTo(-38,-43);s.lineTo(38,-43);s.lineTo(38,43);s.lineTo(-38,43);s.closePath();const aperture=new T.Path();aperture.moveTo(-28,-28);aperture.lineTo(-28,28);aperture.lineTo(28,28);aperture.lineTo(28,-28);aperture.closePath();s.holes.push(aperture);
   for(const [x,y] of [[-34,-39],[0,-39],[34,-39],[-34,0],[34,0],[-34,39],[0,39],[34,39],[34,21]])hole(s,x,y,1.25);
   const contactOpening=new T.Path();contactOpening.moveTo(12,-39);contactOpening.lineTo(29,-39);contactOpening.lineTo(29,-31);contactOpening.lineTo(12,-31);contactOpening.closePath();s.holes.push(contactOpening);
   const outerGeometry=new T.ExtrudeGeometry(s,{depth:1.15,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:2,curveSegments:24});outerGeometry.translate(0,0,.05);
   mesh(p,outerGeometry, 'chrome',[0,0,25.5]);frontFrame(p,0,0,27,59,59,.3,1.1,'dark');for(const x of [-28,28]){box(p,10,2.1,3,[x,-40.5,28],'dark');box(p,8,2,3,[x,39.7,28],'dark');}
   replaceIdentity('p_40380',model+'电子接点前连接外板','308321',[31,33],'前连接板独立重建接点开口；早期308106不混入');
  }

  // 607-series pieces are replacements, not an A16 count label with 32 on it.
  if(a32){
   for(const id of ['p_22171','p_822065'])drop(id);
   const wheel=clear('p_22371');gear(wheel,35.35,-23,-3,16.7,65,1.25,'brass',4);ring(wheel,36.7,-23,-3,5.3,2.3,.8);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;ring(wheel,37.2,-23+Math.cos(a)*5.8,-3+Math.sin(a)*5.8,1.5,.67,1.1);}replaceIdentity('p_22371','A32片距齿轮','607316',[62,63],'607系列片距齿轮，轮廓与止挡关系按A32图重建');
   const center=clear('p_21548');lever(center,35.7,[[-11,-8],[-8,9],[2,12],[11,4],[8,-9],[-4,-11]],'silver',1.1);gear(center,36.9,0,0,8.5,27,1.1,'brass',3);gear(center,38.2,0,0,6,12,1.6,'silver');ring(center,39.8,0,0,3.15,2.1,.55,'chrome');replaceIdentity('p_21548','A32中央机构','607313',[62,63],'A32专用607313总成，增设止挡/卡扣邻接关系');
   const arm=clear('p_22715');lever(arm,35.6,[[13,9],[20,7],[18,1],[6,1],[-5,8],[-7,13],[-1,16],[3,9]],'pale',.95);ring(arm,36.7,19,11,2.4,1.3,.45);replaceIdentity('p_22715','A32控制摆臂','607318',[62,63],'A32独立控制摆臂');
   const release=clear('p_22277');lever(release,35.2,[[-21,8],[-21,11],[-12,14],[3,18],[5,15],[4,11],[-10,11],[-16,8]],'silver',.8);ring(release,36,2,14,2.35,1.55,.55);replaceIdentity('p_22277','A32释放臂','22315',[62,63],'本型与24张型共同列出的22315释放臂');set('p_22277',{sharedWith:['A24']});
   const shade=add('a32_shade','spacing','A32计数遮片','607089',[62,63],[40,-26,-3],[92,-24,0],'A32计数盘前的遮片；与607095弹簧成对识别。');lever(shade,40.1,[[-32,-16],[-31,12],[-19,13],[-19,8],[-27,7],[-27,-11]],'black',.35);
   let g=add('a32_shade_spring','spacing','计数遮片弹簧','607095',[62,63],[40,-29,9],[90,-25,14],'本型遮片弹簧，弯折形状与预紧不由动画验证。');spring(g,[40,-30,8],[40,-23,8],.55,8);
   g=add('a32_return_spring','spacing','A32计数机构弹簧','607094',[62,63],[37,-20,-18],[75,-22,-16],'A32专用607094，未套用其它型号预紧说明。');spring(g,[37,-20,-17],[37,-27,-17],.65,9);
   g=add('a32_stop','linkages','A32止挡','607088',[62,63],[36,-33,-17],[54,-31,-23],'A32独立止挡，与607096卡扣配合。');lever(g,35.5,[[-37,-20],[-31,-20],[-30,-16],[-34,-14],[-37,-15]],'silver',1);ring(g,36.5,-34,-17,2,.85,.6);
   g=add('a32_catch','linkages','A32止动爪','607096',[62,63],[36,-30,-14],[65,-29,-16],'原表止动爪；不把它画成A16偏心调整件。');lever(g,36.2,[[-35,-17],[-24,-16],[-22,-11],[-26,-10],[-28,-13],[-35,-14]],'brass',.8);
   makeScrew('a32_stop_screw','linkages','820012',[62,63],[37,-34,-17],'x',[75,-31,-22],'止挡螺钉');
   g=add('a32_stop_washer','linkages','止挡垫圈','810778',[62,63],[36.8,-34,-17],[69,-31,-22],'卡扣轴上的垫圈。');ring(g,36.8,-34,-17,1.9,.9,.25);
   const signal=clear('p_13031');lever(signal,36,[[-29,9],[-34,12],[-39,17],[-36,20],[-31,16],[-26,11]],'silver',.7);box(signal,1.6,5,3,[38,-35,16],'white');box(signal,1.65,2.7,3,[38.1,-36.1,16],'red');replaceIdentity('p_13031','A32曝光信号件','607314',[62,63],'A32专用信号件');
   const dial=clear('p_13806');ring(dial,39.1,-23,-3,15.9,2.3,.4,'black');for(let i=0;i<33;i++){const a=i/33*Math.PI*2;const mark=box(dial,.18,.7,.3,[39.6,-23+Math.cos(a)*14,-3+Math.sin(a)*14],'white');mark.rotation.x=a;}badge(dial,'32',9,6,[39.8,-23,-3],'x');ring(dial,39.8,-23,-3,2.7,1.9,.2,'chrome');replaceIdentity('p_13806','A32计数盘（0–32）','607320',[62,63],'A32专用计数盘与遮片对应；刻度排列为识别示意');
   ctx.differences.push('A32替换607318摆臂、607313中央机构、607316片距轮、607320计数盘，增设607089遮片和607088/607096止挡。原图预紧3圈只列为核对项。');
  }

  // Old A16S holder is not the later 309-series mechanical insert.
  if(old){
   const identities={p_40305:['旧式片芯端板','90394'],p_22401:['中间支架与内端板','21620'],p_22389:['旧式支承板','13916'],p_22388:['小方形画幅压片板','21615'],p_13512:['压片板片簧','13913'],p_13060:['片芯锁轴','13060'],p_13784:['片芯锁柄','13784'],p_12268:['锁柄毡环','12268'],p_13510:['旧式导片件','13510'],p_13511:['旧式导片件','13912'],p_22398:['旧式卷片臂','13797'],p_22379:['旧式指示支架','21524'],p_22375:['旧式指示齿轮','13794'],p_22382:['旧式胶片信号件','13785']};
   for(const [id,[name,number]]of Object.entries(identities))replaceIdentity(id,'A16S '+name,number,filmPages,'UV211701–31EP12394旧片芯图单列部件');
   for(const id of ['p_22282','p_815608','p_40318','p_814952','p_816616'])drop(id);
   const e=clear('p_40305');side(e,-38.2,1.5,'chrome',[[4,-3,10.8],[-23,-11,3.7],[23,-11,3.7]],1.3);side(e,-39,.25,'leather',[[4,-3,12]],3.7);
   const frame=clear('p_22401');for(const y of [-34.5,34.5]){box(frame,65,2.2,28,[-2,y,-1],'silver');box(frame,65,5.5,1.4,[-2,y,-14.5],'silver');}side(frame,29,1.7,'silver',[[23,-11,8.7],[-23,-11,8.7],[0,0,9]],5);
   const pl=clear('p_22389');side(pl,31,1.2,'silver',[[0,0,10],[-23,-11,4],[23,-11,4]],6);
   const pp=clear('p_22388');plate(pp,50,50,14.2,.8);for(const x of [-20,20])for(const y of [-25,25])box(pp,5,2,1,[x,y,14.6],'silver');
   for(const id of ['p_13060','p_13784','p_12268','p_13510','p_12540']){const g=clear(id),oldPart=ctx.original.get(id);oldPart.meshes.forEach(m=>g.add(m.clone()));set(id,{sharedWith:['A12']});}
   const arm=clear('p_22398');lever(arm,33.4,[[-29,5],[24,5],[28,8],[26,13],[-27,13],[-29,9]],'silver',1.1);ring(arm,34.6,23,-10,3.5,1.6,.5);cylinder(arm,2.2,4,[35,23,-10],'silver');
   const guide=clear('p_13511');lever(guide,-34.8,[[18,-3],[29,-3],[30,7],[24,10],[18,7]],'silver',1.1);ring(guide,-34,24,3,3,1.3,.5);
   const bracket=clear('p_22379');box(bracket,10,1.1,9,[-28,1,-8],'silver');box(bracket,1,8,9,[-33,5,-8],'silver');
   const cog=clear('p_22375');gear(cog,-31.4,4,-3,5.5,18,1,'brass',3);
   const sign=clear('p_22382');rod(sign,[-31,4,-3],[25,4,-3],.6);cylinder(sign,4,.6,[-35,4,-3],'white');box(sign,.15,3,5,[-35.4,2.8,-3],'red');
   let g=add('s_21616','pressure','A16S导向板','21616',filmPages,[0,0,12],[-82,0,24],'旧式片芯独立导向板，不能省略为A16新式压片板。');plate(g,43,44,12.8,.55,'silver',[[0,0,7]]);
   g=add('s_12307','pressure','导向板弹簧','12307',filmPages,[20,0,12],[-91,0,29],'旧片芯表的导向板弹簧。');spring(g,[20,-6,12],[20,6,12],.75,10);
   g=add('s_12279','insert','旧片芯支承件','12279',filmPages,[30,23,-10],[-55,22,-10],'旧式12279 holder，和卷轴端部支承相邻。');lever(g,30,[[18,6],[28,6],[29,14],[20,14]],'silver',1.1);ring(g,31,23,-10,3.2,1.3,.5);
   g=add('s_12769','insert','旧片芯压簧','12769',filmPages,[-29,-23,-11],[-85,-20,-10],'旧片芯表独立弹簧。');spring(g,[-31,-23,-11],[-23,-23,-11],1,9);
   g=add('s_814522','insert','旧片芯回位簧','814522',filmPages,[30,-25,-7],[-62,-17,-9],'旧片芯表回位弹簧。');spring(g,[31,-26,-7],[31,-17,-7],.72,10);
   g=add('s_12722','insert','旧片芯调整垫片','12722',filmPages,[-35,4,-3],[-91,0,-4],'表中厚度有不同选项；模型不提供选厚依据。');ring(g,-35,4,-3,5,3,.2);ring(g,-35.5,4,-3,5,3,.2);
   for(let i=0;i<4;i++)makeScrew('s_821204_'+(i+1),'insert','821204',filmPages,[-38.7,i<2?-33:33,i%2?-16:13],'x',[-94-i*4,0,0],'旧端板螺钉 '+(i+1));
  }

  // Rebuild end plates and holder identity for the electrically linked magazines.
  if(electronic){
   const narrow=count===16,numbers={p_40305:narrow?'313322':'312323',p_22401:narrow?'309506':'308516',p_22389:narrow?'313101':'312105',p_22388:narrow?'309102':'308104',p_13512:'13913',p_13060:'308103',p_13784:'308101',p_12268:'308410',p_22282:'308408',p_13510:'308345',p_13511:narrow?'309403':'308346'};
   const same16=new Set(['p_22401','p_22389','p_22388','p_13512','p_13060','p_13784','p_12268','p_22282','p_13510','p_13511']);
   for(const [id,number]of Object.entries(numbers)){const previous=metadata.get(id)?.number||'';replaceIdentity(id,metadata.get(id).name.replace(/机械/g,'电子联络型'),number,filmPages,'电子片芯件表身份，与普通A12/A24片芯分开');if(narrow&&same16.has(id)&&normal(previous)===normal(number))set(id,{sharedWith:['A16'],difference:'与A16后期片芯同号；电路端盖及邻接关系按电子后背独立展示。'});}
   const ep=clear('p_40305');side(ep,-38.2,1.4,'chrome',[[4,-3,10.5],[27,-10,4.5],[-27,-10,4.5]],2.5);for(const y of [-36,36])for(const z of [-17,14])cylinder(ep,2.2,2,[-39,y,z],'silver');
   if(!narrow){
    const frame=clear('p_22401');for(const y of [-34,34]){box(frame,64,2.4,28,[-2,y,-1],'silver');box(frame,62,3.5,1.2,[-2,y,-14],'silver');rod(frame,[-32,y,12],[28,y,12],.7,'chrome');}side(frame,28.5,1.5,'silver',[[0,0,8],[-23,-11,7.5],[23,-11,7.5]],5.5);
    const plateG=clear('p_22389');side(plateG,31,1.1,'silver',[[0,0,9.5],[-23,-11,5],[23,-11,5]],6);for(const y of [-30.5,30.5])for(const z of [-13.5,12.5])cylinder(plateG,1.9,2,[31.8,y,z],'silver');
    const pressure=clear('p_22388');plate(pressure,58,59,14.2,.8);for(const x of [-23,23])for(const y of [-29.5,29.5]){box(pressure,6,2.2,.7,[x,y,14.6],'silver');box(pressure,6,.6,2,[x,y,13.5],'silver');}
    const ps=clear('p_13512');const sh=new T.Shape();const points=[[-24,-20],[-20,-22],[-6,-3],[6,-3],[20,-22],[24,-20],[7,0],[24,20],[20,22],[6,3],[-6,3],[-20,22],[-24,20],[-7,0]];points.forEach((p,i)=>i?sh.lineTo(...p):sh.moveTo(...p));sh.closePath();hole(sh,0,0,2.3);const springGeometry=new T.ExtrudeGeometry(sh,{depth:.31,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:1,curveSegments:24});springGeometry.translate(0,0,.02);mesh(ps,springGeometry,'dark',[0,0,11.7]);
    const shaft=clear('p_13060');rod(shaft,[-31,-30,-6],[30,-30,-6],.85,'chrome');rod(shaft,[30,-30,-6],[30,-24,-6],.85,'chrome');rod(shaft,[-31,-30,-6],[-31,-30,-10],.85,'chrome');
    const lock=clear('p_13784');ring(lock,-41.2,4,-3,10,3.3,1.5,'chrome');cylinder(lock,3,7,[-37,4,-3],'silver');box(lock,2,3.5,18,[-43,4,-3],'chrome');
    const felt=clear('p_12268');ring(felt,-40,4,-3,10.2,7.4,.4,'seal');
    const core=clear('p_22282');cylinder(core,3.3,1,[-33,23,-11],'chrome');cylinder(core,1.7,3.5,[-31,23,-11],'silver');
    for(const [id,y]of [['p_13510',-23],['p_13511',23]]){const guide=clear(id);lever(guide,-34,[[y-5,-2],[y-5,7],[y+4,8],[y+5,1]],'silver',1);ring(guide,-33,y,3,2.4,1.1,.5);}
   }
   if(photoElectronic){
    // The photographed key is a flush black folding grip. Keep it attached to
    // its original part slot; the shaft still passes through the same cover hole.
    const key=clear('p_13784');cylinder(key,3,7,[-37,4,-3],'silver');cylinder(key,8.05,.65,[-45,4,-3],'black');
    ring(key,-45.7,4,-3,10,8.8,1.15,'dark');
    const folded=new T.Shape();folded.absarc(0,0,8.9,.20,Math.PI*2-.20,false);folded.absarc(0,0,7.7,Math.PI*2-.20,.20,true);folded.closePath();
    extrudeSide(key,folded,.7,[-46,4,-3],'black');box(key,1.0,3.6,2.8,[-45.65,4,6.2],'black');
    set('p_13784',{description:metadata.get('p_13784').description+' 外露锁柄按实拍改为黑色收折轮廓，仍未模拟转动或真实铰链。',evidence:photoEvidence});
   }
   const cp=dual?[45,46]:[43,44];
   const eg=add('e_cover','electronics',dual?'TCC / CC双拨盘片芯端盖':'E系列单拨盘片芯端盖',dual?'308431':'308519',cp,[-44,15,-4],[-115,0,0],'原厂正文PDF6：松开四枚823435后抬盖，四根导线仍连接接触总成。不能把本盖当成摇柄侧盖。','electronic-cover');
   const holes=[[4,-3,10.8],[27,-10,9.2]];if(dual)holes.push([-27,-10,8.6]);side(eg,-43.3,1.5,'chrome',holes,1.8);
   const leath=add('e_leather','electronics','电路端盖饰皮',dual?'308403':'308521',cp,[-45,10,0],[-131,0,0],'饰皮有拨盘与锁柄的实际开口关系；不模拟剥胶。','electronic-cover');side(leath,-44,.4,'leather',holes,3.2);
   // All TCC blue lines are also explicit in the original product catalogue
   // 02948, PDF p18. E12/E16/E12CC are confirmed in the inspected photographs.
   if(model.endsWith('TCC')||photoElectronic){
    const blue=new T.MeshStandardMaterial({color:0x238bb5,roughness:.72,metalness:.03});
    for(const y of dual?[-25.6,-27.4]:[-32,-34])box(leath,.13,.50,dual?8.0:20,[-44.13,y,dual?10.8:0],'black').material=blue;
    set('e_leather',{evidence:(photoElectronic?photoEvidence:'A16TCC/A24TCC未获得明确标型且可目视的网络实拍，仍保留原示意外形。')+' TCC三型双蓝线另见原厂产品目录02948 PDF18；线宽为估算。'});
   }
   for(let i=0;i<4;i++)makeScrew('e_cover_screw_'+(i+1),'electronics','823435',cp,[-42.5,i<2?-36:36,i%2?-17:14],'x',[-145-i*5,0,0],'电路端盖螺钉 '+(i+1),'electronic-cover');
   const board=add('e_board','electronics','柔性电路板',dual?'308460':'308524',cp,[-41,20,-7],[-81,0,-7],'曲线轮廓及环形接触区域按原图；铜迹线只是认件示意，不是电路图。','board');
   const shape=new T.Shape();shape.moveTo(-18,-35);shape.lineTo(3,-35);shape.lineTo(8,-25);shape.quadraticCurveTo(-4,-12,5,-7);shape.lineTo(12,9);shape.quadraticCurveTo(1,19,5,27);shape.lineTo(6,35);shape.lineTo(-15,35);shape.lineTo(-19,27);shape.quadraticCurveTo(-6,11,-10,0);shape.quadraticCurveTo(-4,-10,-17,-22);shape.closePath();hole(shape,3,4,10.8);extrudeSide(board,shape,.38,[-41.1,0,0],'brass');
   for(const y of dual?[27,-27]:[27])for(let n=0;n<4;n++)ring(board,-41.3,y,-10,3+n*1.45,2.7+n*1.45,.1,'silver');
   for(let i=0;i<2;i++){const tape=add('e_tape_'+(i+1),'electronics','电路固定胶片 '+(i+1),'308495',cp,[-40,4,2+i*8],[-73,0,6+i*5],'原表两片胶带，用于板件定位；厚度和粘接方式不能由模型决定。','board');box(tape,.2,12,7,[-40.5,i?-18:19,-10],'pale');}
   if(!dual)makeScrew('e_board_screw','electronics','820425',cp,[-40,-21,-10],'x',[-101,-20,-3],'电路板固定螺钉','board');
   for(let i=0;i<4;i++){
    const sid='e_endplate_screw_'+(i+1);makeScrew(sid,'insert',model==='E16'?'823650':'823450',cp,[-38.5,i<2?-36:36,i%2?-17:14],'x',[-69-i*4,0,0],'电路侧端板连接螺钉 '+(i+1),'electronic-endplate');
    set(sid,{description:model==='E16'?'本模型E16片距轮已选37ET10301起配置，所以同时选用37ET10172起的823650端板螺钉。':'本图按823450标示；E12、E24、E12CC后期另有823650及各自起始序号，实际订件先核对序列号。'});
   }
   const positions=dual?[27,-27]:[27];
   positions.forEach((y,i)=>{
    let g=add(i?'e_second_indicator':'e_iso_indicator','electronics',i?'第二指示环':'ISO指示环',i?'308348':'308347',cp,[-46,y,-10],[-149,y*.4,0],i?'Indicator按原厂件名标示；已核实外观的型号显示−4至+3文字，角度仍为示意。':'ISO刻度环与拨盘分件。','control');ring(g,-46,y,-10,i?8.5:9.2,6.5,1,photoElectronic?'black':'chrome');for(let n=0;n<16;n++){const a=n*Math.PI/8;box(g,.2,.6,.2,[-46.1,y+Math.cos(a)*8,-10+Math.sin(a)*8],photoElectronic?'white':'black');}
    if(photoElectronic){dialLegend(g,y,!!i);set(i?'e_second_indicator':'e_iso_indicator',{evidence:photoEvidence});}
    g=add(i?'e_second_dial':'e_iso_dial','electronics',i?'第二拨盘':'ISO拨盘','308107',cp,[-47,y,-10],[-163,y*.5,0],'两个型号族使用同号拨盘，TCC/CC有两件，普通E型有一件。滚花边缘和凹槽依据PDF45认件，细齿数量、槽宽和表面颜色仍为示意。','control');
    const grip=new T.Shape();for(let n=0;n<32*4;n++){const a=n/(32*4)*Math.PI*2,r=n%4===1||n%4===2?6.4:6.0;n?grip.lineTo(Math.cos(a)*r,Math.sin(a)*r):grip.moveTo(Math.cos(a)*r,Math.sin(a)*r);}grip.closePath();extrudeSide(g,grip,1.7,[-47.4,y,-10],'black');
    if(photoElectronic){
     // Unlike a screw slot, the original control has a broad raised finger bar
     // with recessed wells on either side, visible in the retailer side views.
     cylinder(g,5.9,.38,[-47.48,y,-10],'black');ring(g,-48.0,y,-10,6.25,5.35,.60,'dark');
     const gripBar=new T.Shape();gripBar.moveTo(-5.5,-.95);gripBar.lineTo(5.5,-.95);gripBar.quadraticCurveTo(5.9,0,5.5,.95);gripBar.lineTo(-5.5,.95);gripBar.quadraticCurveTo(-5.9,0,-5.5,-.95);gripBar.closePath();extrudeSide(g,gripBar,1.2,[-48.3,y,-10],'black');
     set(i?'e_second_dial':'e_iso_dial',{description:'同号308107拨盘。实拍可见凸起的宽指拨横条和两侧凹面；此处外形替代原来的螺钉式细槽。尺寸、细齿数量、调节手感与转角仍未测量。',evidence:photoEvidence});
    }else F.slottedCap(g,5.5,.65,[-47.7,y,-10],'black','-x',.82);
    g=add('e_dial_spring_'+(i+1),'electronics','拨盘定位弹簧 '+(i+1),'815604',cp,[-40,y+6,-10],[-103,y*.4,9],'与定位钢珠配合；动画不验证弹力或预压。','control');spring(g,[-40,y+3,-10],[-40,y+7,-10],.6,6);
    g=add('e_ball_'+(i+1),'electronics','拨盘定位钢珠 '+(i+1),'809020',cp,[-40,y+8,-10],[-117,y*.4,10],'小钢珠单列，提醒开盖时分别收存。','control');mesh(g,new T.SphereGeometry(.9,20,12),'chrome',[-40,y+8,-10]);
    makeScrew(i?'e_iso_screw_2':'e_iso_screw','electronics','820445',cp,[-44.5,y+8,-6],'x',[-177,y*.5,1],'指示环固定螺钉 '+(i+1),'control');
   });
   const contact=add('e_contacts','electronics','片芯接触总成及四根导线','308043',cp,[-31,-28,14],[-56,-21,15],'原图4根导线为绿、黑、白、红；曲线不指定焊脚顺序。真实拆离需先按原厂要求处理焊接连接。','contact');box(contact,8,4,7,[-30,-28,14],'black');const colors=['#387850','#1b2224','#eeeeeb','#ab493a'];colors.forEach((color,i)=>{const mat=new T.MeshStandardMaterial({color,roughness:.65});const points=[[-40.8,12-i*2,-7],[-38,-7,-2],[-34,-22,9],[-33+i*2,-28,14]];const geo=new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,.3,6,false);mesh(contact,geo,mat);cylinder(contact,.7,4,[-33+i*2,-28,19],'brass','z');});
   const flex=add('e_contact_flex','support','机身侧接触软片','308044',[31,32],[20,-35,24],[20,-20,45],'与片芯接触总成308043分开，是后背支架上的接触软片。');box(flex,17,7,.3,[20,-35,24],'brass');for(let i=0;i<4;i++)box(flex,2.5,5,.15,[14+i*4,-35,24.3],'chrome');
   const rubber=add('e_rubber','electronics','电路盖接触橡胶板',dual?'309343':'308368',cp,[-42,-35,12],[-127,-27,15],'原厂端盖图中的橡胶板；不能混同插刀口光阱。','contact');box(rubber,.7,9,11,[-42,-34,11],'seal');
   const outerTape=add('e_contact_tape','electronics','端盖固定胶带',dual?'308492':'308523',cp,[-42,-35,13],[-136,-29,18],'胶带与橡胶板按图分开识别。','contact');box(outerTape,.12,8,10,[-42.6,-34,11],'pale');
   makeScrew('e_contact_screw_1','electronics','826040',filmPages,[-30,-28,11],'z',[-66,-22,26],'接触总成固定螺钉 1','contact');makeScrew('e_contact_screw_2','electronics','826040',filmPages,[-25,-28,11],'z',[-74,-22,26],'接触总成固定螺钉 2','contact');
   ctx.differences.push(model+'增加独立片芯电路端盖、ISO'+(dual?'和第二':'')+'拨盘、定位钢珠/弹簧、柔性电路、四根导线和两组不同接点；不沿用普通A12片芯编号。');
  }
  if(a32){set('p_40305',{number:'313322 / 22762',pages:[27,28,29,30],sharedWith:['A16'],difference:''});ctx.differences.push('A32后期片芯沿用手册明列的A16共有件；计数机构、止挡和右盖保留A32区别。');}
  // Correct model labels in the actual meshes, not just the sidebar metadata.
  const label=clear('p_14261');box(label,.5,4.5,8,[-39.6,-26,8],'chrome');badge(label,model,6,3,[-39.91,-26,8],'-x','#b4bcbd','#222a2b');set('p_14261',{name:'片芯编号牌（型号示意）',description:'只显示教学型号，不编造实际序列号；片芯和壳体配对应核对实物。'});
  // Every reused material is cloned while flattening for independent highlighting.
  return flatten(ctx,model);
 };
 global.buildPrecisionMagazineModel.modelIds=supported.slice();
})(typeof window!=='undefined'?window:globalThis);
