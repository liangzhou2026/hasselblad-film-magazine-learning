/* Later (Modified 1996) magazine shell / right-cover teaching fasteners.
 * Source identities and counts: Film Magazines PDF 5–7, 17–18.
 * Screw centres, leather patches and travel are estimated viewing geometry.
 * Existing cover leather and screws are reparented, never duplicated.
 */
(() => {
 'use strict';
 const coverIds=[1,2,3].map(n=>'p_823012_cover_'+n);
 const shellIds=[1,2,3].map(n=>'p_823013_shell_'+n).concat([1,2].map(n=>'p_823017_shell_'+n));
 const leatherIds=['p_cover_leather','p_shell_leather'];
 const cache=new WeakMap();
 const evidence='数量与零件号依据原厂 PDF 17–18 的 1996 改型外壳及右侧盖件表。孔位、厚度、螺纹和饰皮覆盖区域为教学估算；画面编号仅用于认件，不是原厂规定的逐颗拆卸次序。';
 const noLube='此处只展示紧固与覆盖关系，不增加螺钉润滑、扭矩或胶粘剂用量。';
 function addUnique(target,key,values){target[key]=[...new Set([...(target[key]||[]),...values])];}
 function extendSequences(sequences){
  if(!sequences?.disassembly||!sequences?.assembly)throw new Error('紧固件需要独立的拆卸及安装步骤。');
  for(const [type,id,field,values] of [
   ['disassembly','d02','remove',['p_cover_leather',...coverIds]],
   ['disassembly','d21','remove',['p_shell_leather',...shellIds]],
   ['assembly','a23','add',['p_cover_leather',...coverIds]],
   ['assembly','a01','add',['p_shell_leather',...shellIds]]
  ]){
   const step=sequences[type].find(item=>item.id===id);if(!step)throw new Error('紧固件缺少步骤：'+id);
   addUnique(step,field,values);
  }
 }
 window.buildMagazineFasteners=function(factories,sequences){
  const {T,groups,materials,detail,cylinder,mesh}=factories;
  if(!groups?.cover||!groups.shell||!groups.p_823012_cover)throw new Error('先构建后背外壳、右侧盖及原有三枚螺钉。');
  extendSequences(sequences);
  if(cache.has(groups))return cache.get(groups).slice();
  const parts=[];
  function add(id,parent,name,number,anchor,spread,description,extra={}){
   const metadata={id,parent,name,en:extra.en||'Teaching fastener detail',number,section:'body',pages:[5,6,7,17,18],description,care:'按对应版本及原孔位收存；本画面的顺序只用于教学清点，不作为孔位、尺寸或扭矩依据。',evidence,lube:noLube,...extra};
   parts.push(metadata);
   const g=detail(id,parent,anchor,spread);g.userData.fastenerEvidence=evidence;
   if(extra.fastener)g.userData.fastener={...extra.fastener};
   return g;
  }
  // Both parents are identity transforms during model construction, so add()
  // retains the original meshes' coordinates, surfaces and picking entries.
  const originalLeather=groups.cover.children.filter(o=>o.isMesh&&o.material===materials.leather);
  if(originalLeather.length!==1)throw new Error('右侧盖饰皮身份不唯一，停止重分组以避免重复表面。');
  const leather=add('p_cover_leather','cover','右侧盖饰皮（揭开示意）','308411',
   [45,6,0],[15,0,0],'原模型的侧盖饰皮改为独立组；对应改型件表位置 21 的 308411。先揭开才能接近三枚侧盖螺钉。平移只展示先后，不模拟粘胶剥离和弯折。',{pages:[5,10,17,18],en:'Right cover covering'});
  leather.add(originalLeather[0]);
  const coverPositions=[[37,14],[-36,15],[-34,-16]];
  for(const [index,[y,z]] of coverPositions.entries()){
   const meshes=groups.p_823012_cover.children.filter(o=>o.isMesh&&Math.abs(o.position.y-y)<1e-6&&Math.abs(o.position.z-z)<1e-6);
   if(meshes.length!==3)throw new Error('侧盖螺钉 '+(index+1)+' 应含螺杆、槽底及开槽螺钉头三片几何。');
   const g=add(coverIds[index],'p_823012_cover','侧盖螺钉 · 示意 '+(index+1),'823012',
    [45,y,z],[14+index*7,0,0],'原有三枚 823012 中的一枚，沿现有模型孔位单独标识，没有增加螺钉数量。',{pages:[5,10,17,18],en:'Right cover screw',fastener:{number:'823012',label:'侧盖 '+(index+1),index:index+1,axis:[1,0,0]}});
   for(const mesh of meshes)g.add(mesh);
  }
  const patch=add('p_shell_leather','shell','壳体螺钉处饰皮（局部揭开示意）','30312（局部示意）',
   [0,37,19],[0,0,24],'件表位置 3 为完整壳体饰皮 30312。五处小片仅表示需揭开的区域，不声称原厂饰皮实际分成五片；分离量与覆盖轮廓为估算。',{en:'Shell covering at fixing points'});
  // PDF 17 shows three fasteners on one end edge and two on the other.
  // Centres below only locate the teaching points on the existing body envelope.
  const shellPositions=[
   {id:shellIds[0],number:'823013',point:[-37.5,37,17.5],axis:-1,index:1},
   {id:shellIds[1],number:'823013',point:[-37.5,0,17.5],axis:-1,index:2},
   {id:shellIds[2],number:'823013',point:[-37.5,-37,17.5],axis:-1,index:3},
   {id:shellIds[3],number:'823017',point:[36.5,37,17.5],axis:1,index:4},
   {id:shellIds[4],number:'823017',point:[36.5,-37,17.5],axis:1,index:5}
  ];
  for(const item of shellPositions){
   const [x,y,z]=item.point;
   const g=add(item.id,'shell','壳体螺钉 · 示意 '+item.index,item.number,item.point,[item.axis*(18+item.index*3),0,0],
    '1996 改型壳体的 '+item.number+'；模型只表达 3 枚 823013 加 2 枚 823017 的件表配置。不得再叠加旧壳体的 820013。',{en:'Modified 1996 shell screw',fastener:{number:item.number,label:'壳体 '+item.index,index:item.index,axis:[item.axis,0,0]}});
   cylinder(g,.8,3,[x-item.axis*1.65,y,z],'silver','x');
   // Source photos show recessed straight slots, not raised contrasting strips.
   // A low head floor and two metal shoulders make the slot catch light naturally.
   cylinder(g,1.5,.14,[x-item.axis*.08,y,z],'silver','x');
   const halves=[],a=Math.asin(.19/1.5);
   for(const angle of [0,Math.PI]){const s=new T.Shape();s.absarc(0,0,1.5,a+angle,Math.PI-a+angle,false);s.closePath();halves.push(s);}
   const headGeo=new T.ExtrudeGeometry(halves,{depth:.28,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:3,curveSegments:28});
   const head=mesh(g,headGeo,'silver',[x,y,z]);head.rotation.y=item.axis*Math.PI/2;
   // Retain the five teaching patches and their owner; soften only their corners.
   const skin=new T.Shape(),w=6.1,h=6.8,r=.35;
   skin.moveTo(-w/2+r,-h/2);skin.lineTo(w/2-r,-h/2);skin.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);skin.lineTo(w/2,h/2-r);skin.quadraticCurveTo(w/2,h/2,w/2-r,h/2);skin.lineTo(-w/2+r,h/2);skin.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);skin.lineTo(-w/2,-h/2+r);skin.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);skin.closePath();
   const leatherGeo=new T.ExtrudeGeometry(skin,{depth:.20,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,curveSegments:10});
   leatherGeo.translate(0,0,-.10);const patchMesh=mesh(patch,leatherGeo,'leather',[x+item.axis*.65,y,z]);patchMesh.rotation.y=Math.PI/2;
  }
  cache.set(groups,parts);
  return parts.slice();
 };
 window.buildMagazineFasteners.ids={cover:[...coverIds],shell:[...shellIds],leather:[...leatherIds]};
})();
