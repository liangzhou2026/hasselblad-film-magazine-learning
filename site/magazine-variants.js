/* Late mechanical A magazines. Source: S3 PDF 5–14, 17–18, 23–30;
 * S7 PDF 80–81, 92–93, 109–112, 120. Stable IDs are animation slots,
 * never display identities. Geometry is a teaching approximation, not CAD. */
(() => {
 'use strict';
 const profiles = {
  A12: {id:'A12',label:'A12 后期机械后背',scope:'后期普通机械 A12；1996 改型外壳与 RI3250869 起片芯',serial:'轴/机构板：30EU15001 起；短弹簧支架：30ET14879 起；片芯：RI3250869 起',boundary:'采用后期零件配置；旧轴12781、旧机构板13805及早期弹簧不混入。三维尺寸、齿形、预紧与移动轨迹为教学示意。',count:12,insertPage:23,assemblyVerified:true},
  A16: {id:'A16',label:'A16 后期机械后背',scope:'后期普通机械 A16；矩形画框、新型片芯和偏心件',serial:'轴/机构板：31ET10901 起；间距齿轮：31ET10601 起；片芯：31EP12395 起；端板螺钉：31ET10171 起',boundary:'选用22841间距齿轮、814527双弹簧及机械片芯309022/309023。片芯已按A16件表重建为简化总成，尺寸与内部接触关系未实测；不含E/TCC电路。当前只核对拆卸主线，安装校准流程不开放。',count:16,insertPage:27,assemblyVerified:false},
  A24: {id:'A24',label:'A24 后期机械后背',scope:'后期普通机械 A24；24张机构与固定止挡配置',serial:'轴/机构板：32EU11181 起；固定止挡：32ET10135 起；片芯：RI3250869 起',boundary:'采用21483中央机构、22315释放臂及固定止挡822065。早期A24的偏心件不混入；短弹簧支架须按实物销位确认，通告未给A24起始序号。画框独立备件号未核实；不以动画证明片距或220胶片适配结果。当前不开放安装校准流程。',count:24,insertPage:23,assemblyVerified:false}
 };
 const configs = {
  A12:{dial:'13806',spacing:'22371',drive:'308109',center:'21548',release:'22277',support:'30752'},
  A16:{dial:'13849',spacing:'22841',drive:'309103',center:'21548',release:'22277',support:'30751'},
  A24:{dial:'13819',spacing:'21484',drive:'311101',center:'21483',release:'22315',support:'30752'}
 };
 const filmRoots = new Set(['insert','pressure','rollers','spools']);
 const geometryBoundary='轮廓、厚度、孔位及齿形为识别用简化几何，未经测量；不证明真实配合、移动路径或装配精度。';
 const insertNumbers={p_40305:'313322 / 22762',p_22401:'309506',p_22389:'313101',p_22388:'309102',p_13512:'13913',p_13060:'308103',p_13784:'308101',p_12268:'308410',p_22282:'308408',p_13510:'308345',p_13511:'309403'};

 function prepare(requested,ctx){
  const key=String(requested||'A12').toUpperCase(),id=Object.hasOwn(profiles,key)?key:'A12';
  const profile=profiles[id],cfg=configs[id];
  const {factories:F,data,detailParts,sequences}=ctx;
  if(!F?.groups||!data?.parts||!Array.isArray(detailParts)||!sequences?.disassembly)throw new Error('A 系列变体缺少模型上下文');
  if(data.magazineModel){if(data.magazineModel!==id)throw new Error('切换后背型号需要重新载入页面');return profile;}
  const {T,groups,mesh,box,cylinder,gear,lever,rod,spring,screw,extrudeSide,badge,frontFrame,side,resetGroup,detail}=F;
  const catalog=new Map([...data.parts,...detailParts].map(p=>[p.id,p]));
  const originalFilm=detailParts.filter(p=>filmRoots.has(p.parent));
  const partMap={'13806':cfg.dial,'22371':cfg.spacing,'308109':cfg.drive,'21548':cfg.center,'22277':cfg.release};
  const replaceText=value=>typeof value==='string'?value.replace(/\b(13806|22371|308109|21548|22277)\b/g,n=>partMap[n]).replace(/A12/g,id):value;
  // Rewrite only human-readable fields. IDs, parents and sequence action arrays stay stable.
  const textFields=['name','en','number','description','care','evidence','lube'];
  for(const p of catalog.values()){
   for(const k of textFields)p[k]=replaceText(p[k]);
   p.model=id;
  }
  function set(partId,values){const p=catalog.get(partId);if(!p)throw new Error('缺少变体节点 '+partId);Object.assign(p,values);return p;}
  function clear(partId){if(!groups[partId])throw new Error('缺少几何节点 '+partId);resetGroup(partId);return groups[partId];}
  function ownClear(partId){const children=groups[partId].children.filter(o=>!o.isMesh);for(const g of children)groups[partId].remove(g);resetGroup(partId);for(const g of children)groups[partId].add(g);return groups[partId];}
  function hole(shape,x,y,r){const p=new T.Path();p.absarc(x,y,r,0,Math.PI*2,true);shape.holes.push(p);}
  function ring(g,x,y,z,r,inner,depth,mat='silver'){const s=new T.Shape();s.absarc(0,0,r,0,Math.PI*2,false);if(inner)hole(s,0,0,inner);return extrudeSide(g,s,depth,[x,y,z],mat);}
  function flat(g,w,h,z,mat='silver',depth=.8){const s=new T.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();return mesh(g,new T.ExtrudeGeometry(s,{depth,bevelEnabled:false}),mat,[0,0,z]);}
  function labelTexture(text){const c=document.createElement('canvas');c.width=512;c.height=256;const p=c.getContext('2d');p.fillStyle='#202a2d';p.fillRect(0,0,512,256);p.fillStyle='#e6e7df';p.font='500 105px Arial';p.textAlign='center';p.textBaseline='middle';p.fillText(text,256,130);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;return tx;}

  set('shell',{description:profile.scope+'。外壳按S3 PDF17–18的改型配置展示。',evidence:'S3 PDF17–18；旧壳体另有两枚侧向螺钉，见S7 PDF78–79。'+geometryBoundary});
  set('cover',{number:id==='A12'?'30483（铬色）/ 30639（黑色）':'30499（铬色）/ 30640（黑色）',description:profile.label+'的右侧机构盖；以三枚823012固定。',pages:[5,17,18]});
  set('support',{number:cfg.support+(id==='A16'?' / 22712':id==='A12'?' / 22710':'；画框备件号待核'),description:profile.label+'支架；固定侧机构并支承画框。'+(id==='A16'?'画框显示为矩形，并附两条后期遮光条。':''),evidence:'S3 PDF12–13；支架同编号存在改型，销位及弹簧应查S7 PDF110–112。'+geometryBoundary});
  set('spacing',{number:cfg.dial+' / '+cfg.spacing+'；弹簧816611',description:id+'计数盘与间距轮分件显示。计数盘数字0–'+profile.count+'；示意轮齿不是实测齿数。',care:'按选定型号核对间距轮、计数盘和自动停片关系；动画不验证片距、啮合与相位。'});
  set('drive',{name:id+'过片齿轮总成',number:cfg.drive+'；轴308426；齿轮12215',description:'后期'+id+'传动总成'+cfg.drive+'；采用308426轴及308485机构板。',evidence:'S3 PDF12、14；改型起点见S7 PDF120。'+geometryBoundary});
  set('linkages',{number:'22715 / '+cfg.release+' / 12819'+(id==='A16'?'；22171 / 820013':''),care:id==='A16'?'本型号含偏心件22171，位置与校准须核对原图；当前拆卸主线不擅自转动或取下偏心件。':'本示例为后期固定止挡配置；早期变体需另查通告。'});
  set('p_22371',{name:id+'间距齿轮',number:cfg.spacing,description:id+'所选间距齿轮为'+cfg.spacing+'，与计数盘'+cfg.dial+'配合。'+(id==='A16'?'S7 PDF110–111明确新轮直径增大；三维只表达该差异，不提供增大量。':''),care:'不得跨型号或跨改型混用。示意齿数、凸台与止挡轮廓不是制造参数。',evidence:'S3 PDF12–13位置20；'+geometryBoundary});
  set('p_13806',{name:id+'计数盘（0–'+profile.count+'）',number:cfg.dial,description:'数字0–'+profile.count+'，以三枚824202与相应间距轮连接。编号来自该型号件表；刻字排布为可读性示意。'});
  set('p_308109',{name:id+'过片齿轮总成（简化下层）',en:'Gear assembly, '+id,number:cfg.drive,description:'后期'+id+'专用总成'+cfg.drive+'，与308426轴配合。内部层次简化，不把三维齿数当原厂参数。',care:'先抽轴后整体取出；不能因总成外形近似而互换不同型号。'});
  set('p_21548',{name:id+'中央机构总成',number:cfg.center,description:'S3 PDF13位置21：'+id+'对应'+cfg.center+'。'+(id==='A24'?'本项重建为A24独立的简化总成；不沿用A12零件身份。':''),evidence:'S3 PDF12–13；'+geometryBoundary});
  set('p_22277',{name:id+'释放臂',number:cfg.release,description:'S3 PDF13位置10对应'+cfg.release+'。'+(id==='A24'?'以简化薄片和入槽端表示A24专用释放臂；实际曲线及厚度未测量。':'与对应间距轮的停片凹口配合。')});
  set('p_814527',{description:'后期改位支架使用两根814527。旧型为较长814507；不能只按外观拉伸替换。',evidence:'S3 PDF13；S7 PDF110–112。'+(id==='A24'?'通告未列A24起始序号，需核对实物销位。':'')});

  // Numbered counter is actual geometry/texture replacement for every profile.
  {
   const g=clear('p_13806');ring(g,39.1,-23,-3,15.9,2.3,.38,'black');
   const c=document.createElement('canvas');c.width=c.height=1024;const p=c.getContext('2d');p.clearRect(0,0,1024,1024);p.translate(512,512);p.fillStyle='#172025';p.beginPath();p.arc(0,0,498,0,Math.PI*2);p.fill();p.strokeStyle='#9da9a8';p.lineWidth=3;
   for(const r of [482,265]){p.beginPath();p.arc(0,0,r,0,Math.PI*2);p.stroke();}
   p.fillStyle='#ececde';p.font='600 '+(profile.count>16?48:profile.count>12?60:72)+'px Arial';p.textAlign='center';p.textBaseline='middle';
   const values=Array.from({length:profile.count+1},(_,n)=>n);
   for(const n of values){const a=n/values.length*Math.PI*2-Math.PI/2;p.save();p.translate(Math.cos(a)*399,Math.sin(a)*399);p.rotate(a+Math.PI/2);p.fillText(String(n),0,0);p.restore();}
   p.font='22px Arial';p.fillText(id,0,-200);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;
   const geo=new T.RingGeometry(2.3,15.7,100),uv=geo.attributes.uv,pos=geo.attributes.position;
   for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/31.4+.5,pos.getY(i)/31.4+.5);uv.needsUpdate=true;
   const face=mesh(g,geo,new T.MeshStandardMaterial({map:tx,roughness:.5,metalness:.25}),[39.5,-23,-3]);face.rotation.y=Math.PI/2;
   ring(g,39.52,-23,-3,7.8,2.3,.28,'black');ring(g,39.84,-23,-3,2.65,1.9,.22,'chrome');g.userData.counterValues=values;
  }
  // Cover markings retain existing pickable meshes and change only their texture.
  for(const m of groups.cover.children)if(m.isMesh&&m.geometry.type==='PlaneGeometry'&&Math.abs(m.position.y+3)<.01&&Math.abs(m.position.z-9)<.01){m.material=m.material.clone();m.material.map=labelTexture(id);m.material.needsUpdate=true;}
  if(id!=='A12'){
   const g=clear('p_22371'),r=id==='A16'?18.2:16.8;
   gear(g,35.35,-23,-3,r,65,1.25,'brass',id==='A16'?4:6);ring(g,36.65,-23,-3,5.3,2.3,.75);
   for(let i=0;i<3;i++){const a=i*Math.PI*2/3;ring(g,37.2,-23+Math.cos(a)*5.8,-3+Math.sin(a)*5.8,1.5,.67,1.1);}
   g.userData.variantGeometry={model:id,kind:'spacing-wheel',schematic:true,radius:r};
   const drive=clear('p_308109');gear(drive,38.8,24,-2,id==='A16'?10.25:10.6,38,.95,'silver',id==='A16'?4:3);ring(drive,39.8,24,-2,8.25,6.8,.7,'brass');ring(drive,39.85,24,-2,3.7,1.55,.8);
   drive.userData.variantGeometry={model:id,kind:'gear-assembly',schematic:true};
  }
  if(id==='A24'){
   const center=clear('p_21548');lever(center,35.8,[[-10,-8],[-9,6],[-3,11],[8,7],[10,1],[6,-9],[-3,-10]],'silver',1.05);gear(center,36.9,0,0,8.3,29,1.0,'brass',3);gear(center,38.15,0,0,5.9,12,1.6,'silver');ring(center,39.8,0,0,3.15,2.1,.55,'chrome');ring(center,35.1,0,0,2.7,1.7,5.8,'dark');
   const arm=clear('p_22277');lever(arm,35.2,[[-21,8],[-21,11],[-12,14],[3,18],[5,15],[4,11],[-10,11],[-16,8]],'silver',.8);box(arm,2.1,3,.75,[36.6,-20,9],'silver');ring(arm,36,2,14,2.35,1.55,.55);
   set('p_22710',{name:'A24方形画幅框（件号待核）',number:'独立备件号未核实',description:'保留A24方形画幅的结构示意。S3 PDF13的22710行仅注明A12，不能据此给A24确认该件号。',evidence:'S3 PDF12–13；未查明A24画框独立备件号，几何不作为互换依据。'});
   set('p_822065',{name:'A24固定止挡螺钉',description:'后期A24自32ET10135起使用822065，替代早期偏心件22171与820013。',care:'本示例只覆盖后期固定止挡配置；早期件不可按本模型直接排除。',evidence:'S3 PDF13；S7 PDF92（9/96）。'});
  }

  if(id==='A16'){
   // Existing fixed-stop slot becomes the A16 eccentric screw. Stable key is internal only.
   const stop=clear('p_822065');cylinder(stop,.7,2.4,[37,-33,-17],'silver');screw(stop,38.4,-33,-17);
   set('p_822065',{name:'A16偏心件固定螺钉',en:'Eccentric screw',number:'820013',pages:[9,12,14],description:'A16偏心件22171的固定螺钉，S3 PDF14位置65；不是A12/A24的固定止挡螺钉。',care:'当前拆卸主线不单独松动此调节件；调整位置须按原厂基准和实际测试胶片核对。',evidence:'S3 PDF9、14。'+geometryBoundary});
   const eccentric=detail('p_22171','linkages',[36.6,-33,-17],[9,-23,-20]);ring(eccentric,35.3,-33.55,-17,3.2,.7,1.3,'brass');box(eccentric,.35,3,.4,[36.7,-33.55,-19.1],'dark');
   const eccentricPart={id:'p_22171',parent:'linkages',name:'A16偏心调节件',en:'Eccentric',number:'22171',section:'mechanism',model:id,pages:[9,12,14],description:'A16首张位置相关偏心件。孔心与外圆中心错开以表达偏心结构；偏移量为示意。',care:'拆卸路线仅辨认本件，不自动调整或取出；S3 PDF9的基准关联原厂参考胶片。',evidence:'S3 PDF14位置66；'+geometryBoundary,lube:'没有依据给整个偏心件加油。'};detailParts.push(eccentricPart);catalog.set(eccentricPart.id,eccentricPart);
   const support=ownClear('support');side(support,33,2,'dark',[[24,-2,6.2],[-23,-3,2.3],[2,0,2.8]],1.2);frontFrame(support,0,0,19.8,69,78,4,6,'dark');for(const y of [-38,38])box(support,66,2.2,38,[0,y,-1],'dark');
   const frame=clear('p_22710');frontFrame(frame,0,0,21.65,61,46,.6,2.5,'chrome');for(const y of [-26.1,26.1])box(frame,56,9.5,.6,[0,y,21.55],'black');for(const y of [-21.5,21.5])box(frame,56,1.1,.5,[0,y,22.03],'seal');for(const x of [-29,29])for(const y of [-21.5,21.5])cylinder(frame,1,.45,[x,y,22.05],'chrome','z');
   frame.userData.variantGeometry={model:id,kind:'rectangular-picture-frame',schematic:true};
   set('p_22710',{name:'A16矩形画幅框与遮光条',en:'A16 picture frame',number:'22712；309407 ×2 / 309408 ×2',pages:[7,12,13],description:'矩形画框22712，后期使用胶带固定的两条遮光条。三维只表达相对于方形画框的形态差异。',care:'遮光条在画框装到支架后安装；边缘位置与胶片平面需按原厂要求核对。',evidence:'S3 PDF13；S7 PDF109（10/97）。'+geometryBoundary});

   // The A16 insert is re-built, never a renamed A12 insert. All animation slots remain.
   for(const p of originalFilm){clear(p.id);p.pages=[27,28];p.description='后期机械A16片芯的'+p.name+'，据S3 PDF27–28分解关系作简化表示。';p.care='本轮只按总成取出/装回，不提供未经核对的片芯逐件施工顺序；尺寸、运动与配合需实物确认。';p.evidence='S3 PDF27–28；'+geometryBoundary;p.lube='本项没有独立核验的加油动作；胶片接触面保持干燥。';if(insertNumbers[p.id])p.number=insertNumbers[p.id];}
   set('insert',{name:'A16机械片芯（简化总成）',number:'309022（铬色）/ 309023（黑色）',pages:[27,28,29,30],description:'31EP12395起的新型A16机械片芯，已按A16零件身份及分解层次重建简化骨架。不是A12片芯换标签，也没有E/TCC电路板。',care:'端板和中间件配套；当前示意不验证片芯匹配、压片状态或逐件拆卸顺序。',evidence:'S3 PDF27–30；S7 PDF80、93。'+geometryBoundary});
   set('pressure',{name:'A16压片板与片簧',number:'309102 / 13913',pages:[27,28],description:'后期A16片芯压片板309102及片簧13913的矩形简化示意。',evidence:'S3 PDF28位置28–29；'+geometryBoundary});
   set('rollers',{pages:[27,28],evidence:'S3 PDF28位置3及14；两根13514滚轴与两枚12273轴颈。'+geometryBoundary});
   set('spools',{number:'胶卷卷轴为示意；片芯轴心308408',pages:[27,28],description:'供片/收片卷轴只是教学道具；后期A16片芯定位芯编号308408。',evidence:'S3 PDF28位置34；不从示意卷径推算张数。'});
   set('p_40305',{name:'A16片芯端板与外盖示意',number:'313322 / 22762',pages:[27,28,29,30],description:'端板313322与镀铬外盖22762以分层简化面呈现；其连接关系与旧片芯不同。'});
   set('p_22401',{name:'A16片芯中间支架',number:'309506'});set('p_22389',{name:'A16片芯内侧支承板',number:'313101'});
   set('p_22388',{name:'A16压片板',number:'309102'});set('p_13512',{name:'A16压片板片簧',number:'13913'});
   set('p_13060',{name:'A16机械片芯锁轴',number:'308103',description:'S3 PDF28位置40列308103，机械A16确实使用该号；不能因与电子型共号就认定它含电子器件。'});
   set('p_13784',{name:'A16片芯锁机构',number:'308101'});set('p_12268',{name:'A16锁机构毡环',number:'308410'});set('p_22282',{name:'A16卷轴定位芯',number:'308408'});
   set('p_13510',{name:'A16导片件308345',number:'308345'});set('p_13511',{name:'A16导片件309403',number:'309403'});
   side(groups.p_40305,-38.2,1.4,'chrome',[[4,-3,10.5]],3);side(groups.p_40305,-39,.35,'leather',[[4,-3,11.3]],4.8);
   for(const y of [-33,33]){box(groups.p_22401,62,2,25,[-1,y,-1],'silver');rod(groups.p_22401,[-32,y,11.5],[28,y,11.5],.65,'chrome');}
   side(groups.p_22401,28,1.4,'silver',[[0,0,8],[23,-11,7],[-23,-11,7]],6);
   side(groups.p_22389,31,1.1,'silver',[[0,0,9.5],[23,-11,5],[-23,-11,5]],7);
   for(const y of [-30,30])for(const z of [-12,11]){cylinder(groups.p_824033,.65,2.7,[32,y,z],'silver');screw(groups.p_824033,34,y,z);}
   flat(groups.p_22388,57,45,14.2);for(const x of [-23,23])for(const y of [-22.5,22.5])box(groups.p_22388,5,2,1,[x,y,14.6],'silver');
   for(const sign of [-1,1]){rod(groups.p_13512,[sign*23,-18,12],[sign*8,0,11.7],.35,'dark');rod(groups.p_13512,[sign*8,0,11.7],[sign*23,18,12],.35,'dark');}box(groups.p_13512,18,3,.3,[0,0,11.7],'dark');
   for(const y of [-30,30]){cylinder(groups.p_13514,2.4,58,[0,y,11.5],'chrome');cylinder(groups.p_12273,1.2,3.5,[-32,y,11.5],'silver');}
   for(const [partId,y]of[['p_13510',-23],['p_13511',23]]){lever(groups[partId],-34,[[y-5,-2],[y-5,7],[y+4,8],[y+5,1]],'silver',1);cylinder(groups[partId],2,2.5,[-32.5,y,3],'chrome');}
   const cord=groups.p_308522;for(const [a,b]of[[[-36,-34,-14],[-36,34,-14]],[[-36,34,-14],[-36,34,17]],[[-36,34,17],[-36,-34,17]],[[-36,-34,17],[-36,-34,-14]]])rod(cord,a,b,.4,'seal');
   lever(groups.p_22398,33.4,[[-28,6],[27,6],[29,13],[-28,13]],'silver',1);cylinder(groups.p_22398,3,3.5,[35,23,-10],'brass');
   rod(groups.p_13060,[-31,-30,-6],[30,-30,-6],.85,'chrome');rod(groups.p_13060,[30,-30,-6],[30,-24,-6],.85,'chrome');
   spring(groups.p_814952,[31,-25,-7],[31,-17,-7],.8,10);rod(groups.p_12540,[-30,-30,-7],[-26,-25,-7],.3);rod(groups.p_12540,[-26,-25,-7],[-23,-28,-7],.3);
   ring(groups.p_13784,-41.2,4,-3,10,3.3,1.5,'chrome');cylinder(groups.p_13784,3,7,[-37,4,-3],'silver');box(groups.p_13784,2,3.5,18,[-43,4,-3],'chrome');
   ring(groups.p_817140,-33.6,4,-3,3.3,2.8,.3,'dark');ring(groups.p_12268,-40,4,-3,10.2,7.4,.4,'seal');
   box(groups.p_22379,9,1,11,[-29,0,-8],'silver');box(groups.p_22379,1,9,11,[-33,4,-8],'silver');gear(groups.p_22375,-31.4,4,-3,5.8,20,1,'brass',3);
   rod(groups.p_22382,[-31,4,-3],[25,4,-3],.65);cylinder(groups.p_22382,4,.6,[-35,4,-3],'white');box(groups.p_22382,.15,4,6,[-35.4,2,-3],'red');spring(groups.p_816616,[-29,4,-3],[-27.5,4,-3],2.8,3);
   cylinder(groups.p_22282,3.3,1,[-33,23,-11],'chrome');cylinder(groups.p_22282,1.7,3.5,[-31,23,-11],'silver');
   cylinder(groups.p_40318,3.4,3.8,[-32,-23,-11],'silver');box(groups.p_40318,7,2,5,[-32,-25,-11],'silver');spring(groups.p_815608,[-31,-23,-11],[-19,-23,-11],1.05,12);
   box(groups.p_14261,.5,4.5,8,[-39.6,-26,8],'chrome');badge(groups.p_14261,'A16',6,3,[-39.91,-26,8],'-x','#b4bcbd','#222a2b');
   for(const p of originalFilm)groups[p.id].userData.variantGeometry={model:id,kind:'simplified-mechanical-insert',schematic:true};
  }else{
   // A12 and A24 share this specific later insert parts list, S3 PDF23–24.
   set('insert',{description:'采用S3 PDF23–24共同列出的A12/A24后期机械片芯；本页选择'+id+'。不混入旧片芯或电子片芯。'});
   if(id==='A24'){const g=clear('p_14261');box(g,.5,4.5,8,[-39.6,-26,8],'chrome');badge(g,'A24',6,3,[-39.91,-26,8],'-x','#b4bcbd','#222a2b');}
  }

  // Preserve any integration-added fastener actions; edit only the prose and references.
  for(const step of sequences.disassembly){for(const k of ['title','body','note'])step[k]=replaceText(step[k]);step.model=id;}
  const stepById=new Map(sequences.disassembly.map(s=>[s.id,s]));
  function step(sid,patch){const s=stepById.get(sid);if(!s)throw new Error('缺少拆卸步骤 '+sid);Object.assign(s,patch);}
  const insertPages=id==='A16'?[27,28,29,30]:[23,24];
  step('d01',{pages:[5,...insertPages],body:'确认无未拍完胶卷后，先抽出插刀，再取出完整'+id+'机械片芯。压片板、导片滚轴和卷轴座随片芯整体移出；本步不逐件拆散片芯。',note:profile.serial+'。片芯子件只作结构识别；完整逐件施工次序尚未核验。'});
  step('d06',{body:'先抽出后期轴308426，再取出'+id+'完整齿轮组'+cfg.drive+'。分层几何用于认件，不自动增加从总成拆弹簧的操作。',note:'后期轴/机构板改型见S7 PDF120；'+profile.serial});
  step('d14',{body:'将中央机构'+cfg.center+'从支架轴毂略抬并侧转，先取下间距齿轮'+cfg.spacing+'。',note:'顺序依据S3 PDF5；型号对应件号见PDF13。三维只表达先后层次，不证明实际取件路径。'});
  step('d15',{title:'取中央机构，再取释放臂'+cfg.release,body:'间距轮移开后，取出中央机构'+cfg.center+'，再取释放臂'+cfg.release+'。',note:id==='A16'?'22171偏心件在此仅供辨认；原拆卸正文没有单独取下它的动作，不自动转动调整。':'本型号中央机构与释放臂按S3 PDF13各自条目选用；不跨型号互换。'});
  if(id==='A16'){const focus=stepById.get('d15').focus;if(!focus.includes('p_22171'))focus.push('p_22171');}
  step('d22',{body:'确认对应版本的壳体紧固件已解除后，分离外壳与支架。'+id+'机械片芯在此流程保持总成；内部仅作独立结构观察。',pages:[6,...insertPages],note:'本路线完成侧机构、前外板与外壳拆卸。S3 PDF6的电路板拆焊段不用于普通机械'+id+'。'});
  sequences.boundary=profile.scope+'。'+profile.boundary+' '+profile.serial;
  if(id!=='A12')sequences.assembly=[];
  for(const guide of data.guide||[]){guide.body=replaceText(guide.body);if(id==='A16')guide.pages=[12,13,14,17,18,27,28,29,30];}
  if(data.guide?.length)data.guide[0]={title:'先确认后期机械版本',body:profile.scope+'。'+profile.serial+'。'+profile.boundary,pages:[12,13,14,17,18,...insertPages]};
  for(const p of [...data.parts,...detailParts]){p.model=id;p.sourcePages=[...p.pages];if(filmRoots.has(p.parent)&&id==='A16')p.evidence='S3 PDF'+p.pages.join('、')+'；'+geometryBoundary;}
  data.magazineModel=id;data.variantProfile=profile;
  return profile;
 }
 window.A12_VARIANTS={profiles,prepare};
})();
