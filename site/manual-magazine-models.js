/* Manual-indexed learning models. Y is up; +Z faces the camera body.
 * Dimensions, tooth profiles, spring forms and travel are illustrations.
 * Sources: local Film Magazines service manual, PDF pages cited per part.
 * The separate parts share no animated parents and no mutable materials.
 */
(function (global) {
  'use strict';
  const IDS = ['A16S', 'A32', 'A12TCC', 'A16TCC', 'A24TCC', 'E12', 'E16', 'E24', 'E12CC', 'MAGAZINE70', 'POLAROID100', 'POLABASIC', 'POLAPLUS'];
  const BOUNDARY = '依据原厂爆炸图重建可识别总成；尺寸、孔位、齿形、弹簧和移动距离均为教学示意，不能用于加工、配合校验或机械调整。分层展开不是经原厂确认的拆装操作顺序。';

  function buildManualMagazineModel(T, modelId) {
    const model = String(modelId).toUpperCase();
    if (!IDS.includes(model)) throw new Error('Unsupported manual magazine model: ' + modelId);
    const root = new T.Group(); root.name = model;
    const parts = [];
    const specialBody = model === 'MAGAZINE70' || model.startsWith('POLA');
    const materials = {
      chrome: new T.MeshStandardMaterial({color:0xc5cbd0, metalness:.78, roughness:.28}),
      steel: new T.MeshStandardMaterial({color:0x88949f, metalness:.68, roughness:.4}),
      black: new T.MeshStandardMaterial({color:0x1b232b, metalness:.22, roughness:.66}),
      leather: new T.MeshStandardMaterial({color:0x252629, metalness:.03, roughness:.96}),
      brass: new T.MeshStandardMaterial({color:0xbb9252, metalness:.65, roughness:.32}),
      flex: new T.MeshStandardMaterial({color:0xba743c, metalness:.28, roughness:.6}),
      film: new T.MeshStandardMaterial({color:0x4d3029, metalness:.05, roughness:.75}),
      ivory: new T.MeshStandardMaterial({color:0xe1deca, metalness:.1, roughness:.65}),
      rubber: new T.MeshStandardMaterial({color:0x11171e, metalness:0, roughness:1}),
      glass: new T.MeshStandardMaterial({color:0xb2d6db, transparent:true, opacity:.34, metalness:.1, roughness:.15, depthWrite:false}),
      red: new T.MeshStandardMaterial({color:0xa64b3c, metalness:.08, roughness:.6}),
      green: new T.MeshStandardMaterial({color:0x45825b, metalness:.08, roughness:.6})
    };
    global.refineMagazineMaterials?.(T,materials);
    function part(id, name, number, pages, spread, description) {
      const group = new T.Group(); group.name = id; group.userData.partId = id;
      group.userData.estimated = true; root.add(group);
      const row = {id, name, number:number || '', pages, description:description || '原厂图确认名称和结构关系；具体轮廓及尺寸为示意。', group, spread};
      parts.push(row); return group;
    }
    function mesh(g, geo, mat, pos=[0,0,0]) {
      const m = new T.Mesh(geo, materials[mat].clone()); m.position.set(...pos);
      m.castShadow = true; m.receiveShadow = true; m.userData.partId = g.userData.partId;
      g.add(m); return m;
    }
    function box(g, w,h,d,pos,mat='steel') {
      if(!specialBody||Math.min(w,h,d)<.6||Math.max(w,h,d)<7)return mesh(g,new T.BoxGeometry(w,h,d),mat,pos);
      // Preserve the original extents while rounding exposed stamped/cast edges.
      const edge=Math.min(.28,Math.min(w,h,d)*.16),radius=Math.min(.9,w*.2,h*.2);
      const shape=pathRect(new T.Shape(),w-edge*2,h-edge*2,Math.max(.05,radius-edge));
      const geo=new T.ExtrudeGeometry(shape,{depth:d-edge*2,bevelEnabled:true,bevelSize:edge,bevelThickness:edge,bevelSegments:2,curveSegments:5});geo.translate(0,0,-d/2+edge);
      return mesh(g,geo,mat,pos);
    }
    function cyl(g,r,len,pos,mat='steel',axis='x',segments=40) {
      const m=mesh(g,new T.CylinderGeometry(r,r,len,segments),mat,pos);
      if(axis==='x')m.rotation.z=Math.PI/2; else if(axis==='z')m.rotation.x=Math.PI/2;
      return m;
    }
    function pathRect(s,w,h,r=0) {
      const x=-w/2,y=-h/2; r=Math.min(r,w/2,h/2);
      s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
      s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
      s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
    }
    function plate(g,w,h,d,pos,mat='chrome',axis='z',holes=[],radius=2) {
      const s=pathRect(new T.Shape(),w,h,radius);
      for(const hole of holes) {
        const p=new T.Path();
        if(hole.length===3)p.absarc(hole[0],hole[1],hole[2],0,Math.PI*2,true);
        else {pathRect(p,hole[2],hole[3],hole[4]||0);p.currentPoint.set(0,0);
          for(const curve of p.curves) for(const k of ['v0','v1','v2']) if(curve[k]){curve[k].x+=hole[0];curve[k].y+=hole[1];}}
        s.holes.push(p);
      }
      const edge=specialBody&&!['leather','rubber','glass'].includes(mat)?Math.min(.16,d*.16):0;
      const geo=new T.ExtrudeGeometry(s,{depth:d-edge*2,bevelEnabled:edge>0,bevelSize:edge,bevelThickness:edge,bevelSegments:2,curveSegments:7});geo.translate(0,0,-d/2+edge);
      const m=mesh(g,geo,mat,pos);if(axis==='x')m.rotation.y=Math.PI/2;else if(axis==='y')m.rotation.x=Math.PI/2;return m;
    }
    function frame(g,w,h,iw,ih,d,pos,mat='chrome',axis='z') {return plate(g,w,h,d,pos,mat,axis,[[0,0,iw,ih,.5]],1.5);}
    function ring(g,r,ir,d,pos,mat='steel',axis='x') {
      const s=new T.Shape();s.absarc(0,0,r,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,ir,0,Math.PI*2,true);s.holes.push(hole);
      const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:24});geo.translate(0,0,-d/2);
      const m=mesh(g,geo,mat,pos);if(axis==='x')m.rotation.y=Math.PI/2;else if(axis==='y')m.rotation.x=Math.PI/2;return m;
    }
    function line(g,points,r=.35,mat='steel') {
      const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
      return mesh(g,new T.TubeGeometry(curve,Math.max(12,points.length*3),r,6,false),mat);
    }
    function screw(g,pos,axis='z') {
      cyl(g,1.6,1,pos,'chrome',axis,20);
      const slot=box(g,axis==='x'?.25:2.2,axis==='y'?.25:.36,axis==='z'?.25:2.2,pos,'black');
      slot.position[axis]+=.56;
    }
    function screws(g,positions,axis='z'){positions.forEach(p=>screw(g,p,axis));}
    function gear(g,r,d,pos,teeth=24,mat='brass') {
      const s=new T.Shape();
      for(let i=0;i<teeth*4;i++){const t=i*Math.PI*2/(teeth*4),rr=r*(i%4===1||i%4===2?1:.88);const x=Math.cos(t)*rr,y=Math.sin(t)*rr;i?s.lineTo(x,y):s.moveTo(x,y);}s.closePath();
      const p=new T.Path();p.absarc(0,0,1.8,0,Math.PI*2,true);s.holes.push(p);
      const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});geo.translate(0,0,-d/2);
      const m=mesh(g,geo,mat,pos);m.rotation.y=Math.PI/2;return m;
    }
    function spring(g,pos,axis='x',radius=2,length=8,turns=5) {
      const pts=[];for(let i=0;i<=120;i++){const a=i/120*Math.PI*2*turns,k=(i/120-.5)*length;
        const q=axis==='x'?[k,Math.cos(a)*radius,Math.sin(a)*radius]:axis==='y'?[Math.cos(a)*radius,k,Math.sin(a)*radius]:[Math.cos(a)*radius,Math.sin(a)*radius,k];
        pts.push(q.map((v,j)=>v+pos[j]));}line(g,pts,.22);
    }
    function ribbed(g,w,h,pos,axis='z') {
      for(let i=-h/2+2;i<h/2;i+=3){
        if(axis==='x')box(g,.25,.4,w,[pos[0],pos[1]+i,pos[2]],'black');
        else box(g,w,.35,.2,[pos[0],pos[1]+i,pos[2]],'black');
      }
    }
    function countDial(g,capacity,pos,r=11) {
      cyl(g,r,1.2,pos,'black');
      for(let i=0;i<capacity;i++){const a=i/capacity*Math.PI*2;
        const mark=box(g,.25,i%4===0?2.4:1.2,.45,[pos[0]+.75,pos[1]+Math.cos(a)*(r-2),pos[2]+Math.sin(a)*(r-2)],'ivory');mark.rotation.x=a;}
      const digits=String(capacity), segs={0:'abcedf',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'};
      const points={a:[0,2.5,2.5,.45],b:[1.25,1.3,.45,2.3],c:[1.25,-1.3,.45,2.3],d:[0,-2.5,2.5,.45],e:[-1.25,-1.3,.45,2.3],f:[-1.25,1.3,.45,2.3],g:[0,0,2.5,.45]};
      digits.split('').forEach((digit,j)=>{for(const key of segs[digit]){const [u,v,w,h]=points[key];box(g,.2,h,w,[pos[0]+.78,pos[1]+v,pos[2]+u+(j-(digits.length-1)/2)*4],'ivory');}});
    }
    function shell(g,w,h,d){
      // A continuous bent U-shaped shell with both side openings exposed.
      const s=new T.Shape(),r=7,t=2.5;
      s.moveTo(d/2,-h/2);s.lineTo(-d/2+r,-h/2);s.quadraticCurveTo(-d/2,-h/2,-d/2,-h/2+r);s.lineTo(-d/2,h/2-r);s.quadraticCurveTo(-d/2,h/2,-d/2+r,h/2);s.lineTo(d/2,h/2);
      s.lineTo(d/2,h/2-t);s.lineTo(-d/2+r,h/2-t);s.quadraticCurveTo(-d/2+t,h/2-t,-d/2+t,h/2-r);s.lineTo(-d/2+t,-h/2+r);s.quadraticCurveTo(-d/2+t,-h/2+t,-d/2+r,-h/2+t);s.lineTo(d/2,-h/2+t);s.closePath();
      const geo=new T.ExtrudeGeometry(s,{depth:w,bevelEnabled:false,curveSegments:8});geo.translate(0,0,-w/2);
      const m=mesh(g,geo,'chrome');m.rotation.y=-Math.PI/2;
      plate(g,w-6,h-13,1,[0,0,-d/2-.6],'leather');
      for(const y of [-h/2+4,h/2-4])box(g,w-5,1.5,d-5,[0,y,0],'black');
      if(specialBody){
        // PDF 52 shows wraparound covering and turned-in side rims.
        for(const y of [-h/2-.4,h/2+.4])plate(g,w-6,d-12,.7,[0,y,0],'leather','y',[],2);
        for(const x of [-w/2+.7,w/2-.7]){const lip=new T.ExtrudeGeometry(s,{depth:1.2,bevelEnabled:true,bevelSize:.2,bevelThickness:.2,bevelSegments:1,curveSegments:8});lip.translate(0,0,-.6);const edge=mesh(g,lip,'chrome',[x,0,0]);edge.rotation.y=-Math.PI/2;}
      }
    }
    function roll(g,y,r=10,z=-10,length=61){
      cyl(g,2,length+7,[0,y,z],'steel');cyl(g,r,length,[0,y,z],'film');
      for(const x of [-length/2,length/2]){cyl(g,r+1,.8,[x,y,z],'black');cyl(g,3,2,[x,y,z],'steel');}
    }
    function windowMemo(g,pos){plate(g,26,21,1.5,pos,'chrome');plate(g,22,16,1,[pos[0],pos[1],pos[2]-.9],'ivory');}

    function rollFilm() {
      const electronic=/TCC$|^E/.test(model), dual=/TCC$|CC$/.test(model), old=model==='A16S', a32=model==='A32';
      const capacity=a32?32:model.includes('24')?24:model.includes('16')?16:12;
      const narrow=capacity===16||capacity===32, iw=old?41:56, ih=old?41:narrow?42:56;
      const corePages=a32?[62,63,64]:electronic?[31,32,33]:[12,13,14];
      const shellPages=a32?[65,66]:old?[15,16]:dual&&model!=='E12CC'?[38,39]:[34,35];
      const insertPages=old?[25,26]:a32?[27,28]:[40,41,42];
      const elecPages=dual?[45,46]:[43,44];
      let g=part('shell','后背外壳与后部蒙皮','308023',shellPages,[0,0,-65]);shell(g,88,92,57);
      if(!old&&(!dual||model==='E12CC'||a32)){
        g=part('slide-holder','后部插刀存放架',a32?'308536':'308366',shellPages,[0,0,-86]);frame(g,a32?82:78,80,a32?75:71,72,2,[0,0,-33],'black');box(g,a32?82:78,5,3,[0,-39,-34],'black');
      }
      g=part('film-indicator','胶卷标识窗','308328',shellPages,[0,0,-100]);windowMemo(g,[0,0,-36]);
      const support=a32?'607311':old?'30516':narrow?'309344':'308364';
      g=part('support','后背支架',support,corePages,[0,0,16]);frame(g,84,86,iw+7,ih+7,7,[0,0,20],'black');
      box(g,3,70,38,[37,0,-2],'black');
      g=part('picture-frame','画框',old?'21587':narrow?'22712':'22710',corePages,[0,0,35],'画幅开口采用型号对应比例；尺寸不是实测值。');frame(g,iw+10,ih+10,iw,ih,2,[0,0,26]);
      screws(g,[[-iw/2-3,-ih/2-3,27],[-iw/2-3,ih/2+3,27],[iw/2+3,-ih/2-3,27],[iw/2+3,ih/2+3,27]]);
      g=part('outer-plate','机身连接外板',electronic?'308321':'40380',corePages,[0,0,68]);frame(g,90,91,iw+1,ih+1,1.8,[0,0,31]);
      screws(g,[[-41,-40,32],[0,-41,32],[40,-40,32],[-41,0,32],[41,0,32],[-41,40,32],[0,41,32],[40,40,32],[34,34,32]]);
      for(const x of [-32,32])box(g,7,3,4,[x,-42,33],'steel');
      g=part('dark-slide','插刀及把手','Z41068 / 12295',corePages,[-67,0,57]);plate(g,77,78,.45,[0,0,29],'steel');box(g,4,80,4,[-41,0,29],'black');
      g=part('light-trap','插刀口光阱与遮光薄片','13067 / 13508',corePages,[-30,-16,47]);box(g,3,74,3,[-38,0,25],'rubber');box(g,.35,74,5,[-36,0,24],'black');
      g=part('locking-arm','插刀锁止臂及片簧','20843 / 20684',corePages,[24,8,40]);box(g,3,32,1,[37,3,25],'steel');line(g,[[37,-14,26],[35,-5,26],[37,2,26],[36,18,26]],.4);screw(g,[37,18,26]);

      g=part('insert-endplate','片芯端板',old?'90394':narrow?'313322':'312323',insertPages,[-61,0,-5]);
      plate(g,51,82,2.6,[-39,0,0],'chrome','x',[[0,0,10]],4);screws(g,[[-40.7,-35,-21],[-40.7,35,-21],[-40.7,-35,20],[-40.7,35,20]],'x');
      g=part('insert-support','片芯中间支承',old?'21620':narrow?'309506':'308516',insertPages,[-23,0,-35]);frame(g,42,75,28,57,2,[32,0,-2],'black','x');box(g,65,2,11,[-2,-38,-11],'steel');box(g,65,2,11,[-2,38,-11],'steel');
      g=part('insert-lock','片芯锁紧件',old?'13784':'308101',insertPages,[-98,0,0]);ring(g,10,3,3,[-45,0,0]);box(g,2,17,3,[-48,0,0],'black');
      g=part('pressure-plate','压片板',old?'21615':narrow?'309102':'308104',insertPages,[-50,0,-70]);plate(g,60,ih+8,1.4,[0,0,10],'steel');
      for(let y=-ih/2+3;y<ih/2-2;y+=4)for(let x=-24;x<26;x+=4)box(g,.65,.65,.3,[x,y,10.8],'chrome');
      g=part('pressure-spring','压片板簧','13913',insertPages,[-50,0,-96]);
      line(g,[[-24,-20,7],[-20,-22,6],[0,-2,4],[20,-22,6],[24,-20,7]],.65);
      line(g,[[-24,20,7],[-20,22,6],[0,2,4],[20,22,6],[24,20,7]],.65);
      g=part('guide-rollers','导片滚筒与导片件',old?'13514 / 13912':narrow?'13514 / 309403':'13514 / 308346',insertPages,[-38,0,8]);
      for(const y of [-34,34]){cyl(g,3,61,[0,y,14]);cyl(g,1.4,65,[0,y,14]);}box(g,59,4,2,[0,-28,11],'chrome');
      g=part('spool-supply','供片卷（耗材示意）','',insertPages,[-62,-32,-38],'用于识别走片空间，不是独立原厂零件。');roll(g,-29,10);
      g=part('spool-takeup','收片卷（耗材示意）','',insertPages,[-62,32,-38],'用于识别走片空间，不是独立原厂零件。');roll(g,29,7);
      g=part('takeup-arm','收片臂',old?'13797':'22398',insertPages,[-38,27,-12]);plate(g,59,6,1.5,[0,39,-9],'steel','y',[[24,0,1.5],[-24,0,1.5]],1);
      g=part('insert-lock-shaft','片芯锁紧轴',old?'13060':'308103',insertPages,[-27,2,-45]);cyl(g,1.2,67,[29,0,-14],'steel','y');box(g,7,1.5,5,[27,34,-14],'steel');

      g=part('mechanism-plate','机构轴板与连接杆','308485 / 12819',corePages,[27,0,0]);plate(g,50,79,1.2,[40,0,0],'steel','x',[[0,0,7],[10,23,3]],3);cyl(g,2,7,[43,1,-3]);line(g,[[42,-28,-18],[42,-20,0],[42,3,11]],1.1);
      const spacing=a32?'607316':capacity===24?'21484':model==='E16'?'22841':capacity===16?'21583':'22371';
      g=part('spacing-gear','片间距齿轮',spacing,corePages,[47,14,10],model==='E16'?'本条取 S/N 37ET10301 起的 22841；此前 E16 为 21583。齿数与齿廓为示意。':'齿轮身份由原厂表确认；齿数及齿廓没有尺寸依据。');gear(g,13,2.2,[43,20,11],24);
      g=part('counter-dial','计数盘 0–'+capacity,a32?'607320':capacity===24?'13819':capacity===16?'13849':'13806',corePages,[66,14,10]);countDial(g,capacity,[46,20,11]);
      g=part('center-mechanism','中央机构总成',a32?'607313':capacity===24?'21483':'21548',corePages,[46,-3,-6]);gear(g,9,3.5,[43,0,-5],17);cyl(g,2.4,6,[44,0,-5]);gear(g,5,2,[46,0,-5],13,'steel');
      g=part('drive-gears','传动齿轮总成',capacity===24?'311101':narrow?'309103':'308109',corePages,[57,17,-16]);gear(g,12,4,[44,25,-15],23);gear(g,6,3,[46,25,-15],15,'steel');
      g=part('release-arm','释放臂',capacity===24||a32?'22315':'22277',corePages,[46,-13,8]);plate(g,25,4,1.2,[45,-13,3],'steel','x');box(g,1.2,11,4,[45,-9,14],'steel');spring(g,[46,-15,-5]);
      g=part('spring-housing','回位发条盒与连接毂','13030 / 14185',corePages,[54,-20,-14]);cyl(g,8,3,[44,-26,-14]);ring(g,7.2,6.5,.5,[46,-26,-14],'black');
      for(let i=0;i<3;i++)ring(g,2+i*1.5,1.4+i*1.5,.4,[46.4,-26,-14],'brass');
      if(narrow){g=part('stop-adjuster',a32?'A32 停止件与止动爪':'偏心调整件',a32?'607088 / 607096':'22171',corePages,[64,-18,15]);cyl(g,3,2,[45,-21,17],'brass');cyl(g,1,2.7,[46,-20.2,17]);if(a32)box(g,1.2,9,3,[46,-16,14],'steel');}
      if(a32){g=part('shade-signal','A32 遮片及信号件','607089 / 607314',[62,63],[72,29,0],'A32 专用遮片、信号件与计数轮配合；未模拟时序或弹簧预紧。');plate(g,10,18,.6,[47,24,8],'black','x');box(g,2,5,9,[47,32,-6],'red');}
      g=part('right-cover','右侧机构罩盖',a32?'607305':capacity===16||capacity===24?'30499':'30483',shellPages,[92,0,0]);
      plate(g,55,86,2.3,[49,0,0],'chrome','x',[[-11,20,8],[5,0,10]],4);plate(g,49,78,.6,[50.6,0,0],'leather','x',[[-11,20,8],[5,0,10]],3);
      screws(g,[[51,-37,21],[51,37,21],[51,37,-22]],'x');
      g=part('winding-crank','卷片摇柄','13810',shellPages,[108,0,-2]);cyl(g,10,3,[53,0,-5]);plate(g,5,25,2.3,[57,-9,-5],'black','x');cyl(g,3,6,[58,-20,-5],'black');

      if(electronic){
        g=part('electronic-cover',dual?'TCC / CC 双拨盘片芯端盖':'E 型感光度片芯端盖',dual?'308431':'308519',elecPages,[-119,0,0],'位于片芯端，与卷片摇柄机构分处两侧。开盖仍有四根导线连接，真实拆修不能直接拉离。');
        const holes=[[0,0,10],[0,27,10]];if(dual)holes.push([0,-27,9]);
        plate(g,51,85,1.6,[-47,0,0],'chrome','x',holes,4);plate(g,47,80,.65,[-48.2,0,0],'leather','x',holes,3);
        screws(g,[[-49,-37,-20],[-49,37,-20],[-49,-37,20],[-49,37,20]],'x');
        g=part('flex-circuit','感光度柔性电路板',dual?'308460':'308524',elecPages,[-87,0,0],'手册列示柔性电路与四根导线；铜迹线仅帮助认知，不代表电路原理或接线图。');
        plate(g,24,69,.5,[-44,0,0],'flex','x',[[0,0,12]],3);
        for(const y of dual?[27,-27]:[27])for(let i=0;i<4;i++)ring(g,3+i*1.5,2.65+i*1.5,.14,[-44.4,y,0],'brass');
        for(const y of [-8,0,8])line(g,[[-44.5,27,9],[-44.5,19,10],[-44.5,y,10],[-44.5,y,-5]],.15,'brass');
        g=part('iso-dial','ISO 指示圈与拨盘','308347 / 308107',elecPages,[-138,18,0]);ring(g,10,7,1.2,[-51,27,0],'ivory');gear(g,6.8,2,[-52,27,0],26,'black');box(g,1,1,8,[-54,27,0],'steel');
        if(dual){g=part('correction-dial','第二指示圈与拨盘','308348 / 308107',elecPages,[-138,-20,0]);ring(g,9,6.5,1.2,[-51,-27,0],'ivory');gear(g,6.5,2,[-52,-27,0],26,'black');box(g,1,1,8,[-54,-27,0],'steel');}
        g=part('circuit-contact','电接点总成与四根连线','308043',elecPages,[-60,-21,22],'手册导线颜色为绿、黑、白、红；曲线为走线示意，不用于判断焊脚顺序。');
        box(g,8,5,9,[-31,-32,18],'black');for(let i=0;i<4;i++){cyl(g,.85,5,[-34+i*2,-32,24],'brass','z');line(g,[[-44,-9+i*2,7],[-40,-24+i*2,5],[-34+i*2,-32,18]],.36,['green','black','ivory','red'][i]);}
        g=part('contact-flex','机身信号接触软片','308044',[31,32],[0,-28,49]);box(g,18,7,1,[24,-32,32],'flex');for(let i=0;i<4;i++)box(g,2.5,5,.5,[18+i*4,-32,32.8],'brass');
      }else{
        g=part('insert-cover','片芯端盖蒙皮',old?'12289':'12289',insertPages,[-112,0,0]);plate(g,47,79,.7,[-41,0,0],'leather','x',[[0,0,10]],3);ribbed(g,32,28,[-41.5,-22,0],'x');
      }
    }

    function longRoll() {
      let g=part('shell','70 长卷后背外壳','50115',[52,53],[0,0,-91]);shell(g,96,114,90);
      g=part('support','70 后背支架','30759',[47,48],[0,0,25]);frame(g,91,105,64,64,7,[0,0,31],'black');
      g=part('picture-frame','画框','22710',[47,48],[0,0,43]);frame(g,69,69,56,56,2,[0,0,38]);
      g=part('outer-plate','70 机身连接外板','40212',[47,48],[0,0,70]);frame(g,93,107,58,58,2,[0,0,42]);screws(g,[[-42,-47,43],[42,-47,43],[-42,47,43],[42,47,43],[-42,0,43],[42,0,43]]);
      g=part('dark-slide','插刀与把手','Z41068 / 12295',[47,48],[-75,0,63]);plate(g,79,89,.5,[0,0,40],'steel');box(g,4,90,4,[-42,0,40],'black');
      g=part('light-trap','插刀光阱与遮光薄片','13067 / 13508',[47,48],[-28,0,51]);box(g,3,88,3,[-40,0,37],'rubber');box(g,.35,89,5,[-38,0,36],'black');
      g=part('insert-endplate','片芯端板与中间部件','21396',[54,55],[-79,0,0]);plate(g,78,101,3,[-43,0,-1],'chrome','x',[[0,0,10]],4);frame(g,61,91,46,76,2,[37,0,-2],'steel','x');
      frame(g,75,98,70,93,.7,[-45,0,-1],'chrome','x');for(const y of [-31,31]){ring(g,7,2.7,1.6,[-45,y,-15],'chrome');ring(g,3.1,1.8,3,[-46,y,-15],'steel');}
      g=part('insert-lock','片芯锁与端板蒙皮','12728 / 21387',[54,55],[-115,0,0]);plate(g,68,90,1,[-45,0,-1],'leather','x',[[0,0,11]],3);ring(g,11,3,4,[-49,0,0]);box(g,2,18,3,[-52,0,0],'black');
      g=part('insert-plate','片芯上板总成','21394',[54,55],[-49,47,0]);plate(g,77,45,2,[0,49,-9],'steel','y',[[26,0,4],[-26,0,4]],5);gear(g,6,2,[36,43,-11],14);
      for(const x of [-26,26])ring(g,6,4,.9,[x,50.1,-9],'steel','y');
      for(const [label,y,delta] of [['supply',-31,-49],['takeup',31,49]]){
        g=part('cassette-'+label,label==='supply'?'70 mm 供片暗盒':'70 mm 收片暗盒','51039',[54,55],[-75,delta,-51],'手册以 Film cassette，Code No.51039 列出；端盖、筒壁和出片缝在总成内示意。');
        cyl(g,19,70,[0,y,-15],'black');for(const x of [-36,36]){ring(g,20,3,1.8,[x,y,-15]);cyl(g,2.5,3,[x,y,-15]);ring(g,19.9,18.5,1.1,[x+(x<0?1:-1),y,-15],'black');}box(g,64,7,3,[0,y,4],'black');ribbed(g,62,8,[0,y,5.6]);
      }
      g=part('guide-rollers','长、短导片滚筒','13661 / 13660',[54,55],[-42,0,19]);for(const y of [-36,36]){cyl(g,3.6,73,[0,y,21]);cyl(g,1.5,78,[0,y,21]);}cyl(g,3.3,70,[0,-42,9]);
      g=part('pressure-plate','70 压片板','13659',[54,55],[-48,0,-98]);plate(g,64,67,1.8,[0,0,25]);for(let x=-27;x<29;x+=3.5)for(let y=5;y<29;y+=3.5)box(g,.65,.65,.1,[x,y,25.94],'steel');
      for(const x of [-25,25])plate(g,6,4.5,1.8,[x,34.1,25],'chrome','z',[[0,.2,.8]],.8);
      g=part('pressure-springs','压片板簧','21388',[54,55],[-48,0,-122]);for(const x of [-25,25])line(g,[[x,-30,23],[x,-12,19],[x,0,18],[x,12,19],[x,30,23]],.8);
      g=part('locking-shaft','片芯锁紧轴','13662',[54,55],[-35,0,-61]);cyl(g,1.4,90,[35,0,-22],'steel','y');box(g,6,2,7,[34,45,-20],'steel');
      g=part('counter','计数轮与数字盘','13669 / 13670',[49,50],[61,26,22]);gear(g,14,2.5,[46,29,22],28);countDial(g,70,[49,29,22],12);
      g=part('top-gear','上层传动齿轮','21532',[49,50],[58,28,-18]);gear(g,15,3,[47,31,-21],27);gear(g,7,3,[50,31,-21],14,'steel');
      g=part('lower-gear','下层传动齿轮','21447',[49,50],[62,-29,-18]);gear(g,12,3,[47,-28,-21],22);
      g=part('zero-lever','回零杠杆与按钮','13672 / 13686',[47,48,49,50],[78,-10,15]);plate(g,35,4,1.5,[49,-2,0],'steel','x');box(g,1.5,12,4,[49,3,-17],'steel');cyl(g,3,6,[51,-34,29]);
      g=part('counter-spring','计数回位弹簧','21407',[49,50],[71,41,8]);spring(g,[48,29,22],'x',7,2,3);
      g=part('film-feeler','感片器与送片件','13674 / 13668',[49,50],[53,-16,36]);box(g,3,42,2,[38,-4,25],'steel');cyl(g,5,6,[44,-18,22],'black');
      g=part('right-cover','70 右侧盖','21459',[52,53],[106,0,0]);plate(g,82,107,3,[53,0,0],'chrome','x',[[-22,29,9],[21,0,12]],4);plate(g,75,99,.65,[55,0,0],'leather','x',[[-22,29,9],[21,0,12]],3);screws(g,[[56,-48,-35],[56,48,-35],[56,48,35]],'x');
      g=part('crank','70 卷片摇柄','21457',[49,51],[126,0,-7]);cyl(g,12,3,[57,0,-21]);plate(g,5,29,3,[61,-10,-21],'black','x');cyl(g,3.3,7,[63,-23,-21],'black');
      g=part('film-indicator','胶卷标识窗与备忘牌','308328 / 21410',[52,53],[0,0,-112]);windowMemo(g,[0,12,-48]);plate(g,34,23,1,[0,-21,-48],'ivory');
    }

    function instant() {
      const classic=model==='POLAROID100', plus=model==='POLAPLUS';
      const pages=classic?[56,57]:model==='POLABASIC'?[58,59,60,61]:[58,59];
      let g=part('chassis','即时片壳体','303323',pages,[0,0,-62],'三型的原厂表均采用303323壳体，不人为改成不同外壳。');
      plate(g,137,111,3,[0,0,-19],'black','z',[],4);
      plate(g,137,111,30.5,[0,0,-2.25],'black','z',[[0,0,129,103,3]],4);
      frame(g,129,103,122,96,1,[0,0,12.5],'black');
      for(const x of [-57,57])box(g,2,89,3,[x,0,-1],'steel');
      // Museum PolaPlus rear photo: two folded dark-slide rails on the back.
      // Keep them within the existing rear housing; the photo gives no spare-part number.
      if(plus)for(const y of [-34,34]){
        box(g,81,2.2,3.2,[17,y,-22.4],'black');
        box(g,81,3.7,.8,[17,y-Math.sign(y)*1.2,-24.3],'black');
      }
      g=part('rear-leather',classic?'100 型异形后部蒙皮':'Pola 后部蒙皮',classic?'303401':'303404',pages,[0,0,-90]);
      if(classic){plate(g,48,97,1,[-38,0,-21],'leather');plate(g,79,35,1,[21,-31,-21],'leather');plate(g,16,26,1,[-59,8,-21],'leather');}
      else plate(g,123,97,1,[0,0,-21],'leather');
      if(classic){
        g=part('slide-holder','100 型插刀存放架','302101',[56,57],[0,20,-108]);
        // Manual p.56 and the photographed 100 back show a broad offset tray,
        // with folded rails along opposite edges. Proportions remain estimated.
        plate(g,76,66,.65,[22,16.5,-22],'black','z',[],2);
        for(const y of [-15.5,48.5]){
          box(g,76,2.2,2.4,[22,y,-23.2],'black');
          box(g,76,3.6,.75,[22,y-Math.sign(y-16.5)*1.1,-24.75],'black');
        }
      }
      g=part('film-pack','即时片包（耗材示意）','',pages,[0,0,-115],'原厂列为胶片耗材，不赋予维修零件号。');plate(g,106,89,9,[5,0,-8],'film');frame(g,100,83,88,72,.5,[5,0,-2.9],'black');box(g,15,63,.8,[-56,0,-6],'ivory');
      g=part('pack-holder','片包压持件与销','302432 / 302431',pages,[-35,0,-89]);plate(g,13,75,9,[-54,0,-6],'black');for(const y of [-39,39])cyl(g,1,11,[-54,y,-6],'steel','y');
      g=part('inner-plate','片盒内承板','303303',pages,[0,0,22]);frame(g,133,108,84,82,1.8,[0,0,6],'steel');
      for(const y of [-37,37]){box(g,69,1.3,2,[6,y,8],'chrome');for(const x of [-25,5,35])screw(g,[x,y,8]);}
      g=part('perimeter-seal','片盒周边遮光密封','302405',pages,[0,0,12]);frame(g,132,107,123,98,1.8,[0,0,4],'rubber');
      g=part('glass-frame','玻璃定位框','302428',pages,[0,0,45]);frame(g,77,78,63,64,2,[10,0,11],'black');
      g=part('glass','玻璃板','302404',pages,[0,0,61],'玻璃只表达层次位置和透明外观；厚度、光学规格未经实测。');plate(g,64,65,1.2,[10,0,13],'glass', 'z',[],.2);
      g=part('glass-holders','玻璃压持件与板簧','302429 / 13821',pages,[0,0,76],classic?'100型清单为4件玻璃压持件、2片板簧。':'Plus/Basic清单为2件玻璃压持件、4片板簧。');
      const holderPositions=classic?[[-18,-30],[38,-30],[-18,30],[38,30]]:[[10,-30],[10,30]];
      holderPositions.forEach(([x,y])=>{plate(g,14,3,1.2,[x,y,15]);screw(g,[x,y,16]);});
      const springPositions=classic?[[-25,0],[45,0]]:[[-25,-17],[-25,17],[45,-17],[45,17]];
      springPositions.forEach(([x,y])=>line(g,[[x,y-8,15],[x+1.2,y,13],[x,y+8,15]],.7));
      g=part('outer-plate',classic?'100 型机身连接外板':plus?'PolaPlus 专用机身连接外板':'PolaBasic 专用机身连接外板','302322',classic?[56,57]:plus?[58,59]:[60,61],[0,0,102],'零件号相同仍须注明后背型号与序号；不能据此推断三型外板可无条件互换。');
      frame(g,110,105,57,57,2,[10,0,20]);
      const screwPositions=classic?[[-40,-46],[10,-47],[60,-46],[-40,46],[10,47],[60,46],[-40,0]]:[[-40,-46],[10,-47],[60,-46],[-40,46],[10,47],[60,46],[-40,0],[60,0],[49,30]];
      screws(g,screwPositions.map(([x,y])=>[x,y,21.5]));
      for(const x of [-20,40])box(g,7,3,4,[x,-47,22],'steel');
      if(!classic){for(const x of [-32,51])box(g,5,2,.7,[x,40,21.5],'black');}
      g=part('dark-slide',plus?'PolaPlus 带定位孔插刀':'即时片插刀',plus?'Z41126':'Z41122',classic?[56,57]:plus?[58,59]:[60,61],[92,0,79]);
      const slide=new T.Shape();slide.moveTo(-44,-42);slide.lineTo(44,-42);slide.lineTo(44,44);slide.lineTo(-42,44);slide.quadraticCurveTo(-48,44,-47,38);slide.lineTo(-43,30);slide.lineTo(-43,-29);slide.quadraticCurveTo(-50,-41,-44,-42);
      if(plus){for(const [x,y] of [[-38,38],[21,38]]){const p=new T.Path();p.absarc(x,y,1.2,0,Math.PI*2,true);slide.holes.push(p);}}
      const geo=new T.ExtrudeGeometry(slide,{depth:.45,bevelEnabled:false});mesh(g,geo,'steel',[10,0,18]);
      frame(g,5,74,2.5,67,3,[57,0,18],'black');
      g=part('light-trap','插刀光阱与遮光薄片','14195 / 302406',pages,[-32,0,69]);box(g,4,84,2,[-34,0,17],'rubber');box(g,6,84,.25,[-38,0,16],'black');
      g=part('locking-arm','暗插锁止臂及弹簧','302103 / 814704',pages,[-18,45,32]);box(g,63,3,2,[0,39,10],'steel');cyl(g,3,3,[-29,39,10],'steel','z');spring(g,[-32,42,10],'x',1.4,7,5);
      g=part('locking-spring','框板锁定簧片','303402',pages,[0,-39,57]);line(g,[[-18,-38,8],[-14,-35,9],[6,-35,7],[10,-38,8]],.75);
      if(!classic){g=part('detent','锁止钢珠与弹簧','809120 / 815604',pages,[-37,50,42],'PolaBasic 未单列零件与PolaPlus相同（PDF61），所以两型均保留该机构。');mesh(g,new T.SphereGeometry(1.4,16,12),'chrome',[-27,40,10]);spring(g,[-22,40,10],'x',1.1,6,4);}
      g=part('clamp','片盒固定夹','303403',pages,[-47,0,0]);plate(g,18,103,6,[-74,0,-1],'black','z',[[0,0,10,83,3]],4);box(g,22,5,13,[-76,0,3],'black');ribbed(g,12,12,[-74,46,3]);
      g=part('developing-mechanism','显影压辊总成','302427',pages,[-94,0,0],'手册按 Developing mechanism 总成提供；两根滚轮用于总成识别，未虚构独立子件编号或压辊间隙。');
      for(const y of [-49,49])plate(g,25,26,4,[-86,y,3],'black','y',[[1,-4,1.5],[1,6,1.5]],4);
      box(g,4,98,5,[-96,0,-5],'black');
      for(const z of [-1,9]){cyl(g,4,91,[-85,0,z],'chrome','y');cyl(g,1.2,99,[-85,0,z],'steel','y');for(const y of [-46,46]){ring(g,4.2,1.2,1.1,[-85,y,z],'steel','y');ring(g,2.2,1.2,.5,[-85,y+(y<0?-1:1),z],'chrome','y');}}
      box(g,2,88,13,[-98,0,3],'black');plate(g,13,30,.6,[-94,12,11.5],'ivory');
      g=part('perimeter-fasteners','内承板固定螺钉',classic?'823755':'829845',pages,[0,0,128]);screws(g,[[-58,-46,7],[0,-47,7],[59,-46,7],[-58,46,7],[0,47,7],[59,46,7],[-58,0,7],[59,0,7]]);
    }

    if(model==='MAGAZINE70')longRoll();else if(model.startsWith('POLA'))instant();else rollFilm();
    root.userData={modelId:model,estimated:true,source:'Film Magazines service manual',boundary:BOUNDARY};
    for(const p of parts){p.group.userData.name=p.name;p.group.userData.number=p.number;p.group.userData.pages=p.pages;p.group.userData.spread=p.spread.slice();}
    root.updateMatrixWorld(true);
    return {root,parts,boundary:BOUNDARY,modelId:model};
  }
  buildManualMagazineModel.modelIds = IDS.slice();
  global.buildManualMagazineModel = buildManualMagazineModel;
})(typeof window !== 'undefined' ? window : globalThis);
