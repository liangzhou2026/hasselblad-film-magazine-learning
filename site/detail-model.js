/* A12 mechanism study. Part identities follow PDF pp. 12–14.
 * Curves, thicknesses, tooth profiles and clearances are illustrative, not measured CAD.
 * No A16 eccentric or E/TCC electrical parts are included. */
(() => {
 'use strict';
 window.buildA12Details = function (ctx) {
  const {T,groups,materials,mesh,box,cylinder,rod,spring,extrudeSide,badge,resetGroup,detail}=ctx;
  const parts=[];
  for(const id of ['spacing','center','drive','return','linkages','signal','bridge'])resetGroup(id);
  const ordinaryLube='该零件没有独立的三维涂油指示。先核对手册图示，不能把所有金属接触面都当作润滑点。';
  const standardEvidence='编号和零件关系据原厂分解图及零件表；曲线、孔径、厚度和齿形据图形重建，未经实物测量。可用于认件学习，不是加工或装配校准模型。';
  function part(id,parent,name,en,number,anchor,spread,description,care,pages=[12,13,14],lube=ordinaryLube,evidence=standardEvidence){
   parts.push({id,parent,name,en,number,section:'mechanism',pages,description,care,evidence,lube});
   return detail(id,parent,anchor,spread);
  }
  function hole(s,y,z,r){const h=new T.Path();h.absarc(-z,y,r,0,Math.PI*2,true);s.holes.push(h);}
  function diskShape(outer,inner=0){const s=new T.Shape();s.absarc(0,0,outer,0,Math.PI*2,false);if(inner)hole(s,0,0,inner);return s;}
  function metalEdge(g,shape,depth,pos,mat='silver',edge=.06,segments=24){
   const b=Math.min(edge,depth*.18),geo=new T.ExtrudeGeometry(shape,{depth:depth-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:segments});
   geo.translate(0,0,b);const m=mesh(g,geo,mat,pos);m.rotation.y=Math.PI/2;return m;
  }
  function ring(g,x,y,z,outer,inner,depth,mat='silver') {
   // A small mouth chamfer gives the bored hub/washer an actual rim instead of
   // adding a decorative ring. Keep the original bore, depth and position datum.
   return metalEdge(g,diskShape(outer,inner),depth,[x,y,z],mat,Math.min(.065,(outer-inner)*.12),outer>6?28:outer>3?20:12);
  }
  function curvedPlate(g,x,commands,depth,mat='silver',holes=[]){
   const s=new T.Shape();
   for(const c of commands){if(c[0]==='M')s.moveTo(-c[2],c[1]);if(c[0]==='L')s.lineTo(-c[2],c[1]);if(c[0]==='Q')s.quadraticCurveTo(-c[2],c[1],-c[4],c[3]);if(c[0]==='C')s.bezierCurveTo(-c[2],c[1],-c[4],c[3],-c[6],c[5]);}
   s.closePath();for(const h of holes)hole(s,...h);return metalEdge(g,s,depth,[x,0,0],mat,.055);
  }
  function wheel(g,x,y,z,r,teeth,depth,mat='brass',openings=0,bore=1.4){
   const s=new T.Shape();
   // The photographs show shallow root fillets and rounded tooth shoulders.
   // Preserve the existing illustrative tooth counts; this is not an involute fit.
   const point=(n,f,rr)=>{const a=(n+f)*Math.PI*2/teeth;return [Math.cos(a)*rr*r,Math.sin(a)*rr*r];};
   for(let n=0;n<teeth;n++){
    const start=point(n,0,.875);n?s.lineTo(...start):s.moveTo(...start);
    s.quadraticCurveTo(...point(n,.12,.875),...point(n,.18,.9));
    s.lineTo(...point(n,.32,.985));
    s.quadraticCurveTo(...point(n,.37,1),...point(n,.43,1));
    s.lineTo(...point(n,.57,1));
    s.quadraticCurveTo(...point(n,.63,1),...point(n,.68,.985));
    s.lineTo(...point(n,.82,.9));
    s.quadraticCurveTo(...point(n,.88,.875),...point(n,1,.875));
   }
   s.closePath();
   // Sample circular bores separately so economical tooth curves cannot make
   // the drilled openings polygonal when inspected close up.
   const wheelHole=(y0,z0,rad)=>{const h=new T.Path();for(let i=0;i<48;i++){const a=-i/48*Math.PI*2,u=-z0+Math.cos(a)*rad,v=y0+Math.sin(a)*rad;i?h.lineTo(u,v):h.moveTo(u,v);}h.closePath();s.holes.push(h);};
   wheelHole(0,0,bore);
   for(let n=0;n<openings;n++){const a=n/openings*Math.PI*2;wheelHole(Math.sin(a)*r*.57,-Math.cos(a)*r*.57,r*.16);}
   return metalEdge(g,s,depth,[x,y,z],mat,.045,3);
  }
  function clip(g,x,y,z,r=2.2,thick=.45){
   const s=new T.Shape(),a=.45,inner=r*.62;
   s.absarc(0,0,r,a,Math.PI*2-a,false);s.lineTo(Math.cos(-a)*inner,Math.sin(-a)*inner);
   s.absarc(0,0,inner,Math.PI*2-a,a,true);s.closePath();
   extrudeSide(g,s,thick,[x,y,z],'dark');
   for(const k of [-1,1])ring(g,x,y+k*.83,z-r*.83,.52,.2,thick,'dark');
  }
  function screwDetail(g,x,y,z,r=1.35,length=2.3){
   cylinder(g,.69,length,[x-length*.5,y,z],'silver');
   // Low thread rings communicate a threaded shank without pretending to specify its pitch.
   for(let t=.35;t<length-.2;t+=.48)ring(g,x-t,y,z,.79,.55,.13,'silver');
   ring(g,x,y,z,r,0,.2,'silver');
   // Two circular segments above the head base leave a physical screwdriver slot.
   const gap=.22,a=Math.asin(gap/r);
   for(const flip of [0,Math.PI]){
    const s=new T.Shape();s.absarc(0,0,r,a,Math.PI-a,false);s.closePath();
    const m=metalEdge(g,s,.43,[x+.2,y,z],'chrome',.035);m.rotateZ(flip);
   }
  }
  function bentWire(g,points,r=.24,mat='silver'){
   return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(24,points.length*6),r,7,false),mat);
  }
  function torsion(g,x,y,z,r=1.6,turns=3,depth=2,ends=true){
   spring(g,[x,y,z],[x+depth,y,z],r,turns);
   if(ends){rod(g,[x,y+r,z],[x,y+r,z+3.5],.21);rod(g,[x+depth,y+r,z],[x+depth,y+r+3,z],.21);}
  }
  function flatSpiral(g,x,y,z,inner,outer,turns,width,thickness=.18){
   const steps=Math.ceil(turns*110),pos=[],indices=[];
   for(let i=0;i<=steps;i++){
    const a=i/steps*Math.PI*2*turns,r=inner+(outer-inner)*i/steps;
    for(const [dx,dr] of [[0,-thickness/2],[width,-thickness/2],[width,thickness/2],[0,thickness/2]])pos.push(x+dx,y+Math.sin(a)*(r+dr),z+Math.cos(a)*(r+dr));
    if(i<steps)for(let j=0;j<4;j++){const k=i*4+j,next=i*4+(j+1)%4;indices.push(k,k+4,next,next,k+4,next+4);}
   }
   indices.push(0,1,2,0,2,3,steps*4,steps*4+2,steps*4+1,steps*4,steps*4+3,steps*4+2);
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(indices);geo.computeVertexNormals();
   return mesh(g,geo,'silver');
  }
  function faceNumbers(g,x,y,z,r){
   const c=document.createElement('canvas');c.width=c.height=1024;const p=c.getContext('2d');p.clearRect(0,0,1024,1024);p.translate(512,512);
   p.fillStyle='#172025';p.beginPath();p.arc(0,0,498,0,Math.PI*2);p.fill();
   p.strokeStyle='#9da9a8';p.lineWidth=3;for(const rad of [482,265]){p.beginPath();p.arc(0,0,rad,0,Math.PI*2);p.stroke();}
   p.fillStyle='#e9eadf';p.font='600 72px Arial';p.textAlign='center';p.textBaseline='middle';
   for(let i=0;i<=12;i++){const a=i/13*Math.PI*2-Math.PI/2;p.save();p.translate(Math.cos(a)*399,Math.sin(a)*399);p.rotate(a+Math.PI/2);p.fillText(String(i),0,0);p.restore();}
   p.font='20px Arial';p.fillStyle='#8f9b99';p.fillText('A12',0,-200);
   const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;
   const geo=new T.RingGeometry(2.3,r,100);const m=mesh(g,geo,new T.MeshStandardMaterial({map:tx,roughness:.48,metalness:.32}),[x,y,z]);m.rotation.y=Math.PI/2;
   // RingGeometry's radial UVs are replaced by planar UVs to keep the dial numerals undistorted.
   const uv=geo.attributes.uv,position=geo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,position.getX(i)/(r*2)+.5,position.getY(i)/(r*2)+.5);uv.needsUpdate=true;
  }

  // Counter: separate spacing wheel, return spring, numbered dial and three screws.
  {
   const g=part('p_22371','spacing','A12 计数间距齿轮','Spacing gear','22371', [36,-23,-3],[2,-2,-2],
    'A12 专用计数间距齿轮；上方装计数盘 13806。开孔轮盘与中心凸台分层呈现，便于辨认盘下机构。',
    '检查回零与自动停片关系。不要把 A16／A24 的间距轮换算成 A12；三维齿数没有作为原厂参数。',[5,8,9,12,13],
    '弹簧 816611 装在此机构；手册要求转动约 1½ 圈预紧，再检验回零。转向须按手册观察方向，不能凭当前三维视角判断。');
   wheel(g,35.35,-23,-3,16.8,65,1.25,'brass',5,2.3);
   ring(g,36.65,-23,-3,5.3,2.3,.75,'silver');
   for(let i=0;i<3;i++){const a=i*Math.PI*2/3;ring(g,37.2,-23+Math.cos(a)*5.8,-3+Math.sin(a)*5.8,1.5,.67,1.1,'silver');}
   // A stepped cam below the dial represents the stop recesses named in the manual.
   for(let i=0;i<3;i++){const a=i*Math.PI*2/3;curvedPlate(g,36.65,[['M',-23+Math.cos(a)*7,-3+Math.sin(a)*7],['L',-23+Math.cos(a+.6)*10,-3+Math.sin(a+.6)*10],['Q',-23+Math.cos(a+1)*11,-3+Math.sin(a+1)*11,-23+Math.cos(a+1.3)*7,-3+Math.sin(a+1.3)*7]],.65,'silver');}
  }
  {
   const g=part('p_816611','spacing','计数回零弹簧','Spring','816611',[37.6,-23,-3],[19,-2,-8],
    '位于计数盘下方的回零弹簧，拆下计数盘后可见；与上方过片回位发条 14184 是不同零件。',
    '拆卸前控制弹簧释放。装配需按 PDF 第 8 页预紧约 1½ 圈并检查计数能回零。',[5,8,12,13]);
   torsion(g,36.9,-23,-3,1.8,5,2.4);rod(g,[39.3,-21.2,-3],[39.3,-18,-5],.23);
  }
  {
   const g=part('p_13806','spacing','A12 计数盘（0—12）','Dial','13806',[39.7,-23,-3],[32,-3,1],
    '黑底数字盘分出 0—12；通过三枚 824202 螺钉连接计数间距齿轮。盘的凹口参与自动停片校准。',
    '调整时先保留能微调的松紧，确认释放臂入槽与止挡入盘槽同时发生后，按手册锁紧及封漆。',[5,8,9,12,13]);
   ring(g,39.1,-23,-3,15.9,2.3,.38,'black');faceNumbers(g,39.5,-23,-3,15.7);
   ring(g,39.52,-23,-3,7.8,2.3,.28,'black');ring(g,39.84,-23,-3,2.65,1.9,.22,'chrome');
  }
  {
   const g=part('p_824202','spacing','计数盘固定螺钉 ×3','Screw, 3 pcs','824202 ×3',[40.2,-17.2,-3],[48,-3,4],
    '原厂表列三枚，均独立绘出槽口螺钉头与短螺杆；同一名称控制这三枚。',
    '用于计数盘位置调整，手册先要求勿拧得过紧，完成自动停片调整后再固定。',[5,8,9,12,13]);
   for(let i=0;i<3;i++){const a=i*Math.PI*2/3;screwDetail(g,39.96,-23+Math.cos(a)*5.8,-3+Math.sin(a)*5.8,1.28,2.6);}
  }

  // Centre assembly and its removable top washer.
  {
   const g=part('p_21548','center','中心机构总成','Center mechanism','21548',[39,0,0],[0,0,0],
    '分解图项目 21：带异形底板、分层齿轮、轴套及附属弹簧的中心机构。模型保留总成识别，不为总成内未列号的小件编造编号。',
    '拆卸要先从支架轴套抬起、略向侧方转动，再取下间距齿轮 22371 和中心机构，不能强行向上拔。',[5,8,12,13],
    '第 8 页明确要求用少量油润滑中心机构的齿轮与轴；图 4 指定的脂点另行对应，不等于把整个总成涂脂。');
   curvedPlate(g,35.8,[['M',-10,-8],['L',-9,6],['Q',-8,11,-3,11],['L',8,7],['Q',11,5,9,1],['L',6,-9],['Q',2,-12,-3,-10]],1.1,'silver',[[-6,6,1.1],[6,5,1.1],[0,0,2.7],[-6,-6,1.2]]);
   wheel(g,36.9,0,0,8.6,29,1.0,'brass',4,2.2);wheel(g,38.15,0,0,5.7,12,1.6,'silver',0,2.2);
   ring(g,39.8,0,0,3.15,2.1,.55,'chrome');ring(g,35.1,0,0,2.7,1.7,5.8,'dark');
   screwDetail(g,37.1,-6,6,1.1,1.9);screwDetail(g,37.1,6,5,1.05,1.9);
   rod(g,[37.6,-8,-7],[37.6,-8,-4],.55,'dark');rod(g,[37.6,7,6],[37.6,9,8],.55,'dark');
  }
  {
   const g=part('p_810926','center','中心机构垫圈','Washer','810926',[41.1,0,0],[29,1,0],
    '套在中心机构 21548 上、位于机构板下的垫圈；三维使用贯通孔区分垫圈与实心垫片。','拆卸保存原装层次与方向，勿与机构板上方 810927 垫圈混放。',[5,9,12,13]);
   ring(g,40.9,0,0,3.8,2.18,.35,'silver');
  }
  {
   const g=part('p_814852','center','中心机构连接拉簧','Spring','814852',[37.5,-6,-10],[18,-10,-13],
    '连接中心机构与连杆 21494 的拉簧。模型把密绕弹簧与两端挂钩分开表现。','按第 5 页顺序先从连杆解钩；装配时核对弹簧连接点，勿拉长弹簧。',[5,8,12,13]);
   spring(g,[37.5,-8,-8],[37.5,5,-11],.68,15);
   bentWire(g,[[37.5,-8,-8],[37.5,-10,-7],[37.5,-9.4,-5.8],[37.5,-8.6,-6.2]],.2);
   bentWire(g,[[37.5,5,-11],[37.5,7,-12],[37.5,7.8,-10.8],[37.5,7,-10.1]],.2);
  }
  {
   const g=part('p_814803','center','中心机构附属拉簧','Spring','814803',[37.7,-3,9],[17,-11,14],
    '原厂分解图项目 14，列为中心机构附近的另一根拉簧。零件形态按图示重建，未模拟弹性或受力。','装配文字要求中心机构的两根弹簧分别接到 824060 螺钉及 21494 连杆，实际挂点须对照原图。',[8,12,13]);
   spring(g,[37.7,-7,7],[37.7,4,13],.65,13);bentWire(g,[[37.7,4,13],[37.7,6,14],[37.7,6.8,13.2],[37.7,6,12.4]],.2);
  }

  // Return barrel: hollow housing, flat ribbon spring and a separate bored hub.
  {
   const g=part('p_13030','return','回位发条齿轮壳','Spring housing','13030',[35.9,24,-2],[0,0,0],
    '带齿的空心发条壳；14184 扁带发条置于壳内，14185 轴套穿过中央。壳底与环形壳壁均可观察。','手册要求装配时顺时针转动约 1½ 圈预紧；此为手册方向说明，模型不会模拟真实预紧或止挡。',[5,8,9,12,14],
    '第 8 页图 6 为 L32 脂点；实际润滑对象与位置对照发条图。');
   wheel(g,35.15,24,-2,10.8,25,.9,'brass',0,2.5);
   ring(g,36.1,24,-2,9.35,8.7,2.3,'dark');ring(g,38.2,24,-2,9.4,8.6,.25,'chrome');
   box(g,1.4,1.1,1.0,[37,32.6,-2],'dark');
  }
  {
   const g=part('p_14184','return','扁带回位发条','Return spring','14184',[37,24,-2],[20,9,0],
    '模型改用有宽度和厚度的卷绕扁带，显示内端、圈间间隙与外端；不再用圆线弹簧代替发条。','取出或装入时要控制储能与弹出。手册提到使用装在塑料环里的新发条；本模型不模拟发条张力。',[5,8,9,12,14],
    'PDF 第 8 页图 6：发条按图用 ISOFLEX TOPAS L32 润滑脂。');
   flatSpiral(g,36.5,24,-2,2.65,8.15,3.25,1.28,.17);
   box(g,1.28,.18,1.35,[37.14,24,.93],'silver');
  }
  {
   const g=part('p_14185','return','发条中心轴套','Hub','14185',[37,24,-2],[34,10,0],
    '贯通孔轴套具有下端法兰、圆筒及发条内端连接槽。与发条及壳体分件显示。','安装时确认发条内端与轴套配合；不要依据示意槽宽加工零件。',[5,8,12,14]);
   ring(g,35.8,24,-2,4.1,1.3,.48,'silver');ring(g,36.28,24,-2,2.58,1.3,2.6,'brass');
   box(g,.9,.5,.8,[37.55,26.3,-2],'dark');
  }

  // Winding gear assembly: stacked pierced wheel, annular lower plate, springs and keyed shaft.
  {
   const g=part('p_308109','drive','A12 过片齿轮总成（下层）','Gear assembly, A12','308109',[39,24,-2],[0,0,0],
    'A12 专用总成编号。为看清内部，本学习模型把上层齿轮 12215、两种弹簧及轴分件展开；此项显示下层轮盘和棘接触层。','总成型号不能与 A16／A16S 的 309103 或 A24 的 311101 混用。拆卸先抽出轴 308426。',[5,9,12,14],
    '第 9 页图 7：实心点用 L32，空心点用 PDP 48；特别注明的脂点位于指定齿部内侧。');
   wheel(g,38.8,24,-2,10.05,38,.9,'silver',0,2.6);ring(g,39.72,24,-2,8.25,6.8,.7,'brass');
   ring(g,39.75,24,-2,3.7,1.55,.8,'silver');
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ring(g,39.75,24+Math.cos(a)*5.4,-2+Math.sin(a)*5.4,.7,.2,.43,'silver');}
   curvedPlate(g,40.03,[['M',28,-7],['Q',31,-6,30,-4],['L',28,-3],['Q',27,-5,25,-5]],.38,'dark');
  }
  {
   const g=part('p_12215','drive','上层开孔齿轮','Gear','12215',[42,24,-2],[29,4,0],
    '图 12 的项目 61；上层轮盘绘出多个减重孔、贯通中心孔和轮缘。孔数及齿形用于视觉辨识，不作为精确尺寸。','与 308109 下层及弹簧的装配方向须依据图 7、图 8 检查。',[9,12,14],
    '图 7 特别标注：指定齿部内侧为 L32 脂点；不要把所有外齿一律涂满。');
   wheel(g,41.05,24,-2,10.0,38,1.05,'brass',6,1.58);ring(g,42.12,24,-2,2.8,1.58,.35,'silver');
  }
  {
   const g=part('p_816707','drive','齿轮总成扭簧','Spring','816707',[38.3,24,-2],[13,1,-20],
    '位于齿轮总成下层的线绕扭簧，图 12 项目 59。','记录簧脚原始方向，拆装时防止弹出；不按动画推断预紧角。',[9,12,14],
    '第 9 页图 7 的对应弹簧以空心点标为 PDP 48 润滑油。');
   torsion(g,38.0,24,-2,2.08,4,1.5);rod(g,[38,26.08,-2],[38,27.5,-6],.22);
  }
  {
   const g=part('p_814303','drive','齿轮总成接触弹簧','Spring','814303',[40.3,28,-4],[21,15,-7],
    '图 12 项目 60，位于上层轮与下层轮盘之间的小弹簧。与扭簧 816707 分开识别。','观察簧脚与轮盘位置；本模型没有计算摩擦力或锁止动作。',[9,12,14]);
   bentWire(g,[[40.3,26,-7],[40.3,28,-7.4],[40.3,29.6,-5.5],[40.3,28.4,-3.2],[40.3,26.3,-3.2]],.3,'dark');
  }
  {
   const g=part('p_308426','drive','过片传动轴（长销朝内）','Shaft','308426',[44,24,-2],[46,6,0],
    '穿过 308109 总成的长轴。用阶梯轴、贯通轴套及径向长销区分方向。','第 9 页明确要求长销朝下进入后背支架；此处“朝下”指原厂图的装配方向，即朝支架内侧。',[5,9,12,14],
    '第 9 页图 7 对应轴以空心点标为 PDP 48 润滑油。');
   cylinder(g,1.26,9.1,[40.6,24,-2],'silver');cylinder(g,1.65,1.1,[44.3,24,-2],'silver');
   rod(g,[36.5,24,-2],[36.5,24,-6.1],.42,'dark');box(g,3,.65,1.05,[43.8,24.9,-2],'dark');
  }
  {
   const g=part('p_12209','drive','传动小齿轮','Gear','12209',[40.3,34,13],[38,16,12],
    '位于上方独立轴位的小齿轮；与 308109 总成及中心机构有装配顺序关系。','自动停片检查会按手册方向转动此轮；齿数、啮合间隙及相位均未由此模型验证。',[5,9,12,14]);
   wheel(g,38.75,34,13,5.65,20,1.25,'silver',3,1.55);ring(g,40.1,34,13,2.7,1.55,.65,'brass');
  }

  // Return stop and its actual retaining stack.
  {
   const g=part('p_20717','linkages','回位止挡','Return stop','20717',[38.5,33,13],[3,6,10],
    '原厂图中的异形止挡片，与 810802 垫圈、817132 卡簧共同固定。','按原有层次装回，检查止挡活动；不能只凭摇柄顺畅判断自动停片合格。',[5,8,12,14]);
   curvedPlate(g,37.15,[['M',36,15],['Q',36.4,12,33,11],['L',22,5],['Q',20,5,20,8],['L',29,14],['L',30,16],['Q',33,18,36,15]],.9,'silver',[[33,13,1.45]]);
  }
  {
   const g=part('p_810802','linkages','回位止挡垫圈','Washer','810802',[40.9,34,13],[30,10,19],
    '回位止挡固定层中的薄环形垫圈。','与止挡及卡簧成组保存，勿丢失或省略。',[5,8,12,14]);ring(g,40.86,34,13,2.7,1.5,.3,'silver');
  }
  {
   const g=part('p_817132','linkages','回位止挡开口卡簧','Clip','817132',[41.5,34,13],[42,12,21],
    '可见开口与端部的薄卡簧，用于止挡固定层。','使用合适工具控制弹跳；装好后核对卡簧确实进入轴槽。',[5,8,12,14]);clip(g,41.35,34,13,2.1,.38);
  }
  {
   const g=part('p_814307','linkages','回位止挡拉簧','Spring','814307',[36.6,29,17],[11,10,29],
    '原厂图 12 项目 47，连接回位止挡的拉簧。','记录两端挂点，检查有无变形或挂错。',[12,14]);
   spring(g,[36.6,21,16.2],[36.6,32.5,18],.65,12);bentWire(g,[[36.6,32.5,18],[36.6,34,18],[36.6,34.6,16.8],[36.6,33.5,16.4]],.2);
  }

  // Distinct curved and folded levers, bored pivots and spring connections.
  {
   const g=part('p_22715','linkages','控制摆臂','Arm','22715',[37.5,14,9],[4,0,14],
    '分解图项目 8；弯曲片状摆臂与轴 12819 分件呈现。根据手册与照片重建曲面轮廓和轴孔。','先抽出轴 12819 再取下摆臂；保留簧脚、孔位与机构接触关系的照片。',[5,8,12,13]);
   curvedPlate(g,36.3,[['M',-5,7],['Q',3,8,10,10],['Q',15,11,17,5],['L',23,4],['Q',25,4,24,7],['L',24,13],['Q',23,16,19,15],['L',15,14],['Q',9,14,2,12],['Q',-7,11,-5,7]],1.03,'pale',[[19,11,1.6],[14,11.7,.8]]);
   ring(g,37.35,19,11,2.5,1.6,.43,'dark');
  }
  {
   const g=part('p_12819','linkages','摆臂轴','Shaft','12819',[39,19,11],[22,4,24],
    '穿过控制摆臂的阶梯轴，模型绘出轴肩与端部槽。','装配前确认对应摆臂孔；不要把润滑脂涂到周围遮光材料。',[5,8,12,13],
    '第 8 页文字明确指定：轴 12819 使用润滑脂。图 4 的实心点为 ISOFLEX TOPAS L32。');
   cylinder(g,1.5,4.9,[37.1,19,11],'silver');cylinder(g,1.9,.6,[39.7,19,11],'chrome');ring(g,38.9,19,11,1.57,1.43,.2,'dark');
  }
  {
   const g=part('p_22277','linkages','释放臂','Release arm','22277',[36.3,-7,14],[2,-13,18],
    'A12、A16、A16S 使用的释放臂（图 12 项目 10）。本模型绘出折弯边、轴孔和入槽端。','自动停片调整要求此臂落入 22371 下方的第一凹槽，同时机构板止挡进入计数盘凹槽。',[5,8,9,12,13],
    '第 8 页按图 4 先润滑再安装；具体点位须直接核对实心点，勿对整片喷油。');
   curvedPlate(g,35.2,[['M',-20,8],['L',-20,11],['Q',-15,13,-11,14],['L',2,18],['Q',5,18,5,15],['L',5,12],['Q',4,10,2,11],['L',-10,11],['L',-15,8]],.8,'silver',[[2,14,1.55],[-12,11,.7]]);
   box(g,2.1,3,.75,[36.6,-19,9],'silver');ring(g,36,2,14,2.35,1.55,.55,'silver');
  }
  {
   const g=part('p_814527','linkages','摆臂连接拉簧 ×2','Spring, 2 pcs','814527 ×2',[36.7,8,15],[17,0,35],
    '原厂表列两根；按手册连接到图 4 标为 A 的铆接销附近。两根均绘出独立线圈。','拆卸从铆接销解钩；装配恢复原挂点，两根数量不可合并为一根。',[5,8,12,13]);
   spring(g,[36.8,2.5,14],[36.8,16,14],.58,14);spring(g,[37.1,2.5,14],[37.1,12,7],.58,12);
   bentWire(g,[[36.8,16,14],[36.8,18.2,14],[36.8,18.5,12.8],[36.8,17.3,12.5]],.18);
   bentWire(g,[[37.1,12,7],[37.1,13,5.7],[37.1,14.1,6.1],[37.1,14,7.2]],.18);
  }
  {
   const g=part('p_816502','linkages','控制摆臂扭簧','Spring','816502',[36.9,19,11],[13,19,20],
    '图 12 项目 7，随控制摆臂 22715 的扭簧。','簧脚的约束点与预紧不能根据静态示意推定，拆前记录实物。',[12,13]);torsion(g,35.6,19,11,1.9,3,1.35);
  }
  {
   const g=part('p_814508','linkages','释放臂附属弹簧','Spring','814508',[35.9,2,14],[11,-3,30],
    '原厂图 12 项目 9；与释放臂 22277 关联的弹簧。','保持原件与挂点记录，勿凭零件表名称互换弹簧。',[12,13]);torsion(g,35.1,2,14,1.65,3,1.2);
  }
  {
   const g=part('p_21494','linkages','中心机构连杆','Link','21494',[37.6,8,-12],[10,0,-16],
    '分解图项目 55，中心机构拉簧 814852 的挂接连杆。模型绘出两端孔及折边。','按第 5 页先从此连杆解开 814852；复装确认连杆自由度与连接点。',[5,8,12,14]);
   curvedPlate(g,36.5,[['M',2,-9],['Q',1,-13,4,-14],['L',13,-16],['Q',16,-16,16,-13],['L',15,-11],['L',6,-10]],.78,'brass',[[4,-12,1.0],[13,-13.5,1.05]]);
   box(g,1.8,2,.65,[37.8,14,-15.4],'brass');
  }
  {
   const g=part('p_21568','linkages','连杆支架','Bracket','21568',[36.6,9,-13],[0,0,-12],
    '图 12 项目 54；带孔与折边的支架，托住连杆固定层。','拆装时保存支架朝向及螺钉位置。',[12,14]);
   curvedPlate(g,35.4,[['M',1,-16],['L',14,-17],['Q',17,-16,16,-13],['L',4,-11],['Q',0,-12,1,-16]],.7,'silver',[[4,-13.8,.7],[13,-14.5,.7]]);box(g,2.5,10,.7,[36.4,8,-17],'silver');
  }
  {
   const g=part('p_824060','linkages','拉簧挂接螺钉','Screw','824060',[38.1,6,15],[16,1,41],
    '第 8 页指明中心机构其中一根弹簧连接到这枚螺钉。','先确认弹簧挂点，再固定；不要把本螺钉与计数盘调整螺钉混淆。',[8,12,14]);screwDetail(g,37.8,6,15,1.15,2.3);
  }
  {
   const g=part('p_13754','linkages','自动停片检查销','Pin','13754',[36,-12,18],[9,-17,32],
    '第 9 页自动停片调整要求按入的销；这里以带轴肩的短销表示。','原厂步骤要求按住此销并转动 12209；必须结合停止关系判断，三维点击不会完成机械校准。',[9,12,13]);cylinder(g,.9,4.6,[35.6,-12,18],'chrome');cylinder(g,1.35,.65,[38.2,-12,18],'silver');
  }
  {
   const g=part('p_822065','linkages','A12 固定止挡螺钉','Stop screw','822065',[37,-33,-17],[13,-23,-20],
    '原厂表列 A12／A24 的固定止挡螺钉。此模型没有加入仅适用于 A16／A16S 的偏心件 22171。','保持原位置；不要照抄 A16 偏心调整作为普通 A12 的调节步骤。',[12,13,14]);screwDetail(g,36.6,-33,-17,1.2,2.2);
  }

  // Film signal with its separately visible torsion spring.
  {
   const g=part('p_13031','signal','红白曝光信号件','Signal','13031',[39,-35,13],[8,-7,10],
    '图 12 项目 25 的机械信号件，与片芯上的胶卷存量指示不是同一零件。模型显示轴、衬套和红白旗片。','第 9 页要求将 816509 弹簧预紧约 1 圈后安装；完成后检查曝光指示动作。',[5,9,11,12,13]);
   cylinder(g,1.15,5.2,[36.5,-35,13],'silver');ring(g,38.5,-35,13,2.25,1.16,.75,'brass');
   curvedPlate(g,39.3,[['M',-36.5,10.6],['L',-32,10.6],['Q',-31,12.2,-32,14.2],['L',-36.5,14.2]],.52,'white');
   box(g,.6,2.25,3.5,[39.6,-35.35,12.45],'red');
   ring(g,39.3,-35,13,1.5,.55,.72,'silver');
  }
  {
   const g=part('p_816509','signal','曝光信号扭簧','Spring','816509',[37.1,-35,13],[22,-14,15],
    '图 12 项目 24，信号件轴上的小扭簧；与计数回零弹簧及过片发条分开。','第 9 页写明约 1 圈预紧；先确认原厂观察方向与簧脚位置，三维展开不代表卸力。',[9,12,13]);torsion(g,35.8,-35,13,1.45,4,2.0);
  }

  // Perforated cover bridge and retained stop spring, physically distinct from its fasteners.
  {
   const g=part('p_308485','bridge','开孔机构板／桥板','Mechanism plate','308485',[42.5,10,-1],[0,0,0],
    '依据原厂板形重建的异形金属板，带多个真实通孔、安装孔及伸向计数盘的止挡端。孔洞能直接看到下方机构。','拆卸先去 810927 垫圈及两枚固定螺钉；装回后检查板上止挡与计数盘凹槽的对应关系。',[5,9,12,13]);
   curvedPlate(g,42.75,[['M',-22,-2],['L',-20,-6],['L',-10,-8],['L',-4,-13],['L',29,-15],['Q',34,-15,34,-10],['L',31,-6],['L',29,3],['L',17,17],['Q',15,19,11,17],['L',-5,12],['L',-12,2],['L',-20,1]],.85,'silver',
    [[24,-2,4.7],[13,6,4.25],[11,-7,4.3],[1,-1,4.05],[-6,5,2.45],[30,-11,1.0],[14,14,1.0],[-7,-5,1.0]]);
   box(g,1.8,2,1.15,[42.4,-20.2,-.1],'silver');
  }
  {
   const g=part('p_823012_plate','bridge','机构板固定螺钉 ×2','Screw, 2 pcs','823012 ×2',[44.1,30,-11],[18,0,0],
    '固定机构板的两枚螺钉，与右侧盖也使用的同号螺钉按所在总成分开列示。','拆卸分类保存；这里显示两枚机构板螺钉，不把外盖三枚计入本项。',[5,9,12,13]);
   screwDetail(g,43.72,30,-11,1.3,2.9);screwDetail(g,43.72,-7,-5,1.3,2.9);
  }
  {
   const g=part('p_810927','bridge','机构板上方垫圈','Washer','810927',[44.7,24,-2],[32,4,0],
    '拆卸机构时最先取下、装配后套在机构板上方的垫圈；使用真实中心孔表现。','不要与位于板下、中心机构上的 810926 混放。',[5,9,12,13]);ring(g,43.9,24,-2,3.65,1.72,.38,'silver');
  }
  {
   const g=part('p_816505','bridge','机构板止挡弹簧','Spring','816505',[43,-19,-1],[15,-12,4],
    '图 12 项目 4，附在机构板附近的小弹簧。模型以线圈及两端簧脚区分于板件。','检查原挂接位置，勿由静态示意推断预紧；自动停片关系仍以第 9 页为准。',[9,12,13]);
   torsion(g,42.05,-18,-1,1.35,2,1.1);rod(g,[43.15,-16.65,-1],[43.15,-15,-4],.2);
  }
  return {parts};
 };
})();
