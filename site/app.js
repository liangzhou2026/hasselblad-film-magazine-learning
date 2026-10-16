/* A12 source-referenced teaching model. Geometry is schematic, not measured CAD. */
(() => {
 'use strict';
 const routedModel=(new URLSearchParams(location.search).get('model')||'A12').toUpperCase();
 if(!['A12','A16','A24'].includes(routedModel)&&window.MANUAL_MAGAZINES?.some(m=>m.id===routedModel)){
  return; // The additional models share index.html and use the free-view controller.
 }
 const $ = s => document.querySelector(s);
 const data = window.A12_DATA;
 const error = message => { $('#error-message').hidden=false; $('#error-message').textContent=message; $('#render-state').textContent='模型未加载'; };
 if (!window.THREE || !data) {error('未能载入模型文件。请保留 vendor、parts-data.js 与页面在同一文件夹中，再重新打开。');return;}
 const T=window.THREE, host=$('#canvas-host'), catalog=new Map(data.parts.map(p=>[p.id,p]));
 const state={selected:'center',explode:0,labels:true,lube:false,mode:'structure',theta:0.97,phi:1.16,distance:208,tab:'part'};
 const scene=new T.Scene();
 const camera=new T.PerspectiveCamera(36,1,.1,2500);
 let renderer;
 try {renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});} catch(e) {error('浏览器未能建立 WebGL 三维画面。请使用支持硬件加速的 Edge 或 Chrome；原图与中文资料仍可从文件夹查看。');return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 window.configureMagazineStage(T,scene,renderer);
 host.appendChild(renderer.domElement);
 const materials={
  chrome:new T.MeshStandardMaterial({color:0xbfc9cd,metalness:.8,roughness:.25}),
  silver:new T.MeshStandardMaterial({color:0xaebcc0,metalness:.68,roughness:.4}),
  dark:new T.MeshStandardMaterial({color:0x253034,metalness:.45,roughness:.5}),
  leather:new T.MeshStandardMaterial({color:0x242c2e,metalness:.06,roughness:.95}),
  brass:new T.MeshStandardMaterial({color:0xb9a26e,metalness:.68,roughness:.43}),
  pale:new T.MeshStandardMaterial({color:0xd4d8c8,metalness:.3,roughness:.53}),
  black:new T.MeshStandardMaterial({color:0x151d20,metalness:.2,roughness:.45}),
  red:new T.MeshStandardMaterial({color:0xb84236,roughness:.5}),
  white:new T.MeshStandardMaterial({color:0xf2f3e8,roughness:.5}),
  film:new T.MeshStandardMaterial({color:0x65584a,roughness:.78,metalness:.13}),
  seal:new T.MeshStandardMaterial({color:0x131c1c,roughness:1})
 };
 window.refineMagazineMaterials(T,materials);
 const groups={},pickables=[],labelObjects=[],lubeObjects=[];
 function group(id,spread,anchor){const g=new T.Group();g.userData={partId:id,spread:new T.Vector3(...spread),anchor:new T.Vector3(...anchor)};groups[id]=g;scene.add(g);return g;}
 function mesh(g,geom,mat,pos=[0,0,0]){const m=new T.Mesh(geom,materials[mat]||mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;g.add(m);pickables.push(m);return m;}
 function box(g,w,h,d,pos,mat='silver'){return mesh(g,new T.BoxGeometry(w,h,d),mat,pos);}
 function cylinder(g,r,len,pos,mat='silver',axis='x',r2=r){const m=mesh(g,new T.CylinderGeometry(r,r2,len,48),mat,pos);if(axis==='x')m.rotation.z=Math.PI/2;else if(axis==='z')m.rotation.x=Math.PI/2;return m;}
 function sphere(g,r,pos,mat){return mesh(g,new T.SphereGeometry(r,16,12),mat,pos);}
 function circleHole(shape,x,y,r){const h=new T.Path();h.absarc(x,y,r,0,Math.PI*2,true);shape.holes.push(h);}
 function extrudeSide(g,shape,depth,pos,mat='silver'){const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:18});const m=mesh(g,geo,mat,pos);m.rotation.y=Math.PI/2;return m;}
 function sideOutline(inset=0){const s=new T.Shape(),f=-22+inset,b=28-inset,v=44-inset,r=16-inset*.3;s.moveTo(f,-v);s.lineTo(b-r,-v);s.quadraticCurveTo(b,-v,b,-v+r);s.lineTo(b,v-r);s.quadraticCurveTo(b,v,b-r,v);s.lineTo(f,v);s.closePath();return s;}
 function side(g,x,depth,mat,holes=[],inset=0){const s=sideOutline(inset);holes.forEach(h=>circleHole(s,-h[1],h[0],h[2]));return extrudeSide(g,s,depth,[x,0,0],mat);}
 function frontFrame(g,x,y,z,w,h,thick,bar,mat){box(g,bar,h,thick,[x-(w-bar)/2,y,z],mat);box(g,bar,h,thick,[x+(w-bar)/2,y,z],mat);box(g,w-bar*2,bar,thick,[x,y+(h-bar)/2,z],mat);box(g,w-bar*2,bar,thick,[x,y-(h-bar)/2,z],mat);}
 function screw(g,x,y,z,axis='x'){cylinder(g,1.2,.6,[x,y,z],'dark',axis);if(axis==='x')box(g,.7,.33,1.65,[x+.35,y,z],'silver');else box(g,1.65,.32,.7,[x,y,z+.35],'silver');}
 function gear(g,x,y,z,r,teeth,thickness,mat='silver',holes=0){const s=new T.Shape();for(let i=0;i<teeth*4;i++){const a=i/(teeth*4)*Math.PI*2;const rr=r*(i%4===1||i%4===2?1:.87);const u=Math.cos(a)*rr,v=Math.sin(a)*rr;i?s.lineTo(u,v):s.moveTo(u,v);}s.closePath();circleHole(s,0,0,Math.max(1.25,r*.12));for(let i=0;i<holes;i++){const a=i/holes*Math.PI*2;circleHole(s,Math.cos(a)*r*.53,Math.sin(a)*r*.53,r*.19);}const m=extrudeSide(g,s,thickness,[x,y,z],mat);cylinder(g,Math.max(2,r*.16),thickness+1.2,[x+thickness/2,y,z],'dark');return m;}
 function rod(g,a,b,r,mat='silver'){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const m=mesh(g,new T.CylinderGeometry(r,r,d.length(),12),mat,av.clone().add(bv).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
 function spring(g,a,b,r=.95,turns=12){const av=new T.Vector3(...a),bv=new T.Vector3(...b),axis=bv.clone().sub(av).normalize();let normal=new T.Vector3(1,0,0);if(Math.abs(axis.dot(normal))>.9)normal.set(0,1,0);const u=axis.clone().cross(normal).normalize(),v=axis.clone().cross(u).normalize(),points=[];for(let i=0;i<=turns*16;i++){const t=i/(turns*16),ang=t*turns*Math.PI*2;points.push(av.clone().lerp(bv,t).addScaledVector(u,Math.cos(ang)*r).addScaledVector(v,Math.sin(ang)*r));}return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points),turns*14,.23,5,false),'silver');}
 function lever(g,x,points,mat='silver',thick=1.1){const s=new T.Shape();points.forEach(([y,z],i)=>i?s.lineTo(-z,y):s.moveTo(-z,y));s.closePath();return extrudeSide(g,s,thick,[x,0,0],mat);}
 function badge(g,text,w,h,pos,normal='z',bg='#263134',fg='#e6e7df'){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,256);ctx.fillStyle=fg;ctx.font='500 105px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,130);const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const m=mesh(g,new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tx,roughness:.8}),pos);if(normal==='x')m.rotation.y=Math.PI/2;else if(normal==='-x')m.rotation.y=-Math.PI/2;else if(normal==='-z')m.rotation.y=Math.PI;return m;}
 // Envelope: open front, rounded rear shell, separate side cover and insert end.
 {
  const g=group('shell',[0,9,-90],[0,16,-29]);
  const s=sideOutline();const inner=sideOutline(2.1);s.holes.push(new T.Path(inner.getPoints(32)));
  extrudeSide(g,s,70,[-35,0,0],'leather');
  for(const x of [-36,34])extrudeSide(g,s,2,[x,0,0],'chrome');
  box(g,36,26,1.4,[0,0,-28.5],'dark');frontFrame(g,0,0,-29.5,35,25,.8,1.4,'chrome');
  badge(g,'HASSELBLAD',28,6,[0,1,-30.2],'-z','#263134','#c2cbc8');
  box(g,18,3,6,[0,44,2],'chrome');box(g,12,1,4,[0,46,2],'dark');
 }
 {
  const g=group('support',[0,0,0],[34,32,17]);
  side(g,33,2,'dark',[[24,-2,6.2],[-23,-3,2.3],[2,0,2.8]],1.2);
  frontFrame(g,0,0,19.8,69,78,4,6,'dark');
  frontFrame(g,0,0,22,61,61,2,2,'chrome');
  for(const y of [-38,38]){box(g,66,2.2,38,[0,y,-1],'dark');box(g,64,1,2,[0,y,17],'chrome');}
  for(const [y,z] of [[36,17],[36,-13],[-36,17],[-36,-14],[0,16],[-4,-22]])screw(g,35.4,y,z);
 }
 {
  const g=group('frontplate',[0,0,49],[18,30,26]);frontFrame(g,0,0,26,76,86,2,10,'chrome');frontFrame(g,0,0,27.2,59,59,.5,1.1,'dark');
  for(const y of [-39,0,39])for(const x of [-33,33])screw(g,x,y,27.25,'z');
  for(const x of [-30,30]){box(g,9,2.5,5,[x,-40,28],'dark');box(g,7,2.5,5,[x,39,28],'dark');}
  box(g,5,8,2,[-30,28,27.2],'dark');
 }
 {
  const g=group('seal',[0,12,67],[-28,5,24]);box(g,2.5,72,1.8,[-33,0,23.8],'seal');box(g,.45,73,3,[-34.6,0,23.2],'silver');box(g,2.5,.8,3,[-33.2,-36,23.2],'silver');
 }
 {
  const g=group('darkslide',[-98,0,38],[-19,1,29]);box(g,68,73,.36,[0,0,24],'silver');
  rod(g,[-35,-32,24],[-42,-31,24],.9,'chrome');rod(g,[-42,-31,24],[-42,31,24],.9,'chrome');rod(g,[-42,31,24],[-35,32,24],.9,'chrome');
 }
 {
  const g=group('cover',[112,0,0],[43,9,-20]);side(g,43,1.8,'chrome',[[23,-2,11],[-26,13,2.8]],.2);side(g,44.85,.4,'leather',[[23,-2,12],[-26,13,3.8]],2.5);
  const rim=sideOutline(.2);rim.holes.push(new T.Path(sideOutline(2).getPoints(32)));extrudeSide(g,rim,7.8,[35.2,0,0],'chrome');
  // Counter and status windows are separate from the counter mechanism itself.
  cylinder(g,3.6,.5,[45.7,-26,13],'chrome');cylinder(g,2.7,.65,[46,-26,13],'black');badge(g,'1',3.5,3.5,[46.4,-26,13],'x');
  cylinder(g,2.2,.5,[46,-33,12],'chrome');cylinder(g,1.6,.6,[46.35,-33,12],'white');badge(g,'A12',9,3.5,[45.55,-3,9],'x');
 }
 {
  const g=group('crank',[128,5,0],[51,24,-2]);cylinder(g,10,3,[47,23,-2],'chrome');cylinder(g,8.8,1,[49,23,-2],'black');box(g,3,5,23,[51,23,-10],'dark');cylinder(g,3.1,5,[53,23,-21],'leather');screw(g,53.2,23,-2);
 }
 {
  const g=group('insert',[-85,0,-5],[-35,24,-12]);side(g,-38,1.9,'chrome',[],1.3);side(g,-38.45,.45,'leather',[],3);
  for(const y of [-34,34])box(g,65,2.6,38,[-1,y,-1],'silver');
  for(const y of [-27,27])cylinder(g,3,1.2,[-39.2,y,-1],'chrome');
  cylinder(g,11,2,[-39,4,-3],'dark');box(g,3,4,20,[-41,4,-3],'chrome');badge(g,'12',6,5,[-39.1,-25,8],'-x');
  rod(g,[-29,33,-6],[27,33,-6],.85);rod(g,[-29,-33,-6],[27,-33,-6],.85);
 }
 {
  const g=group('pressure',[-82,0,39],[0,0,15]);box(g,58,59,1.2,[0,0,14],'silver');
  for(let i=-13;i<=13;i++){box(g,.2,55,.12,[i*2,0,14.7],'chrome');}
  // Backing spring is schematic. No elastic force is simulated.
  box(g,44,4,.5,[0,0,12.4],'dark');box(g,4,42,.5,[0,0,12.3],'dark');
  for(const x of [-26,26])for(const y of [-26,26])screw(g,x,y,14.9,'z');
 }
 {
  const g=group('rollers',[-70,0,0],[-20,31,12]);
  for(const y of [-31.5,31.5]){cylinder(g,2.4,60,[0,y,11.5],'chrome');for(const x of [-31,31])cylinder(g,1.1,3,[x,y,11.5],'dark');}
 }
 {
  const g=group('spools',[-77,0,-24],[0,25,-9]);
  for(const y of [-23,23]){const roll=cylinder(g,7.4,58,[0,y,-11],'film');roll.userData.teachingFilm=true;cylinder(g,2.4,64,[0,y,-11],'black');for(const x of [-30,30]){cylinder(g,9,.8,[x,y,-11],'black');cylinder(g,3.5,1,[x,y,-11],'silver');}}
 }
 {
  const g=group('spacing',[66,-13,0],[40,-23,-3]);gear(g,35.5,-23,-3,17,58,1.6,'brass',5);cylinder(g,16.1,1.3,[39,-23,-3],'black');
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#182124';ctx.fillRect(0,0,512,512);ctx.translate(256,256);ctx.font='bold 42px Arial';ctx.fillStyle='#efeede';ctx.textAlign='center';ctx.textBaseline='middle';for(let i=0;i<=12;i++){const a=(i/13)*Math.PI*2-Math.PI/2;ctx.save();ctx.translate(Math.cos(a)*204,Math.sin(a)*204);ctx.rotate(a+Math.PI/2);ctx.fillText(String(i),0,0);ctx.restore();}const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const face=mesh(g,new T.CircleGeometry(15.8,80),new T.MeshStandardMaterial({map:texture,roughness:.7}),[39.8,-23,-3]);face.rotation.y=Math.PI/2;cylinder(g,8,1.6,[40,-23,-3],'black');screw(g,41,-23,-3);for(const d of [-1,1])screw(g,41,-23+d*5.8,-3+d*4.5);
 }
 {
  const g=group('center',[61,2,0],[41,0,1]);
  lever(g,36,[[-9,-10],[-8,9],[1,12],[10,4],[7,-8]],'silver',1.5);gear(g,38,0,0,8.7,24,1.8,'brass',4);gear(g,40,0,0,6.3,12,1.9,'silver');cylinder(g,3,5,[41,0,0],'dark');
  spring(g,[38,-8,11],[38,6,13],.95,12);spring(g,[38,0,-12],[38,12,-9],.85,10);
  for(const [y,z] of [[-7,-7],[6,5]])screw(g,38,y,z);
 }
 {
  const g=group('return',[37,17,-3],[38,24,-2]);gear(g,35.5,24,-2,10.7,25,1.3,'brass');cylinder(g,9.2,2.2,[37,24,-2],'dark');
  const pts=[];for(let i=0;i<=220;i++){const a=i/220*Math.PI*8,r=1.7+i/220*6.7;pts.push(new T.Vector3(38.4,24+Math.cos(a)*r,-2+Math.sin(a)*r));}mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts),220,.3,5,false),'silver');cylinder(g,1.8,4,[37.6,24,-2],'brass');
 }
 {
  const g=group('drive',[67,24,0],[43,24,-2]);gear(g,39.2,24,-2,10.1,34,1.6,'silver',5);gear(g,41.2,24,-2,8.8,28,1.8,'brass',5);cylinder(g,1.4,11,[44,24,-2],'silver');gear(g,36.5,33,13,6.5,18,1.5,'silver');
 }
 {
  const g=group('linkages',[28,-4,6],[36,-3,13]);
  lever(g,35.4,[[14,9],[19,8],[16,1],[7,2],[-7,8],[-8,12],[-3,15],[1,9]],'pale');
  lever(g,36,[[5,-12],[12,-14],[29,-16],[32,-13],[15,-11],[8,-8]],'silver');
  lever(g,36,[[-18,12],[-9,15],[2,16],[3,19],[-13,18],[-23,15]],'brass');
  spring(g,[36.5,13,16],[36.5,31,18],.95,13);spring(g,[36.5,-18,-19],[36.5,-30,-19],.65,10);
  for(const [y,z] of [[14,9],[31,-13],[-18,12],[-28,-19]])screw(g,37,y,z);
  box(g,1.5,12,2,[-30,28,22],'silver');spring(g,[-30,29,21],[-30,16,21],.6,10);
 }
 {
  const g=group('signal',[30,-22,12],[38,-37,14]);lever(g,36,[[-29,9],[-35,12],[-39,17],[-36,20],[-31,16],[-26,11]],'silver');box(g,1.6,5,3,[38,-35,16],'white');box(g,1.65,2.7,3,[38.1,-36.1,16],'red');
 }
 {
  const g=group('bridge',[90,6,0],[41,10,-9]);const s=new T.Shape();[[1,-15],[31,-15],[34,-10],[19,16],[4,15]].forEach(([y,z],i)=>i?s.lineTo(-z,y):s.moveTo(-z,y));s.closePath();for(const [y,z,r] of [[25,-6,4.5],[17,-6,4.6],[11,4,4],[6,-5,2.5]])circleHole(s,-z,y,r);extrudeSide(g,s,1.1,[41,0,0],'silver');for(const [y,z]of[[3,-12],[31,-11],[18,13]])screw(g,42.3,y,z);
 }
 // Replace the simplified assemblies with source-referenced, separately selectable parts.
 const detailParts=[];
 function removeMeshes(root){
  const discarded=new Set();root.traverse(o=>{if(o.isMesh){discarded.add(o);o.geometry?.dispose();}});
  for(let i=pickables.length-1;i>=0;i--)if(discarded.has(pickables[i]))pickables.splice(i,1);
 }
 function resetGroup(id){const g=groups[id];removeMeshes(g);g.clear();}
 function detail(id,parentId,anchor,spread){
  if(groups[id]||!groups[parentId])throw new Error('Invalid detail identity: '+id);
  const g=new T.Group();g.userData={partId:id,parentId,anchor:new T.Vector3(...anchor),spread:new T.Vector3(...spread)};
  groups[parentId].add(g);groups[id]=g;return g;
 }
 const factories={T,groups,materials,mesh,box,cylinder,gear,lever,rod,spring,screw,extrudeSide,badge,frontFrame,side,sideOutline,resetGroup,detail};
 try{
  if(!window.buildA12Details||!window.buildA12BodyDetails||!window.initA12Viewer||!window.A12_SEQUENCES)throw new Error('Detail files missing');
  detailParts.push(...window.buildA12Details(factories).parts,...window.buildA12BodyDetails(factories).parts);
  if(window.buildMagazineFasteners)detailParts.push(...window.buildMagazineFasteners(factories,window.A12_SEQUENCES));
  const requestedModel=new URLSearchParams(location.search).get('model')||'A12';
  const baseAssembly=JSON.parse(JSON.stringify(window.A12_SEQUENCES.assembly));
  const profile=window.A12_VARIANTS?.prepare(requestedModel,{factories,data,detailParts,sequences:window.A12_SEQUENCES});
  if(window.prepareA12AssemblyVariant)window.prepareA12AssemblyVariant(profile,window.A12_SEQUENCES,baseAssembly);
  if(profile&&data.guide?.length)data.guide[0].body=profile.scope+'。'+profile.serial+'。'+profile.boundary;
  // The button is now a named part; remove its two earlier shell placeholders.
  for(const o of [...groups.shell.children])if(o.isMesh&&o.position.x===0&&o.position.z===2&&[44,46].includes(o.position.y)){removeMeshes(o);groups.shell.remove(o);}
  // Authored part/animation coordinates stay local; correct the physical side
  // relation once above all assemblies, without reflecting the lights or floor.
  const orientationRoot=new T.Group();orientationRoot.name='rollfilm-orientation';scene.add(orientationRoot);
  for(const part of data.parts)orientationRoot.add(groups[part.id]);
  window.orientRollfilmRoot(T,orientationRoot,profile?.id||'A12');
  window.prepareMagazineSurfaces(T,scene);
  window.initA12Viewer({T,scene,camera,renderer,host,groups,pickables,materials,data,detailParts,profile});
 }catch(e){error('细化模型未能加载：'+e.message);console.error(e);}
})();
