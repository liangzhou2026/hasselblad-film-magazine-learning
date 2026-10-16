/* Detailed 70 / Polaroid components from the manual's separate part lists.
 * Common A-type components are cloned from the existing precision builder when
 * part numbers agree. Placement remains an interpreted teaching position. */
(function(global){
 'use strict';
 const special=['MAGAZINE70','POLAROID100','POLABASIC','POLAPLUS'];
 global.buildSpecialMagazineDetails=function(T,model,id){
  if(!special.includes(id))throw new Error('Unsupported special magazine '+id);
  const {root,parts}=model,classic=id==='POLAROID100',seventy=id==='MAGAZINE70';
  const pages=seventy?[47,48]:classic?[56,57]:id==='POLABASIC'?[58,59,60,61]:[58,59];
  const sharedPola=['Polaroid 100','PolaPlus','PolaBasic'];
  for(const p of parts){p.assembly=p.id;p.sharedWith=seventy?[]:sharedPola.slice();p.difference='';}
  const mat={steel:new T.MeshStandardMaterial({color:0xa4adb2,metalness:.72,roughness:.32}),dark:new T.MeshStandardMaterial({color:0x242a2d,metalness:.4,roughness:.6}),brass:new T.MeshStandardMaterial({color:0xb59b65,metalness:.7,roughness:.4}),seal:new T.MeshStandardMaterial({color:0x121b19,roughness:1})};
  global.refineMagazineMaterials?.(T,mat);
  function remove(id){const i=parts.findIndex(p=>p.id===id);if(i<0)return;const p=parts.splice(i,1)[0];root.remove(p.group);p.group.traverse(o=>o.geometry?.dispose());}
  function add(id,name,number,assembly,sourcePages,spread,description,sharedWith=[]){
   const group=new T.Group();group.name=id;group.userData.partId=id;root.add(group);
   const p={id,name,number,assembly,pages:sourcePages,spread,description:description||'编号与数量据原厂件表；孔位、厚度和接触关系为教学重建。',sharedWith,group};parts.push(p);return group;
  }
  function mesh(g,geo,m,pos,axis='z'){const o=new T.Mesh(geo,mat[m].clone());o.position.set(...pos);if(axis==='x')o.rotation.y=Math.PI/2;else if(axis==='y')o.rotation.x=-Math.PI/2;g.add(o);return o;}
  function plate(g,w,h,t,pos,m='steel',holes=[],axis='z'){
   const r=Math.min(.9,w/2,h/2),s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
   for(const [x,y,r]of holes){const p=new T.Path();p.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(p);}
   const edge=m==='seal'?0:Math.min(.12,t*.18,w*.08,h*.08),geo=new T.ExtrudeGeometry(s,{depth:t-edge*2,bevelEnabled:edge>0,bevelSize:edge,bevelThickness:edge,bevelSegments:2,curveSegments:6});geo.translate(0,0,edge);
   return mesh(g,geo,m,pos,axis);
  }
  function ring(g,r,bore,t,pos,m='steel',axis='z',gap=0){const s=new T.Shape();if(gap){s.absarc(0,0,r,gap,Math.PI*2-gap,false);s.lineTo(Math.cos(-gap)*bore,Math.sin(-gap)*bore);s.absarc(0,0,bore,Math.PI*2-gap,gap,true);s.closePath();}else{s.absarc(0,0,r,0,Math.PI*2,false);if(bore){const h=new T.Path();h.absarc(0,0,bore,0,Math.PI*2,true);s.holes.push(h);}}return mesh(g,new T.ExtrudeGeometry(s,{depth:t,bevelEnabled:false,curveSegments:20}),m,pos,axis);}
  function tube(g,points,r=.2,m='steel'){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(20,points.length*4),r,6,false),m,[0,0,0]);}
  function coil(g,pos,axis='x',r=1.2,len=7,turns=6){const pts=[];for(let i=0;i<=turns*14;i++){const a=i/(turns*14)*Math.PI*2*turns,v=[i/(turns*14)*len,r*Math.cos(a),r*Math.sin(a)];if(axis==='z')[v[0],v[2]]=[v[2],v[0]];pts.push(v.map((n,k)=>n+pos[k]));}tube(g,pts,.19);}
  function screw(g,pos,axis='z'){
   const v=[...pos],a=axis==='x'?0:2;v[a]-=3;ring(g,.72,0,3.3,v,'steel',axis);for(let j=0;j<5;j++){const b=[...v];b[a]+=j*.52;ring(g,.83,0,.12,b,'dark',axis);}ring(g,1.5,0,.28,pos,'steel',axis);
   // Two curved cap faces leave a real slot, instead of rectangular bars on a disc.
   const z=[...pos];z[a]+=.28;const r=1.38,halfSlot=.2,angle=Math.acos(halfSlot/r);
   for(const sign of [-1,1]){const s=new T.Shape(),start=sign>0?-angle:Math.PI-angle;s.absarc(0,0,r,start,start+angle*2,false);s.closePath();mesh(g,new T.ExtrudeGeometry(s,{depth:.24,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:1,curveSegments:8}),'steel',z,axis);}
  }
  function screws(number,count,assembly,sourcePages,positions,axis='z',shared=[]){for(let i=0;i<count;i++){const g=add('p_'+number+'_'+assembly+'_'+(i+1),'固定螺钉 '+(i+1)+' / '+count,number,assembly,sourcePages,axis==='x'?[60+i*2,0,0]:[0,0,65+i*2],'原厂件表列 '+count+' 枚 '+number+'；此处逐件展开用于清点，位置和松紧次序为示意。',shared);screw(g,positions[i],axis);}}
  function gear(g,r,t,pos,teeth=24,axis='x'){
   const s=new T.Shape();for(let i=0;i<teeth*6;i++){const a=i/(teeth*6)*Math.PI*2,rr=r*[.87,.9,.98,1,.98,.9][i%6];i?s.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):s.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}s.closePath();
   for(const [x,y,rr]of [[0,0,1.6],...[0,1,2].map(i=>[Math.cos(i*Math.PI*2/3)*r*.53,Math.sin(i*Math.PI*2/3)*r*.53,r*.17])]){const h=new T.Path();h.absarc(x,y,rr,0,Math.PI*2,true);s.holes.push(h);}mesh(g,new T.ExtrudeGeometry(s,{depth:t,bevelEnabled:false}), 'brass',pos,axis);
  }
  function common(number,id,assembly,delta,sourcePages,spread){
   const p=baseline?.parts.find(p=>p.id===id||p.number===number);if(!p)return false;
   const g=add('common_'+id,p.name,number,assembly,sourcePages,spread,'与 A 系列件号相同，直接复用现有精细几何；在70支架中的定位为原图关系示意。',['A12','A16','A24']);
   const copied=p.group.clone(true);copied.position.add(new T.Vector3(...delta));g.add(copied);return true;
  }
  let baseline=null;if(global.buildPrecisionBaseline)baseline=global.buildPrecisionBaseline(T,'A12');
  if(seventy){
   const core=[49,50,51],insert=[54,55];
   remove('light-trap');
   for(const [num,pid,a]of [['13067','p_13067','light-trap'],['13508','p_13508','light-trap'],['20843','p_20843','locking-arm'],['20684','p_20684','locking-arm'],['21535','p_21535','exposure-lock'],['13820','p_13820','exposure-lock'],['13821','p_13821','exposure-lock'],['814752','p_814752','locking-arm']]){
    if(!common(num,pid,a,[0,0,12],[47,48],[18,10,60]))throw new Error('Missing shared A-type component '+num);
   }
   // Separate the fixing screws from the front plate, using the sheet's count.
   const front=parts.find(p=>p.id==='outer-plate'),frontShape=new T.Shape();
   frontShape.moveTo(-41,-53);frontShape.lineTo(41,-53);frontShape.quadraticCurveTo(46,-53,46,-48);frontShape.lineTo(46,48);frontShape.quadraticCurveTo(46,53,41,53);frontShape.lineTo(-41,53);frontShape.quadraticCurveTo(-46,53,-46,48);frontShape.lineTo(-46,-48);frontShape.quadraticCurveTo(-46,-53,-41,-53);
   const opening=new T.Path();opening.moveTo(-29,-29);opening.lineTo(-29,29);opening.lineTo(29,29);opening.lineTo(29,-29);opening.closePath();frontShape.holes.push(opening);
   for(const [x,y]of [[-41,-48],[0,-48],[41,-48],[-41,-24],[41,-24],[-41,0],[41,0],[-41,24],[41,24],[-41,48],[-14,48],[14,48],[41,48]]){const hole=new T.Path();hole.absarc(x,y,1.05,0,Math.PI*2,true);frontShape.holes.push(hole);}
   front.group.clear();const frontGeometry=new T.ExtrudeGeometry(frontShape,{depth:1.5,bevelEnabled:true,bevelThickness:.15,bevelSize:.15,bevelSegments:2,curveSegments:8});frontGeometry.translate(0,0,.15);mesh(front.group,frontGeometry,'steel',[0,0,42]);
   screws('823015',13,'outer-plate',[47,48],[[ -41,-48,44],[0,-48,44],[41,-48,44],[-41,-24,44],[41,-24,44],[-41,0,44],[41,0,44],[-41,24,44],[41,24,44],[-41,48,44],[-14,48,44],[14,48,44],[41,48,44]]);
   const cover=parts.find(p=>p.id==='right-cover'),coverPlates=cover.group.children.slice(0,2);cover.group.clear();coverPlates.forEach(o=>cover.group.add(o));
   screws('823013',3,'right-cover',[52,53],[[56,-48,-35],[56,48,-35],[56,48,35]],'x');
   screws('820013',3,'shell',[52,53],[[-44,-49,-43],[0,-49,-43],[44,-49,-43]]);
   screws('823017',3,'shell',[52,53],[[-44,49,-43],[0,49,-43],[44,49,-43]]);
   // Individually identify the layered counter and its hardware.
   remove('counter');let g=add('p_13669','70 型计数轮','13669','counter',core,[55,26,22]);gear(g,14,2,[46,29,22]);
   g=add('p_13670','70 型数字盘','13670','counter',core,[77,26,22],'数字盘独立于下方计数轮，刻度位置和圈数不作为校准依据。');ring(g,12,2,.7,[49,29,22],'dark','x');for(let i=0;i<20;i++){const a=i*Math.PI/10;plate(g,.3,1.5,.15,[50,29+Math.sin(a)*10,22+Math.cos(a)*10],'steel',[],'x');}
   screws('821004',3,'counter',core,[[51,21,18],[51,35,18],[51,29,30]],'x');
   const layered=[['817119','计数轴卡簧',4,'counter'],['817115','机构轴卡簧',4,'counter'],['810506','计数机构垫圈',2,'counter'],['810903','计数轮垫圈',1,'counter'],['810927','摇柄传动上方垫圈',1,'top-gear']];
   for(const [n,name,count,a]of layered)for(let i=0;i<count;i++){g=add('p_'+n+'_'+i,name+' '+(i+1),n,a,core,[60+i*3,15-i*6,10]);ring(g,2.3,1.4,.35,[48+i*.55,29-i*5,22-i*8],'steel','x',n.startsWith('817')?.45:0);}
   for(const [n,name,a,pos,size]of [['13679','止动爪','counter',[48,18,15],[17,4]],['13671','计数止挡','counter',[47,8,19],[15,4]],['13673','计数机构臂','counter',[47,-1,8],[27,4]],['13666','计数凸轮','counter',[46,14,-4],[13,12]],['13675','感片凸轮板','film-feeler',[47,-16,17],[18,12]],['13678','信号止挡','film-feeler',[48,-9,25],[16,4]],['13681','传动凸轮盘','lower-gear',[48,-28,-21],[15,13]],['21458','回位联轴件','top-gear',[49,31,-21],[16,12]],['21432','回位止挡','top-gear',[47,23,-21],[17,5]],['13687','传动止件','top-gear',[49,15,-19],[18,4]]]){g=add('p_'+n,name,n,a,core,[71,pos[1]*.4,pos[2]*.4]);plate(g,size[0],size[1],.8,pos,'steel',[[0,0,1.2]],'x');}
   for(const [n,name,a,pos]of [['816708','止动爪扭簧','counter',[46,18,15]],['814307','回零杆拉簧','zero-lever',[46,3,11]],['814518','计数止件拉簧','counter',[46,8,19]],['814507','计数臂拉簧','counter',[46,-1,8]],['814309','凸轮回位簧','counter',[46,14,-4]],['814303','止件拉簧','film-feeler',[46,-9,25]],['816713','回位止挡簧','top-gear',[46,23,-21]]]){g=add('p_'+n,name,n,a,core,[82,pos[1]*.7,pos[2]*.7]);coil(g,pos,'x',1.1,6,5);}
   remove('guide-rollers');for(const [n,count,ys,len]of [['13661',2,[-36,36],73],['13660',1,[-42],70]])for(let i=0;i<count;i++){g=add('p_'+n+'_'+i,n==='13661'?'长滚筒 '+(i+1):'短滚筒',n,'guide-rollers',insert,[-52,ys[i]*.5,18]);const profile=[[1,0],[3.05,0],[3.4,.35],[3.4,len-.35],[3.05,len],[1,len],[1,0]].map(p=>new T.Vector2(...p));const roller=mesh(g,new T.LatheGeometry(profile,48),'steel',[-len/2,ys[i],n==='13661'?21:9]);roller.rotation.z=-Math.PI/2;}
   for(let i=0;i<2;i++){g=add('p_12273_'+i,'滚筒轴颈 '+(i+1),'12273','guide-rollers',insert,[-77,i?19:-19,20],'与普通A型同号的滚轴支承件。',['A12','A16','A24']);ring(g,2.8,1,.7,[-39,i?36:-36,21],'steel','x');ring(g,1.1,0,3,[-40,i?36:-36,21],'steel','x');}
   remove('pressure-springs');for(let i=0;i<2;i++){g=add('p_21388_'+i,'压片板簧 '+(i+1),'21388','pressure-plate',insert,[-55,i?15:-15,-110]);const x=i?25:-25,section=new T.Shape();section.moveTo(-30,23);section.quadraticCurveTo(0,13,30,23);section.lineTo(30,23.35);section.quadraticCurveTo(0,13.35,-30,23.35);section.closePath();const spring=new T.ExtrudeGeometry(section,{depth:5.5,bevelEnabled:false,curveSegments:12});spring.rotateX(Math.PI/2);spring.rotateZ(Math.PI/2);mesh(g,spring,'steel',[x-2.75,0,0]);}
   screws('824611',5,'insert-endplate',insert,[[-45,-42,-32],[-45,42,-32],[-45,-42,30],[-45,42,30],[-45,0,33]],'x');
   screws('823015',4,'pressure-plate',insert,[[-28,-30,26],[28,-30,26],[-28,30,26],[28,30,26]]);
   common('817140','p_817140','insert-lock',[-8,0,0],insert,[-108,0,0]);common('12268','p_12268','insert-lock',[-8,0,0],insert,[-120,0,0]);
   model.differences=['70 型独立长卷片芯、双暗盒及计数机构，不能沿用 A12 片距机构。','同件号13067/13508遮光件、20843/20684锁止件、21535/13820/13821曝光联锁件直接复用A型精细模型。','前板823015件表数量13，片芯另有4枚同号螺钉，按所属位置分别列出。','计数凸轮、止动爪、垫圈和卡簧已分件；弹簧预紧与相位未知，安装只展示关系及原图检查。'];
  }else{
   remove('glass-holders');const hp=classic?[[-18,-30],[38,-30],[-18,30],[38,30]]:[[10,-30],[10,30]],sp=classic?[[-25,0],[45,0]]:[[-25,-17],[-25,17],[45,-17],[45,17]];
   hp.forEach(([x,y],i)=>{const g=add('p_302429_'+i,'玻璃压持片 '+(i+1),'302429','glass-holders',pages,[i%2?12:-12,y*.2,78],classic?'100型件表列4件；Plus/Basic列2件。':'Plus/Basic件表列2件；100型列4件。',sharedPola);plate(g,14,3,1.1,[x,y,15],'steel',[[0,0,.8]]);});
   sp.forEach(([x,y],i)=>{
    const g=add('p_13821_'+i,'玻璃固定板簧 '+(i+1),'13821','glass-holders',pages,[x*.2,y*.2,89],'100型为2片，Plus/Basic为4片；直接复用A型同号板簧几何，在玻璃固定位置重新定位。',['A12','A16','A24',...sharedPola]);
    const source=baseline?.parts.find(p=>p.id==='p_13821');if(!source)throw new Error('Missing shared plate spring 13821');
    const leaf=new T.Group();source.group.children.slice(0,3).forEach(o=>leaf.add(o.clone(true)));const center=new T.Box3().setFromObject(leaf).getCenter(new T.Vector3());leaf.position.set(x-center.x,y-center.y,14-center.z);g.add(leaf);
   });
   remove('perimeter-fasteners');screws(classic?'823755':'829845',8,'inner-plate',pages,[[-58,-46,7],[0,-47,7],[59,-46,7],[-58,46,7],[0,47,7],[59,46,7],[-58,0,7],[59,0,7]]);
   const front=parts.find(p=>p.id==='outer-plate');
   // Existing front group: retain the four aperture bars and coupling tabs;
   // remove its illustrative screw meshes before creating numbered screws.
   const old=[...front.group.children];const first=old.slice(0,1),last=old.slice(-(classic?2:4));front.group.clear();first.concat(last).forEach(o=>front.group.add(o));
   const inner=parts.find(p=>p.id==='inner-plate'),oldInner=[...inner.group.children];inner.group.clear();[0,1,8].forEach(i=>inner.group.add(oldInner[i]));
   const outerPositions=[[-40,-46,21.5],[10,-47,21.5],[60,-46,21.5],[-40,46,21.5],[10,47,21.5],[60,46,21.5],[-40,0,21.5],...[...(classic?[]:[[60,0,21.5],[49,30,21.5]])]];
   screws(classic?'823620':'829525',classic?7:9,'outer-plate',pages,outerPositions);
   screws(classic?'823640':'829540',classic?3:1,'locking-arm',pages,classic?[[-29,39,14],[0,39,14],[28,39,14]]:[[-29,39,14]]);
   remove('light-trap');let g=add('p_14195','插刀光阱','14195','light-trap',pages,[-32,0,69],'本系列光阱编号不同于A型13067。',sharedPola);plate(g,4,84,2,[-34,0,17],'seal');
   g=add('p_302406','插刀遮光薄片','302406','light-trap',pages,[-45,0,77],'薄片与光阱配合，模型不推断材料厚度。',sharedPola);plate(g,6,84,.25,[-38,0,16],'dark');
   remove('locking-arm');g=add('p_302103','暗插锁止臂','302103','locking-arm',pages,[-18,45,32],'长臂、轴孔与挂簧位置均为示意。',sharedPola);plate(g,63,3,1.5,[0,39,10],'steel',[[-29,0,1.2]]);const hookedEnd=plate(g,5,3,1.5,[29,37.6,10],'steel');hookedEnd.rotation.z=-Math.PI/5;ring(g,2.2,1.2,.45,[-29,39,11.5]);
   g=add('p_814704','锁止臂拉簧','814704','locking-arm',pages,[-35,53,35],'单独收纳，未给出可据此实施的预紧量。',sharedPola);coil(g,[-32,42,10],'x',1.4,7,5);
   g=add('p_810528','锁止垫圈','810528','locking-arm',pages,[-25,48,47],'与锁臂相关的小垫圈；层次须对照所选型号原图。',sharedPola);ring(g,2.3,1.2,.35,[-29,39,13]);
   if(!classic){remove('detent');g=add('p_809120','插刀定位钢珠','809120','dark-slide-detent',pages,[-37,50,42],'Plus与Basic均列入共用机构。',['PolaPlus','PolaBasic']);mesh(g,new T.SphereGeometry(1.4,20,14),'steel',[-27,40,10]);g=add('p_815604','定位钢珠压簧','815604','dark-slide-detent',pages,[-48,52,44],'Plus与Basic共用；不得自行拉长增加定位力。',['PolaPlus','PolaBasic']);coil(g,[-22,40,10],'x',1.1,6,4);}
   for(const [n,name,pos,w,h]of [['302415','上侧遮光条',[10,48,17],91,2],['302417','下侧遮光条',[10,-48,17],91,2],['302416','侧向遮光条',[62,0,17],2,87],['302418','锁臂附近遮光条',[-32,40,9],6,16]]){g=add('p_'+n,name,n,'light-trap',pages,[pos[0]*.2,pos[1]*.2,57],'手册列出的独立密封条；截面和厚度不作为选材规格。',sharedPola);plate(g,w,h,.6,pos,'seal');}
   for(const p of parts){if(['outer-plate','dark-slide','rear-leather','slide-holder'].includes(p.id)){p.sharedWith=p.id==='rear-leather'&&!classic?['PolaPlus','PolaBasic']:[];p.difference=p.description;}}
   model.differences=[classic?'100型使用4个玻璃压持件及2片板簧；螺钉组合为823755×8、823620×7、823640×3。':'Plus/Basic使用2个玻璃压持件及4片板簧；螺钉组合为829845×8、829525×9、829540×1。','三型共享303323壳体、302427显影总成和302404玻璃等；仅按实际件号复用。',id==='POLAPLUS'?'PolaPlus使用带定位孔Z41126插刀。':id==='POLABASIC'?'PolaBasic使用Z41122插刀和注明Basic的302322外板，保留Plus共用定位钢珠与弹簧。':'100型保留异形303401蒙皮与独立302101插刀收纳架。','302427按原厂总成层级展示，未凭空拆成具有独立件号的压辊或设置显影间隙。'];
  }
  model.boundary='精细分件依原厂图与件表，共用件按身份复用。尺寸、孔位、齿形与运动为教学示意；所选型号的拆装步骤另标明原厂正文、分解图推导及人工检查依据。';
  root.userData.precision=true;root.updateMatrixWorld(true);return model;
 };
})(window);
