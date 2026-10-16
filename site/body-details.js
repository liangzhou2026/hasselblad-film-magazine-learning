/* Ordinary A12 body and later mechanical spool-holder details.
 * Source: Film Magazines PDF 12-14, 17-18, 23-24. Contours are interpreted;
 * unmeasured thicknesses, holes and clearances are teaching approximations. */
(() => {
 'use strict';
 window.buildA12BodyDetails = function(ctx) {
  const {T,groups,materials,mesh,box,cylinder,gear,rod,spring,badge,frontFrame,sideOutline,resetGroup,detail}=ctx;
  const parts=[];
  const evidence='零件名称、编号及层次依据原厂分解图；没有标注的尺寸、孔距、厚度和弯折角度为教学示意，不用于加工或装配测量。';
  const noLube='本零件未在已核对的润滑图中获得独立加油指示；不要凭三维外观自行涂油。';
  const dry='胶片接触面与遮光材料保持清洁干燥，不涂润滑油脂。';
  function add(id,parent,name,en,number,anchor,spread,pages,description,care,lube=noLube) {
   parts.push({id,parent,name,en,number,section:['insert','pressure','rollers','spools'].includes(parent)?'film':'body',pages,description,care,evidence,lube});
   return detail(id,parent,anchor,spread);
  }
  function roundRect(x,y,w,h,r=1) {
   const s=new T.Shape();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
  }
  function hole(s,x,y,r){const p=new T.Path();p.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(p);}
  // Small edge breaks catch light like the rolled/chamfered metal in photos 43/45.
  // They preserve the original front/back planes; no dimensional accuracy is implied.
  function edgeGeometry(shape,depth,edge=.075){
   const b=Math.min(edge,depth*.2),geo=new T.ExtrudeGeometry(shape,{depth:depth-2*b,bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:32});
   geo.translate(0,0,b);return geo;
  }
  function extrudeSide(g,shape,depth,pos,mat='silver'){
   const soft=['leather','seal'].includes(mat),m=mesh(g,edgeGeometry(shape,depth,soft ? .035 : .075),mat,pos);m.rotation.y=Math.PI/2;return m;
  }
  function side(g,x,depth,mat,holes=[],inset=0){const s=sideOutline(inset);for(const [y,z,r]of holes)hole(s,-z,y,r);return extrudeSide(g,s,depth,[x,0,0],mat);}
  function plateZ(g,s,z,thick,mat='silver'){return mesh(g,edgeGeometry(s,thick,thick<.4 ? .025 : .075),mat,[0,0,z]);}
  function polyZ(g,points,z,thick,mat='silver',holes=[]) {const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();for(const h of holes)hole(s,...h);return plateZ(g,s,z,thick,mat);}
  function ringX(g,x,y,z,r,inner,t,mat='silver'){const s=new T.Shape();s.absarc(0,0,r,0,Math.PI*2,false);hole(s,0,0,inner);return extrudeSide(g,s,t,[x,y,z],mat);}
  function ringZ(g,x,y,z,r,inner,t,mat='silver'){const s=new T.Shape();s.absarc(x,y,r,0,Math.PI*2,false);hole(s,x,y,inner);return plateZ(g,s,z,t,mat);}
  function tube(g,pts,r=.24,mat='silver'){const p=pts.map(v=>new T.Vector3(...v));return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(p),Math.max(16,p.length*7),r,7,false),mat);}
  function leaf(g,points,width=.7,depth=.25,mat='silver') {for(let i=1;i<points.length;i++){const a=new T.Vector3(...points[i-1]),b=new T.Vector3(...points[i]),d=b.clone().sub(a);const m=box(g,width,d.length(),depth,a.add(b).multiplyScalar(.5).toArray(),mat);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}}
  function screw(g,x,y,z,axis='x',radius=1.2,direction=1,finish='chrome'){
   // One low circular floor plus a single split-head mesh gives a true recessed slot.
   // Keep two head meshes: magazine-fasteners reparents these plus the existing shank.
   const a=Math.asin(.19/radius),halves=[];
   for(const angle of [0,Math.PI]){const s=new T.Shape();s.absarc(0,0,radius,a+angle,Math.PI-a+angle,false);s.closePath();halves.push(s);}
   const p=[x,y,z],index=axis==='x'?0:2;p[index]-=direction*.12;
   cylinder(g,radius,.22,p,finish==='black'?'black':'silver',axis);
   const geo=edgeGeometry(halves,.32,.022),m=mesh(g,geo,finish,[x,y,z]);
   if(axis==='x')m.rotation.y=direction*Math.PI/2;else if(direction<0)m.rotation.y=Math.PI;
   return m;
  }
  function endScrew(g,x,y,z){cylinder(g,.82,1.7,[x,y,z],'silver');screw(g,x-.98,y,z,'x',1.6,-1);}
  function rivet(g,x,y,z){cylinder(g,1,.45,[x,y,z],'chrome','z');}

  resetGroup('frontplate');resetGroup('seal');resetGroup('pressure');resetGroup('rollers');resetGroup('insert');

  // User photo 58: rounded sheet corners and a closed, rounded wire handle.
  // Rebuild within the existing slide owner; its pose and removal path stay intact.
  resetGroup('darkslide');
  {
   const g=groups.darkslide;plateZ(g,roundRect(-34,-36.5,68,73,2.2),23.82,.36,'silver');
   const handleShape=roundRect(-43,-28.5,8,57,1.9),points=handleShape.getPoints(28).map(p=>new T.Vector3(p.x,p.y,24));
   if(points[0].distanceTo(points[points.length-1])<1e-8)points.pop();
   mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points,true),128,.68,8,true),'chrome');
   for(const y of [-27,27])rod(g,[-35,y,24],[-33.7,y,24],.68,'chrome');
  }

  // Refine the existing shell/cover meshes in place so their ownership, leather
  // detection, counts and animation paths remain unchanged in all shared variants.
  for(const id of ['shell','cover','support'])groups[id]?.traverse(o=>{
   const p=o.geometry?.parameters;if(!o.isMesh||o.geometry.type!=='ExtrudeGeometry'||!p?.shapes||o.userData.edgeRefined)return;
   const depth=p.options?.depth||1,edge=o.material===materials.leather ? .045 : .14;
   const old=o.geometry;o.geometry=edgeGeometry(p.shapes,depth,edge);o.userData.edgeRefined=true;old.dispose();
  });

  // Coupling plate: real aperture, stepped edge and nine separately selectable screws.
  {
   const g=add('p_40380','frontplate','外板 / 接合面','Outer plate','40380',[22,29,27],[0,0,4],[5,7,12,14],'连接机身的外板，围绕曝光窗口，并覆盖遮光与联锁零件。零件表对外板要求提供后背序列号；旧式编号为 13804。','检查接合面、上下卡接位置与板面变形。不要磨削接合面。');
   const s=roundRect(-38,-43,76,86,2.2);const aperture=roundRect(-28,-28,56,56,.8);s.holes.push(new T.Path(aperture.getPoints(32)));
   const screws=[[-34,-39],[0,-39],[34,-39],[-34,0],[34,0],[-34,39],[0,39],[34,39],[34,21]];
   for(const [x,y] of screws)hole(s,x,y,1.25);
   // Front coupling surfaces are black in the 30212 KEH and 30224 Coeln views;
   // the narrow exposed perimeter is metallic, not the entire plate face.
   plateZ(g,s,25.5,1.25,'black');frontFrame(g,0,0,27.03,59,59,.3,1.1,'dark');
   const lip=roundRect(-38,-43,76,86,2.2);lip.holes.push(new T.Path(roundRect(-37.72,-42.72,75.44,85.44,2).getPoints(40)));plateZ(g,lip,26.78,.14,'silver');
   for(const x of [-28,28]){box(g,10,2.1,3,[x,-40.5,28],'dark');box(g,8,2,3,[x,39.7,28],'dark');}
   for(const x of [-30,30])box(g,1.6,9,.3,[x,27,27],'dark');box(g,16,1.1,.6,[0,-42,27.2],'black');
   const f=add('p_823015','frontplate','外板固定螺钉 ×9','Outer plate screws','823015 ×9',[34,39,28],[0,0,13],[5,7,12,14],'外板使用九枚 823015 螺钉固定；编号与数量来自零件表位置 43。','拆下时按孔位存放。装回前检查联锁与遮光件位置，均匀紧固，勿把铜皮或密封边压出。');
   for(const [x,y]of screws){cylinder(f,.8,2.7,[x,y,26.2],'silver','z');screw(f,x,y,28,'z',1.2,1,'black');}
  }
  {
   const g=add('p_22710','support','A12 曝光画幅框','Picture frame A12','22710',[19,-26,21.5],[0,0,7],[7,12,13],'A12 专用方形画幅框。手册第 7 页规定框边与外板的距离为 3.55 ± 0.05 mm，并使用 V-4548 量规检查。','这个模型不提供尺寸量规功能；不要凭画面比例调整画幅框或胶片焦平面。');
   frontFrame(g,0,0,21.65,61,61,.6,2.5,'chrome');for(const x of [-29,29])for(const y of [-29,29])rivet(g,x,y,22.05);
  }

  // The light trap is two separate pieces, not one silver bar.
  {
   const g=add('p_13508','seal','遮光薄片 / 折叠套片','Foil','13508',[-34,13,24],[0,0,10],[5,7,12,13],'折叠薄片包住遮光件 13067，构成插刀口的遮光结构。英文 foil 不能单独证明材质为铝箔。','检查折痕、破损和位置；保留原折叠关系，不用普通胶带代替。',dry);
   // U-shaped folded channel, open towards the blade path.
   box(g,.18,73,3.5,[-35.5,0,23.55],'black');box(g,3.7,73,.14,[-33.65,0,21.82],'dark');box(g,3.7,73,.14,[-33.65,0,25.25],'dark');
   tube(g,[[-35.45,-36.5,22],[-35.65,-36.5,23.55],[-35.45,-36.5,25.1]],.15,'dark');
   const a=add('p_13067','seal','插刀口遮光件','Light trap','13067',[-33.9,-13,23.6],[-7,0,17],[5,7,12,13],'位于薄片 13508 内的长条遮光件；与插刀滑入路径接触。模型分开显示柔软遮光件和折叠薄片。','明显碎化、失去回弹或发黏时应按实物版本更换。不能用油脂恢复弹性。',dry);
   box(a,2.65,71.5,2.25,[-33.8,0,23.5],'seal');for(const y of [-35.5,35.5])box(a,2.3,.8,2,[-33.8,y,23.5],'seal');
  }

  // Slide interlocks: thin shaped plates, spring forms, pivots and a distinct lock arm.
  {
   const g=add('p_21535','support','曝光联锁片','Exposure lock','21535',[-29.5,15,23.4],[-12,0,18],[5,7,12,13],'随插刀状态动作的长条联锁片，和弹簧 13820、两枚板簧 13821 配合。','装回外板后，用插刀进出检查联锁动作。不要仅凭插刀顺滑判断联锁功能正常。');
   polyZ(g,[[-31.4,-34],[-28.5,-34],[-28.5,-27],[-26.4,-24],[-26.8,-21],[-29,-20],[-28,24],[-26.9,31],[-28.5,35],[-31,27]],22.25,.65,'silver',[[-29.3,8,1]]);
   rivet(g,-29.4,8,23.1);box(g,2.4,5,2.1,[-28.6,31,22],'silver');
   const sp=add('p_13820','support','曝光联锁线簧','Exposure lock spring','13820',[-27,-28,23],[-17,-2,25],[5,7,12,13],'U 形线簧，与曝光联锁片配合。弯折形状依分解图示意。','拆下前记录两脚朝向，防止丢失或反装；不要拉伸改变弹力。');
   tube(sp,[[-30,-33,23],[-29.8,-25,23],[-29,-23,23],[-27.8,-23,23],[-27,-25,23],[-26.5,-32,23]],.27);
   const ps=add('p_13821','support','曝光联锁板簧 ×2','Plate springs','13821 ×2',[-29,22,24],[-23,0,31],[5,7,12,13],'两枚小板簧用于曝光联锁片定位与弹性压持。模型用拱形薄板表现弹性接触。','按原位成对保存；勿压平、打磨或自行改变预紧。');
   for(const y of [-23,23]){leaf(ps,[[-30,y-2,23.8],[-29.2,y-1,24.25],[-29.2,y+1,24.25],[-30,y+2,23.8]],2.3,.18);}
   const lock=add('p_20843','support','后背锁定臂','Locking arm','20843',[31,13,23],[12,0,19],[5,7,12,14],'由按钮 22356 带动，配合弹簧 814752。插刀的状态参与后背锁定联锁。','安装后检查按钮回位及插刀联锁；先核对连结与接触位置，再判断是否缺润滑。','第 7 页要求在弹簧 814752 及锁定臂上表面涂脂；该页没有标出脂的型号。');
   polyZ(lock,[[29,-22],[33,-22],[33,30],[31.3,34],[29.5,34],[29.5,23],[28.3,20],[29,16]],22.7,.8,'silver',[[31,11,1.25],[31,-16,1]]);
   box(lock,3,3,3.4,[31,31,22],'silver');rivet(lock,31,11,23.9);
   const ls=add('p_20684','support','锁定薄片弹簧','Locking spring','20684',[34,4,23.5],[19,0,24],[5,7,12,14],'细长锁定弹簧，位于外板下方，与锁定机构配合。','原位拍照后拆卸，保留弯折和端部挂接方向。');
   polyZ(ls,[[33,-30],[33.8,-30],[33.8,23],[32.7,25],[32.7,29],[33.8,30],[35.1,29],[35.1,22],[34.4,20],[34.4,-30]],23.6,.23,'dark');
   const sr=add('p_814752','support','锁定臂回位拉簧','Locking-arm spring','814752',[29.5,25,21.2],[16,9,29],[5,7,12,14],'连接锁定臂的回位弹簧；拆卸时从锁定臂解钩。','核对两端挂钩位置；过度拉伸或挂错孔会影响回位。','第 7 页明确要求在这枚弹簧及锁定臂上表面涂脂，具体用量依实物接触面控制。');
   spring(sr,[29.5,19,21.4],[29.5,32,21.4],.62,13);tube(sr,[[29.5,19,21.4],[29.5,17.5,21.4],[31,17.5,21.4]],.21);tube(sr,[[29.5,32,21.4],[29.5,34,21.4],[31,35,21.4]],.21);
   const button=add('p_22356','support','后背释放按钮','Button','22356',[0,44.5,2],[0,16,0],[7,17,18],'后背外壳上的按钮，安装时穿入垫圈 810761，并与锁定臂连接。','检查按钮行程和释放后复位；按钮位置与连杆弯折在模型中为布置示意。');
   // PDF 17 item 8 and the A24 exterior photo show a round release button.
   // The stepped turned profile retains the original button centre and animation.
   // Photo 59 confirms concentric stepped rings around the black centre.
   const buttonProfile=[[0,0],[5.45,0],[5.7,.25],[5.7,.65],[4.9,.8],[4.9,2.15],[4.65,2.4],[4.45,2.4],[4.35,2.29],[4.24,2.4],[3.97,2.4],[3.87,2.29],[3.76,2.4],[3.47,2.4],[3.37,2.29],[3.26,2.4],[0,2.4]].map(([r,y])=>new T.Vector2(r,y));
   mesh(button,new T.LatheGeometry(buttonProfile,64),'chrome',[0,43.8,2]);
   cylinder(button,2.8,.15,[0,46.24,2],'black','y');
   rod(button,[0,42.8,2],[0,39.7,2],1.8,'silver');
   const washer=add('p_810761','support','按钮聚四氟乙烯垫圈','Teflon washer','810761',[0,42,2],[0,10,0],[7,17,18],'位于释放按钮轴上的 Teflon 垫圈，与锁定臂连接前套入。','防止遗失、夹折；不要用任意厚度垫片替换。');
   const wm=ringZ(washer,0,0,0,3.1,1.85,.25,'pale');wm.rotation.x=-Math.PI/2;wm.position.set(0,42.1,2);
  }
  {
   const g=add('p_823012_cover','cover','右侧盖固定螺钉 ×3','Right-cover screws','823012 ×3',[45,36,13],[9,0,0],[5,10,17,18],'普通 A12 右侧盖通过三枚螺钉固定。通常需要揭开相应蒙皮才能接近。','注意区分侧盖三枚螺钉与桥板两枚同编号螺钉。不要把揭蒙皮理解为常规清洁步骤。');
   for(const [y,z]of[[37,14],[-36,15],[-34,-16]]){cylinder(g,.7,3,[43,y,z],'silver');screw(g,45,y,z);}
  }

  // Later ordinary A12 insert: identified by the page-23/24 range, no circuit board.
  {
   const g=add('p_40305','insert','片芯镀铬端板','End plate, chrome','40305',[-38,20,-14],[-6,0,0],[23,24],'片芯锁柄一侧的端板。此处采用 RI 3250869 起的普通 A12 片芯零件表。','与壳体保持配对，清洁后核对编号；不要混用不同代际端板或调整垫片。');
   side(g,-38.2,1.5,'chrome',[[4,-3,10.8],[-23,-11,3.7],[23,-11,3.7]],1.3);
   const rim=sideOutline(1.4);rim.holes.push(new T.Path(sideOutline(3.2).getPoints(32)));extrudeSide(g,rim,1.4,[-39,0,0],'chrome');
   side(g,-39,.25,'leather',[[4,-3,12],[-23,-11,4.5],[23,-11,4.5]],3.7);
   for(const [y,z]of[[36,13],[-36,13],[34,-18],[-34,-18]])endScrew(g,-38.4,y,z);
   const frame=add('p_22401','insert','片芯中间支架与内端板','Intermediate part + end plate','22401',[-5,34,-3],[5,0,-8],[23,24],'连接端板、片芯两端支撑与导片机构的骨架。完整镀铬片芯编号为 40317。','框架影响片芯定位，不靠弯折支架修正片距或胶片平面。');
   for(const y of [-34.5,34.5]){box(frame,65,2.2,28,[-2,y,-1],'silver');box(frame,65,5.5,1.4,[-2,y,-14.5],'silver');}
   side(frame,29,1.7,'silver',[[23,-11,8.7],[-23,-11,8.7],[0,0,9]],5);
   for(const y of [-33,33])rod(frame,[-34,y,12.5],[29,y,12.5],.7,'chrome');
   const plate=add('p_22389','insert','片芯内侧支承板','Plate','22389',[29,26,-8],[16,0,0],[23,24],'片芯另一端的支承板，以四枚 824033 螺钉固定；支承滚轴、收片臂及锁轴。','松开前记录收片臂和弹簧位置；它与电子片芯的 312105 不是同一个编号。');
   const sh=sideOutline(6);hole(sh,0,0,10);hole(sh,11,23,5);hole(sh,11,-23,5);extrudeSide(plate,sh,1.15,[31,0,0],'silver');
   for(const y of [-30.5,30.5])for(const z of [-13.5,12.5])cylinder(plate,1.9,2,[31.8,y,z],'silver');
   const fs=add('p_824033','insert','片芯支承板螺钉 ×4','Plate screws','824033 ×4',[32,30.5,12.5],[23,0,0],[23,24],'固定片芯支承板的四枚螺钉。','按原孔位放置；装回压片板与板簧时，不应夹住或强压零件。');
   for(const y of [-30.5,30.5])for(const z of [-13.5,12.5]){cylinder(fs,.65,3,[32,y,z],'silver');screw(fs,34,y,z);}
  }
  {
   const g=add('p_22388','pressure','A12 压片板','Pressure plate','22388',[12,10,15],[-2,0,8],[23,24],'支承胶片背面的平整压片板，分解图位置 37。本版采用普通 A12 的 22388；电子片芯 308104 不混入。','用气吹清除颗粒，检查划痕与附着物；接触面保持平整。模型没有增加会误导为划片结构的密集凸条。',dry);
   const sh=roundRect(-29,-29.5,58,59,1.1);plateZ(g,sh,14.2,.8,'silver');
   for(const x of [-23,23])for(const y of [-29.8,29.8]){box(g,6,2.2,.65,[x,y,14.6],'silver');box(g,6,.65,2,[x,y,13.3],'silver');}
   const ps=add('p_13512','pressure','压片板弹性背簧','Plate spring','13512',[-8,4,12.2],[0,0,-6],[23,24],'位于压片板背面的宽片簧；原图为中央孔与四个弹性支臂。其作用与胶片接触面纹理不同。','原位保存方向与弯曲量，不压平片簧，不凭模型估算弹力。');
   const s=new T.Shape();s.moveTo(-24,-19);s.lineTo(-18,-8);s.lineTo(-7,-2.8);s.lineTo(-7,2.8);s.lineTo(-18,8);s.lineTo(-24,19);s.lineTo(-21,20);s.lineTo(-10,7);s.lineTo(10,7);s.lineTo(21,20);s.lineTo(24,19);s.lineTo(18,8);s.lineTo(7,2.8);s.lineTo(7,-2.8);s.lineTo(18,-8);s.lineTo(24,-19);s.lineTo(21,-20);s.lineTo(10,-7);s.lineTo(-10,-7);s.lineTo(-21,-20);s.closePath();hole(s,0,0,5.1);plateZ(ps,s,11.6,.35,'dark');
   for(const x of [-22.5,22.5])for(const y of [-19,19])box(ps,2.8,3,.65,[x,y,12.1],'silver');
  }
  {
   const g=add('p_13514','rollers','导片滚轴 ×2','Rollers','13514 ×2',[0,31.5,11.5],[-3,7,2],[23,24],'两根平滑滚轴支承胶片转向。端面、轴颈和圆柱工作面分层建模。','检查转动是否顺滑、是否有毛刺与固着颗粒。不要在胶片接触圆柱面加油。',dry);
   for(const y of [-31.5,31.5]){
    // A turned roller has a small end chamfer, while the film-contact cylinder stays smooth.
    const profile=[[0,-29.5],[2.31,-29.5],[2.48,-29.31],[2.5,-29.05],[2.5,29.05],[2.48,29.31],[2.31,29.5],[0,29.5]].map(([r,z])=>new T.Vector2(r,z));
    const roller=mesh(g,new T.LatheGeometry(profile,64),'chrome',[0,y,11.5]);roller.rotation.z=Math.PI/2;
    for(const x of [-30.2,30.2]){cylinder(g,1.45,2,[x,y,11.5],'silver');ringX(g,x-.15,y,11.5,2.45,1.5,.3,'silver');}
   }
   const j=add('p_12273','rollers','滚轴轴颈 ×2','Journals','12273 ×2',[-32,31.5,11.5],[-12,7,2],[23,24],'零件表列出两枚轴颈。模型放在滚轴端部，便于理解端部支承关系。','拆下后单独收纳；小轴颈丢失或反装会影响滚轴转动。');
   for(const y of [-31.5,31.5]){cylinder(j,1.1,4,[-33,y,11.5],'chrome');cylinder(j,2.8,.8,[-34.5,y,11.5],'silver');}
  }
  {
   const g=add('p_13510','insert','片芯导片件 13510','Film guide','13510',[-32,-25,10],[-12,-5,5],[23,24],'端板一侧的导片与片轴支承件，保留弧形承托和圆孔。','检查导片边缘污物与损伤；保持胶片通道干燥。',dry);
   const h=add('p_13511','insert','片芯导片件 13511','Film guide','13511',[-32,25,10],[-12,5,5],[23,24],'另一侧导片件。13510 与 13511 在零件表中分别列出，不互相混淆。','拆开前记录两件相对朝向。',dry);
   for(const [group,y] of [[g,-25],[h,25]]){const s=new T.Shape();s.moveTo(-10,-6);s.lineTo(7,-6);s.quadraticCurveTo(12,-6,12,0);s.quadraticCurveTo(12,7,5,7);s.lineTo(-10,7);s.closePath();hole(s,2,0,2.5);extrudeSide(group,s,1.2,[-34.8,y,4],'silver');cylinder(group,2.2,3,[-33,y,4],'chrome');}
   const cord=add('p_308522','insert','片芯周边密封绳','Sealing cord','308522',[-37,-35,-15],[-4,0,-4],[23,24],'嵌于端板周边的密封绳，区别于外板插刀口的遮光件。','检查松脱、压伤与接头，不用油脂浸润。',dry);
   const pts=sideOutline(3.7).getPoints(70).map(p=>[-36.6,p.y,-p.x]);tube(cord,pts,.44,'seal');
  }
  {
   const g=add('p_22398','insert','收片臂','Take-up arm','22398',[32,20,-10],[20,4,0],[23,24],'长条收片臂位于片芯内侧支承板之外，一端带片轴接合结构。','拆卸前记录它与弹簧及锁轴的相对位置；手册总则的片芯拆装顺序需要再用 p23 核对普通 A12 编号。');
   const s=new T.Shape();s.moveTo(6,-27);s.lineTo(15,-27);s.lineTo(15,26);s.quadraticCurveTo(15,31,10,31);s.quadraticCurveTo(4,31,4,26);s.lineTo(6,-20);s.closePath();hole(s,10,-23,2);hole(s,10,23,2.8);extrudeSide(g,s,1,[33.4,0,0],'silver');cylinder(g,3.1,4,[35,23,-10],'brass');gear(g,36,23,-10,3.8,12,.8,'silver');
   const shaft=add('p_13060','insert','片芯锁轴','Locking shaft','13060',[12,-32,-7],[0,-12,-2],[23,24],'穿过片芯的锁轴，带端部曲柄与弹簧连接。此普通 A12 编号为 13060。','不要误用电子片芯的 308103 编号。记录弯折端朝向与两端支承。');
   rod(shaft,[-32,-31.5,-6.5],[31,-31.5,-6.5],.8,'chrome');rod(shaft,[31,-31.5,-6.5],[31,-26.5,-6.5],.8,'chrome');rod(shaft,[-32,-31.5,-6.5],[-32,-31.5,-11],.8,'chrome');
   const rs=add('p_814952','insert','收片臂拉簧','Take-up spring','814952',[31,-23,-7],[15,-8,-5],[23,24],'收片臂与支架之间的拉簧。','拆卸前拍照标记两端挂点；不要自行多拉几圈改变回位力。');spring(rs,[32,-26,-7],[32,-17,-7],.8,10);
   const ws=add('p_12540','insert','锁轴线簧','Locking-shaft spring','12540',[-29,-28,-8],[-6,-15,-5],[23,24],'与锁轴配合的弯折线簧，形状参考分解图位置 45。','保留线簧形状，避免它被压片板或侧板夹住。');tube(ws,[[-31,-31,-7],[-29,-31,-7],[-29,-27,-7],[-27,-25,-7],[-25,-25,-7],[-24,-28,-7]],.29);
  }
  {
   const g=add('p_13784','insert','片芯锁柄与锁机构','Lock','13784',[-42,4,-3],[-15,0,0],[23,24],'端板外侧可转动的片芯锁机构，装入时与胶片余量指示机构配合。','锁紧应顺畅且定位可靠；不要以强扭锁柄补偿片芯未就位。');
   ringX(g,-41.2,4,-3,10.4,3.4,1.7,'chrome');cylinder(g,3.2,8,[-37,4,-3],'silver');box(g,2,3.3,19,[-43,4,-3],'chrome');for(const z of [-11.8,5.8])cylinder(g,1.6,2.2,[-43.2,4,z],'chrome');cylinder(g,6.3,.6,[-41.9,4,-3],'dark');
   const clip=add('p_817140','insert','片芯锁柄固定卡簧','Retaining clip','817140',[-34,4,-3],[-6,0,0],[23,24],'装在片芯锁机构轴上的卡簧。','用合适工具拆卸，防止弹飞；取下时同时收好邻近垫片。');
   const pts=[];for(let i=0;i<=25;i++){const a=.4+i/25*(Math.PI*2-.8);pts.push([-33.6,4+Math.sin(a)*3.3,-3+Math.cos(a)*3.3]);}tube(clip,pts,.28,'dark');
   const felt=add('p_12268','insert','锁柄毡环','Felt ring','12268',[-40,4,-3],[-11,0,0],[23,24],'位于锁柄轴周边的毡环。垫圈厚度有不同备件选项，不能根据模型选择。','检查完整性与污染；保持干燥。',dry);ringX(felt,-40,4,-3,10.5,7.6,.45,'seal');
   const bracket=add('p_22379','insert','余量指示机构支架','Bracket','22379',[-29,-1,-13],[-4,-4,-12],[23,24],'支承胶片余量指示齿轮与相关弹簧的折弯支架。','保持支架位置与形状；不要借弯折支架调整指示。');box(bracket,10,1.2,12,[-29,0,-8],'silver');box(bracket,1.2,10,12,[-33,4.2,-8],'silver');
   const cog=add('p_22375','insert','胶片余量指示齿轮','Film-indicator gear','22375',[-30,4,-3],[-6,0,-13],[23,24],'与余量指示轴配合的小齿轮。手册总则的指示校准需要规定量规；三维关系不能替代校准。','勿随意旋转改变指示相位；拆前记录原位，不能以红白变化代替量规校准。');gear(cog,-31.4,4,-3,6.1,20,1.1,'brass',3);
   const signal=add('p_22382','insert','胶片余量指示轴','Film signal','22382',[-20,4,-3],[-3,0,-20],[23,24],'贯穿片芯的余量指示轴及圆形红白指示部。区别于右侧机构上的曝光信号 13031。','应随过片由白逐渐转红，校准关系需按手册和对应量规检查。');rod(signal,[-31,4,-3],[26,4,-3],.62,'silver');cylinder(signal,4,.65,[-34.8,4,-3],'white');const sem=new T.Shape();sem.moveTo(0,0);sem.absarc(0,0,3.9,0,Math.PI,false);sem.closePath();extrudeSide(signal,sem,.1,[-35.3,4,-3],'red');
   const ts=add('p_816616','insert','余量指示扭簧','Film-indicator spring','816616',[-28,7,-6],[-7,0,-17],[23,24],'位于支架上的小扭簧，连接余量指示机构。','检查挂脚及原位，不凭模型增加预紧圈数。');
   const turn=[];for(let i=0;i<=85;i++){const a=i/85*Math.PI*6;turn.push([-29+i/85*1.5,4+Math.cos(a)*3,-3+Math.sin(a)*3]);}tube(ts,turn,.2);rod(ts,[-29,7,-3],[-29,12,-6],.2);rod(ts,[-27.5,7,-3],[-27.5,7,2],.2);
  }
  {
   const g=add('p_22282','insert','卷轴定位芯','Spool center','22282',[-33,23,-11],[-7,9,0],[23,24],'定位胶卷卷轴端部的片轴芯，分解图位置 35。','定位芯应顺畅伸缩或转动，不可带颗粒进入卷轴端部。');cylinder(g,3.5,1.2,[-33,23,-11],'chrome');cylinder(g,1.8,4,[-31,23,-11],'silver');
   const p=add('p_40318','insert','卷轴定位柱塞','Plunger','40318',[-33,-23,-11],[-7,-9,0],[23,24],'受弹簧作用的卷轴定位柱塞，原图位置 8。','检查是否卡滞以及弹簧和滚轮是否到位。');cylinder(p,3.5,4,[-32,-23,-11],'silver');box(p,8,2,6,[-32,-25,-11],'silver');
   const ps=add('p_815608','insert','定位柱塞压簧','Plunger spring','815608',[-25,-23,-11],[-1,-9,0],[23,24],'作用于定位柱塞的长压簧，原图位置 7。','防止弹簧遗失或受压歪斜，不拉伸恢复疲劳弹力。');spring(ps,[-31,-23,-11],[-18,-23,-11],1.1,13);
   const num=add('p_14261','insert','片芯编号牌','Number plate','14261',[-39,-26,8],[-8,-9,0],[23,24],'片芯编号牌用于和后背壳体配对；零件表要求提供序列号。模型显示示意标识，不编造实际编号。','核对壳体与片芯编号，多个后背清洁时分套存放。');box(num,.5,4.5,8,[-39.6,-26,8],'chrome');badge(num,'A12',6,3,[-39.91,-26,8],'-x','#b4bcbd','#222a2b');
  }
  return {parts};
 };
})();
