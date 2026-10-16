/* Beginner lessons for the existing A12 model. Geometry and travel are illustrative.
 * This module has no DOM dependency. It does not rotate or unwind live mechanisms.
 * Sources refer to one-based PDF pages in the local Film Magazines service manual. */
(() => {
 'use strict';
 const boundary='动画位移仅用于分层观察，不代表真实取件路线、拆卸速度、弹簧释能、齿轮相位或预紧方法。请结合相应手册原图和实际零件。';
 const views={body:{theta:-.88,phi:1.13},front:{theta:-.68,phi:1.18},mechanism:{theta:-.76,phi:1.1}};
 const body=['shell','support','frontplate','seal','darkslide','cover','crank','insert','pressure','rollers','spools'];
 const holder=['insert','pressure','rollers','spools'];
 const seal=['frontplate','seal','p_22710'];
 const stop=['p_817132','p_810802','p_20717'];
 const lube=['p_21548','p_14184','p_308109'];
 function chapter(start,title,caption,focus,pages,visible,view,fitIds=visible){return {start,title,caption,focus,pages,visible,view,fitIds};}
 const lessons=[
  {
   id:'empty-back',title:'01 · 空后背认件与清洁位置',duration:28,pages:[5,23,24],
   description:'先认插刀与片芯总成，再看压片板和滚轴。移动只用于看清相互位置。',
   boundary,
   chapters:[
    chapter(0,'确认空后背','先确认胶片已经取尽。装片状态下不要为了清洁抽出片芯；此课只展示空后背的认件位置。',['darkslide','insert'],[5,23,24],body,views.body),
    chapter(6,'插刀与片芯是不同部件','插刀是一片薄板；片芯包含压片板、滚轴和卷轴支承。向外平移仅为看清零件，不表示取件操作路线。',['darkslide'],[5,23,24],body,views.body),
    chapter(12,'把片芯作为总成观察','片芯、压片板、滚轴和卷轴支承一起展示；这里没有把片芯拆散。日常清洁也不需要把这些部件逐件拆下。',holder,[5,23,24],body,views.body),
    chapter(20,'查看胶片接触区域','认清压片板和滚轴表面。空后背清除浮尘，胶片接触面保持洁净干燥；这些位置不作油脂涂布演示。',['pressure','rollers'],[23,24],holder,views.body)
   ]
  },
  {
   id:'light-trap',title:'02 · 外板与插刀口遮光结构',duration:28,pages:[5,7,12,13,14],
   description:'看清九枚外板螺钉、遮光薄片 13508 和遮光件 13067 的层次。',
   boundary,
   chapters:[
    chapter(0,'先认外板的九枚固定螺钉','外板由九枚 823015 螺钉固定。模型按一组标识九枚螺钉；实际拆下应按各自孔位收存。',['p_823015','p_40380'],[5,12,14],seal,views.front),
    chapter(7,'外板遮住了内部结构','此处慢速拉开外板和螺钉，仅展示遮挡关系。真实操作还涉及联锁零件与弹簧，先阅读手册第 5、7 页。',['p_40380','p_823015'],[5,7],seal,views.front),
    chapter(14,'薄片包住遮光件','13508 是折叠薄片，13067 是遮光件。现在将两件分层供观察；不是示范拉扯或展开旧密封材料。',['p_13508','p_13067'],[5,7,12,13],seal,views.front),
    chapter(21,'检查折叠关系与密封状态','对照原图和拆前照片确认方向。遮光材料不涂油；装回外板后，还应按手册检查插刀相关联锁动作。',['p_13508','p_13067'],[7],seal,views.front)
   ]
  },
  {
   id:'return-stop',title:'03 · 卡簧、垫圈与回位止挡',duration:26,pages:[5,8,12,14],
   description:'近看 817132 卡簧、810802 垫圈和 20717 回位止挡，理解三个零件的叠放关系。',
   boundary,
   chapters:[
    chapter(0,'先把三个编号对上实物','817132 是开口卡簧，810802 是垫圈，20717 是回位止挡。先认编号，再看它们的相对层次。',stop,[5,12,14],stop,views.mechanism),
    chapter(7,'卡簧的独立外形','将卡簧移开以看清开口。此动作不是卡簧取出的方向或工具示范；实际拆下时应防止小件弹失。',['p_817132'],[5,12,14],stop,views.mechanism),
    chapter(13,'垫圈位于卡簧与止挡之间','薄垫圈很容易遗漏。手册拆卸文字列出卡簧、垫圈、止挡；分层距离只是为了让三者容易辨认。',['p_810802'],[5,12,14],stop,views.mechanism),
    chapter(19,'回到装配关系检查','安装时按手册装回止挡和垫圈，再用卡簧固定。相关弹簧的挂接状态须另看原图，本动画没有模拟弹簧加载。',stop,[8,12,14],stop,views.mechanism)
   ]
  },
  {
   id:'lubrication',title:'04 · 对照原图认油与脂',duration:28,pages:[8,9],
   description:'定位中心机构、扁带发条和过片齿轮总成；再按手册图区分润滑油与润滑脂。',
   boundary:boundary+' 润滑只作资料索引，动画中不添加推测性的油滴、涂布区域或用量。',
   chapters:[
    chapter(0,'先认机构，再找原图标记','这里分开展示三个机构，只帮助认件。三维表面不是润滑范围图，不能把所有齿轮或轴一概涂脂。',lube,[8,9],lube,views.mechanism),
    chapter(6,'中心机构 21548','手册第 8 页：中心机构的齿轮与轴用少量润滑油。请核对原图和清洁状态；这里不推断每个接触点的具体滴油位置。',['p_21548'],[8],lube,views.mechanism),
    chapter(13,'扁带发条 14184','手册第 8 页图 6 的标记指定 L32 润滑脂。发条预紧属于安装调整，本课保持发条静止，不用动画猜测旋向或圈数。',['p_14184'],[8],lube,views.mechanism),
    chapter(20,'图 7 区分油和脂','第 9 页图 7：实心点为 ISOFLEX TOPAS L32，空心点为 PDP 48；特别标记的齿部内侧按原图润滑，不能把全部外齿涂满。',['p_308109'],[9],lube,views.mechanism)
   ]
  }
 ];
 function clamp(n,min,max){return Math.min(max,Math.max(min,n));}
 function ramp(t,start,end){const u=clamp((t-start)/(end-start),0,1);return u*u*(3-2*u);}
 window.createA12BeginnerAnimation=function(ctx){
  const {groups,pickables=[]}=ctx;
  if(!groups)throw new Error('A12 动画需要模型 groups。');
  const raf=ctx.requestAnimationFrame||globalThis.requestAnimationFrame?.bind(globalThis);
  const caf=ctx.cancelAnimationFrame||globalThis.cancelAnimationFrame?.bind(globalThis);
  if(!raf||!caf)throw new Error('A12 动画需要 requestAnimationFrame / cancelAnimationFrame。');
  let active=null,time=0,playing=false,speed=1,frame=null,lastStamp=null,epoch=0,lastChapter=-1,snapshot=null;
  function owner(o){while(o&&!o.userData?.partId)o=o.parent;return o?.userData?.partId;}
  function within(id,ancestor){let g=groups[id];while(g){if(g.userData?.partId===ancestor)return true;g=g.parent;}return false;}
  function currentChapter(){if(!active)return null;let index=0;for(let i=1;i<active.chapters.length;i++)if(time>=active.chapters[i].start)index=i;return {index,data:active.chapters[index]};}
  function getState(){
   const ch=currentChapter();
   return {lessonId:active?.id||null,time,duration:active?.duration||0,playing,speed,chapter:ch?.index??-1,title:ch?.data.title||'',caption:ch?.data.caption||'',focus:ch?[...ch.data.focus]:[],pages:ch?[...ch.data.pages]:[],progress:active?time/active.duration:0,boundary:active?.boundary||boundary};
  }
  function notify(){ctx.onUpdate?.(getState());}
  function save(){
   snapshot={groups:Object.values(groups).map(g=>({g,position:g.position.clone(),visible:g.visible})),meshes:pickables.map(m=>({m,visible:m.visible,material:m.material}))};
  }
  function restore(){
   if(!snapshot)return;
   for(const s of snapshot.groups){s.g.position.copy(s.position);s.g.visible=s.visible;}
   for(const s of snapshot.meshes){s.m.visible=s.visible;s.m.material=s.material;}
   snapshot=null;
  }
  function offset(id,x=0,y=0,z=0){if(groups[id])groups[id].position.set(x,y,z);}
  function pose(){
   if(!active)return;
   const ch=currentChapter(),c=ch.data;
   if(ch.index!==lastChapter){lastChapter=ch.index;ctx.activate?.({lessonId:active.id,chapter:ch.index,focus:[...c.focus],fitIds:[...c.fitIds],view:{...c.view}});}
   for(const g of Object.values(groups)){g.position.set(0,0,0);g.visible=true;}
   for(const m of pickables){const id=owner(m);m.visible=!m.userData?.hotspot&&!(active.id==='empty-back'&&m.userData?.teachingFilm)&&!!id&&c.visible.some(p=>within(id,p));}
   if(active.id==='empty-back'){
    offset('darkslide',-70*ramp(time,6,10));
    for(const id of holder)offset(id,-95*ramp(time,12,18));
   }else if(active.id==='light-trap'){
    offset('frontplate',0,0,13*ramp(time,7,12));
    offset('p_823015',0,0,22*ramp(time,7,10));
    offset('p_13508',0,0,35*ramp(time,14,19));
    offset('p_13067',-12*ramp(time,15,20),0,50*ramp(time,15,20));
   }else if(active.id==='return-stop'){
    offset('p_817132',14*ramp(time,7,12));
    offset('p_810802',8*ramp(time,13,18));
   }else if(active.id==='lubrication'){
    const f=ramp(time,0,4);offset('p_21548',0,-8*f);offset('p_14184',-8*f,8*f,17*f);offset('p_308109',19*f,8*f,-16*f);
   }
   ctx.highlight?.([...c.focus]);ctx.render?.();notify();
  }
  function cancel(){epoch++;if(frame!==null)caf(frame);frame=null;lastStamp=null;}
  function queue(){const ticket=epoch;frame=raf(stamp=>tick(stamp,ticket));}
  function tick(stamp,ticket){
   if(ticket!==epoch||!playing||!active)return;
   frame=null;
   if(lastStamp!==null)time=clamp(time+Math.max(0,stamp-lastStamp)/1000*speed,0,active.duration);
   lastStamp=stamp;
   if(time>=active.duration){playing=false;lastStamp=null;}
   pose();if(playing)queue();
  }
  function start(id){
   const next=lessons.find(l=>l.id===id);if(!next)throw new Error('未知 A12 动画：'+id);
   const required=[...new Set(next.chapters.flatMap(c=>[...c.visible,...c.focus]))];
   const missing=required.filter(p=>!groups[p]);if(missing.length)throw new Error('A12 动画缺少零件：'+missing.join(', '));
   cancel();if(!snapshot)save();active=next;time=0;lastChapter=-1;playing=true;pose();queue();return getState();
  }
  function seek(seconds){if(!active)return getState();const value=Number(seconds);if(!Number.isFinite(value))return getState();cancel();time=clamp(value,0,active.duration);if(time===active.duration)playing=false;pose();if(playing)queue();return getState();}
  function play(){if(!active)return getState();if(playing)return getState();cancel();if(time>=active.duration){time=0;lastChapter=-1;}playing=true;pose();queue();return getState();}
  function pause(){cancel();playing=false;notify();return getState();}
  function stop(){cancel();playing=false;restore();active=null;time=0;lastChapter=-1;ctx.render?.();notify();ctx.onExit?.();return getState();}
  function setSpeed(value){const n=Number(value);if(Number.isFinite(n)&&n>0){speed=clamp(n,.25,2);lastStamp=null;notify();}return getState();}
  return {lessons,start,seek,play,pause,stop,setSpeed,getState};
 };
})();
