/* Deterministic, DOM-free animation of the existing 22-step magazine sequence.
 * Identity/sequence: service-sequences.js. Travel is for viewing, not a tool path.
 * Before every apply: restore zero group positions and step-start visibility,
 * then apply all earlier steps' explicit remove lists. No rotations are inferred.
 */
(() => {
 'use strict';
 const boundary='沿轴位移仅用于看清层次；没有模拟取件工具、弹簧释能、旋出圈数或实际装配间隙。';
 const track=(ids,start,end,offset,hide=true)=>({ids:Array.isArray(ids)?ids:[ids],start,end,offset,hide});
 const phase=(start,text,focus)=>({start,text,focus});
 const definition=(tracks,phases,extra='')=>({tracks,phases,boundary:boundary+(extra?' '+extra:'')});
 const holder=['insert','pressure','rollers','spools'];
 const plans={
  d01:definition([
   track('darkslide',5,35,[-86,0,0]),track(holder,42,94,[-94,0,0])
  ],[
   phase(0,'先确认空后背；插刀先于片芯取出',['darkslide','insert']),
   phase(5,'抽出插刀；片芯此时仍在壳体内',['darkslide']),
   phase(42,'将片芯、压片板、滚轴及卷轴座作为一个总成取出',holder)
  ]),
  d02:definition([
   track('p_cover_leather',3,22,[24,0,0]),
   track('p_823012_cover_1',27,37,[27,0,0]),
   track('p_823012_cover_2',42,52,[27,0,0]),
   track('p_823012_cover_3',57,67,[27,0,0]),
   track(['cover','crank'],74,96,[86,0,0])
  ],[
   phase(0,'先核对收纳架版本，揭开遮住螺钉的侧盖饰皮',['p_cover_leather']),
   phase(27,'取侧盖示意 1：823012（画面识别号，不是原厂孔号）',['p_823012_cover_1']),
   phase(42,'取侧盖示意 2：823012；三枚分别收存',['p_823012_cover_2']),
   phase(57,'取侧盖示意 3：823012；确认三枚全部解除',['p_823012_cover_3']),
   phase(74,'再取下侧盖，摇柄随侧盖总成移开',['cover','crank'])
  ],'饰皮以平移展示揭开先后，不模拟胶粘剥离。1–3 只是画面识别号，三枚之间的播放排序不代表原厂规定。'),
  d03:definition([track('p_810927',12,90,[33,0,0])],[phase(0,'辨认压板上方的 810927 垫圈并取下',['p_810927'])]),
  d04:definition([
   track('p_823012_plate',8,40,[26,0,0]),track(['p_308485','p_816505'],49,94,[58,0,0])
  ],[
   phase(0,'先取机构压板的 2 枚 823012；不是侧盖上的 3 枚',['p_823012_plate']),
   phase(49,'抬离机构压板；止挡弹簧随压板展示',['p_308485','p_816505'])
  ]),
  d05:definition([track('p_12209',10,92,[44,0,0])],[phase(0,'取下传动小齿轮，保留拆前相位记录',['p_12209'])]),
  d06:definition([
   track('p_308426',7,37,[46,0,0]),track(['p_308109','p_12215','p_816707','p_814303'],46,94,[62,0,0])
  ],[
   phase(0,'先抽出传动轴；齿轮总成保持原位',['p_308426']),
   phase(46,'取下完整过片齿轮总成，不拆散图 7 内部层次',['p_308109','p_12215','p_816707','p_814303'])
  ]),
  d07:definition([
   track(['p_13030','p_14185','p_14184'],20,42,[18,0,0],false),
   track('p_13030',48,66,[48,0,0]),track('p_14185',68,82,[57,0,0]),track('p_14184',84,96,[63,0,0])
  ],[
   phase(0,'先阅读卷簧预紧说明；本段不示范释能',['p_13030','p_14185','p_14184']),
   phase(20,'抬起整个回位弹簧组件（仅分层观察）',['p_13030','p_14185','p_14184']),
   phase(48,'分开弹簧壳与轮毂，保留预紧记录',['p_13030','p_14185']),
   phase(84,'辨认卷簧本体；保持原形，不模拟放卷',['p_14184'])
  ],'手册拆卸段没有给出独立的安全释能工艺，本动画不补造释能动作。'),
  d08:definition([
   track('p_817132',7,29,[27,0,0]),track('p_810802',35,57,[36,0,0]),track(['p_20717','p_814307'],65,94,[52,0,0])
  ],[
   phase(0,'先取开口卡簧；直线分离只表示层次',['p_817132']),
   phase(35,'再取垫圈，保存卡簧与垫圈的叠放关系',['p_810802']),
   phase(65,'取下回位止挡及随件展示的弹簧',['p_20717','p_814307'])
  ]),
  d09:definition([track('p_810926',7,40,[30,0,0])],[
   phase(0,'取下中心机构垫圈 810926',['p_810926']),
   phase(48,'将 814852 从连杆 21494 脱钩；两件仍留在模型中',['p_814852','p_21494'])
  ],'脱钩用高亮和原图说明，不等于取走整根弹簧或连杆。'),
  d10:definition([], [phase(0,'对照原图 A 挂点，解除两根 814527 的挂接；不移走弹簧',['p_814527'])], '弹簧没有建立可验证的弹性形变或挂接求解。'),
  d11:definition([track(['p_13031','p_816509'],12,93,[44,0,0])],[phase(0,'取下曝光指示件；弹簧随件展示，不演示预紧释放',['p_13031','p_816509'])]),
  d12:definition([
   track('p_824202',6,30,[26,0,0]),track('p_13806',37,65,[49,0,0]),track('p_816611',72,95,[58,0,0])
  ],[
   phase(0,'先取计数盘的 3 枚 824202 螺钉',['p_824202']),
   phase(37,'提起计数盘；原盘角度需另作记录',['p_13806']),
   phase(72,'取出盘下回零弹簧；不模拟预紧释放',['p_816611'])
  ]),
  d13:definition([
   track('p_12819',7,39,[36,0,0]),track(['p_22715','p_816502'],48,94,[55,0,0])
  ],[
   phase(0,'先抽出摆臂轴 12819',['p_12819']),
   phase(48,'再取摆臂；已脱钩的 814527 仍保留待后续步骤',['p_22715','p_816502','p_814527'])
  ]),
  d14:definition([
   track('p_21548',8,32,[6,0,0],false),track('p_22371',45,94,[56,0,0])
  ],[
   phase(0,'中央机构先略微抬离轴毂；实际侧转未模拟',['p_21548']),
   phase(45,'先取间距齿轮，中央机构本步暂不取走',['p_22371','p_21548'])
  ]),
  d15:definition([
   track(['center','p_21548','p_814852','p_814803'],7,45,[62,0,0]),
   track(['p_22277','p_814508','p_814527'],55,94,[55,0,0])
  ],[
   phase(0,'先取中央机构及其随件弹簧',['p_21548','p_814852','p_814803']),
   phase(55,'再取释放臂及本步列出的弹簧',['p_22277','p_814508','p_814527'])
  ]),
  d16:definition([
   track('p_823015',7,43,[0,0,24]),track('frontplate',53,95,[0,0,64])
  ],[
   phase(0,'取下前外板的 9 枚 823015，按原孔位保存',['p_823015']),
   phase(53,'提离前外板，露出遮光与联锁结构',['frontplate'])
  ]),
  d17:definition([track(['p_13067','p_13508'],10,94,[0,0,50])],[phase(0,'取出配合的遮光件与薄片，保持包合关系观察',['p_13067','p_13508'])]),
  d18:definition([
   track('p_21535',7,29,[0,0,30]),track('p_13820',35,57,[0,0,38]),track('p_13821',65,94,[0,0,46])
  ],[
   phase(0,'先取曝光联锁片',['p_21535']),phase(35,'再取联锁线簧',['p_13820']),phase(65,'收好 2 片联锁板簧',['p_13821'])
  ]),
  d19:definition([track('p_20684',12,93,[0,0,40])],[phase(0,'取下锁定薄片弹簧，记录原来的弯折与朝向',['p_20684'])]),
  d20:definition([
   track('p_20843',10,48,[0,0,27],false),track('p_814752',57,94,[0,0,40])
  ],[
   phase(0,'先使锁止臂离开按钮；按钮与垫圈仍留在原位',['p_20843','p_22356']),
   phase(57,'再将弹簧从锁止臂脱开并按本步收存',['p_814752','p_20843'])
  ]),
  d21:definition([
   track('p_shell_leather',3,19,[0,0,24]),
   track('p_823013_shell_1',24,34,[-26,0,0]),
   track('p_823013_shell_2',39,49,[-26,0,0]),
   track('p_823013_shell_3',54,64,[-26,0,0]),
   track('p_823017_shell_1',70,80,[26,0,0]),
   track('p_823017_shell_2',85,95,[26,0,0])
  ],[
   phase(0,'核对 1996 改型壳体；先揭开螺钉处的局部饰皮',['p_shell_leather']),
   phase(24,'核对 3 枚 823013 · 取壳体示意 1',['p_823013_shell_1']),
   phase(39,'核对 3 枚 823013 · 取壳体示意 2',['p_823013_shell_2']),
   phase(54,'核对 3 枚 823013 · 取壳体示意 3',['p_823013_shell_3']),
   phase(70,'核对 2 枚 823017 · 取壳体示意 4',['p_823017_shell_1']),
   phase(85,'核对 2 枚 823017 · 取壳体示意 5',['p_823017_shell_2'])
  ],'3 枚与 2 枚分段仅用于清点，不声明原厂规定了这两组或各螺钉之间的先后顺序。孔位及饰皮区域为估算；壳体本步保持原位。'),
  d22:definition([track('shell',14,94,[0,0,-84])],[phase(0,'对应壳体的固定件全部解除后，分离外壳与支架',['shell','support'])])
 };
 // Existing archive pages can still load the player without the detail builder.
 // Never describe absent leather / shell-screw geometry as animated.
 const legacy={
  d02:definition([track('p_823012_cover',26,56,[27,0,0]),track(['cover','crank'],64,95,[86,0,0])],[
   phase(0,'先核对收纳架版本，并揭开侧盖饰皮（本版本未独立建模）',['cover']),
   phase(26,'取出侧盖的 3 枚 823012 螺钉',['p_823012_cover']),
   phase(64,'取下侧盖，摇柄随侧盖总成移开',['cover','crank'])
  ]),
  d21:definition([],[
   phase(0,'核对 1996 改型壳体；饰皮揭开仅用原图说明',['shell']),
   phase(25,'核对 3 枚 823013；本版本没有独立螺钉组',['shell','support']),
   phase(63,'核对 2 枚 823017；孔位仍需实物确认',['shell','support'])
  ])
 };
 const copy=value=>JSON.parse(JSON.stringify(value));
 function sourceStep(id){
  const step=window.A12_SEQUENCES?.disassembly?.find(item=>item.id===id);
  if(!step)throw new Error('拆卸动画没有找到步骤：'+id);
  return step;
 }
 function getPlan(id){
  const source=sourceStep(id),plan=id==='d02'&&!source.remove.includes('p_cover_leather')?legacy.d02:id==='d21'&&!source.remove.includes('p_shell_leather')?legacy.d21:plans[id];
  if(!plan)throw new Error('拆卸动画没有轨道：'+id);
  return copy({id,tracks:plan.tracks,phases:plan.phases,boundary:plan.boundary,remove:[...source.remove],pages:[...source.pages]});
 }
 function normalizeProgress(value){const n=Number(value);return Number.isFinite(n)?Math.min(100,Math.max(0,n)):0;}
 function ramp(value,start,end){const n=Math.min(1,Math.max(0,(value-start)/(end-start)));return n*n*(3-2*n);}
 function sample(id,progress){
  const source=sourceStep(id),plan=getPlan(id),p=normalizeProgress(progress),transforms=new Map(),hidden=new Set(),removable=new Set(source.remove);
  for(const item of plan.tracks){
   const amount=ramp(p,item.start,item.end);
   for(const key of item.ids){
    // Later stages for the same object interpolate from the previous end pose.
    // This preserves the raised spring assembly while its pieces are separated.
    const previous=transforms.get(key)?.offset||[0,0,0];
    const offset=item.offset.map((n,i)=>previous[i]+(n-previous[i])*amount);
    transforms.set(key,{id:key,offset});
    if(item.hide&&p>=item.end&&removable.has(key))hidden.add(key);
   }
  }
  if(p>=100)for(const key of removable)hidden.add(key);
  let current=plan.phases[0];for(const item of plan.phases)if(p>=item.start)current=item;
  const completed=id==='d22'?'本路线完成 · 仍需独立的安装、润滑与检查流程':'本步展示完成 · 可继续下一步';
  return {stepId:id,progress:p,transforms:[...transforms.values()],hiddenIds:[...hidden],phase:p>=100?completed:current.text,focus:[...current.focus],boundary:plan.boundary};
 }
 function apply(ctx,id,progress){
  const sampled=sample(id,progress),groups=ctx?.groups;
  if(!groups)throw new Error('拆卸动画需要模型 groups。');
  const positions=new Map(sampled.transforms.map(t=>[t.id,t.offset]));
  for(const item of sampled.transforms){
   const group=groups[item.id];if(!group)continue;
   // Each offset denotes assembly-space displacement. Subtract the nearest
   // animated ancestor's target to prevent parent+child movement being doubled.
   let parent=group.parent,ancestor=[0,0,0];
   while(parent){const key=parent.userData?.partId;if(positions.has(key)){ancestor=positions.get(key);break;}parent=parent.parent;}
   group.position.set(...item.offset.map((n,i)=>n-ancestor[i]));
  }
  for(const key of sampled.hiddenIds)if(groups[key])groups[key].visible=false;
  return sampled;
 }
 window.A12_DISASSEMBLY={getPlan,sample,apply,boundary,stepIds:Object.keys(plans)};
})();
