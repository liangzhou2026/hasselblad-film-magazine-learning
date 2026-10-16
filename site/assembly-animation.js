/* Installation is a separate translation of service-sequences.js, not reversed
 * disassembly. Before every apply(), the controller restores zero positions and
 * the final disassembly state, then applies ONLY earlier assembly add lists.
 * Offsets are assembly-space teaching separation, never manufacturing geometry.
 */
(() => {
 'use strict';
 const boundary='安装动画只表达认件与先后层次；位移、孔位及间隙为示意，不验证真实装配路线、齿轮相位、弹簧预紧、片距或检查合格。';
 const track=(ids,start,end,from,to=[0,0,0],showAt=start,preview=false)=>({ids:Array.isArray(ids)?ids:[ids],start,end,from,to,showAt,preview});
 const phase=(start,text,focus)=>({start,text,focus});
 const definition=(tracks,phases,extra='',retainedIds=[])=>({tracks,phases,retainedIds,boundary:boundary+(extra?' '+extra:'')});
 const holder=['insert','pressure','rollers','spools'];
 const center=['center','p_21548','p_814852','p_814803'];
 const gears=['p_308109','p_12215','p_816707','p_814303'];
 const springPack=['p_13030','p_14184','p_14185'];
 const plans={
  a01:definition([
   track('shell',3,29,[0,0,-84],[0,0,0],0),
   track('p_823013_shell_1',35,42,[-26,0,0]),
   track('p_823013_shell_2',46,53,[-26,0,0]),
   track('p_823013_shell_3',57,64,[-26,0,0]),
   track('p_823017_shell_1',68,75,[26,0,0]),
   track('p_823017_shell_2',79,86,[26,0,0]),
   track('p_shell_leather',90,98,[0,0,24])
  ],[
   phase(0,'先把对应版本外壳装到支架；螺钉尚未装回',['shell','support']),
   phase(35,'装回 3 枚 823013 与 2 枚 823017，逐枚显示便于清点',['p_823013_shell_1','p_823013_shell_2','p_823013_shell_3','p_823017_shell_1','p_823017_shell_2']),
   phase(90,'固定件就位后贴回螺钉处饰皮；粘接效果未模拟',['p_shell_leather'])
  ],'采用 1996 改型的五枚固定件；逐颗播放排序是教学清点顺序，不是原厂规定的拧紧次序或扭矩。'),
  a02:definition([
   track('p_21535',5,29,[0,0,35],[0,0,0],0),
   track('p_13820',37,60,[0,0,43]),track('p_13821',68,94,[0,0,51])
  ],[
   phase(0,'辨认并放回曝光联锁片',['p_21535']),
   phase(37,'放回联锁线簧，按原图核对挂接',['p_13820']),
   phase(68,'放回两片簧片；弯折与接触关系仍须实物核对',['p_13821'])
  ],'同一句内的逐件显示用于辨认，不增加原手册没有规定的施工要求。'),
  a03:definition([
   track('p_20843',8,12,[0,0,37],[0,0,37]),
   track('p_814752',18,42,[0,0,57],[0,0,37]),
   track(['p_20843','p_814752'],59,94,[0,0,37])
  ],[
   phase(0,'核对按钮与垫圈：本拆卸路线未取出它们，不重复假造拆装',['p_22356','p_810761']),
   phase(18,'在机外示意弹簧与锁止臂配合；按手册涂脂',['p_814752','p_20843']),
   phase(59,'将锁止臂组件接到按钮；挂钩细节未作物理求解',['p_20843','p_814752','p_22356'])
  ],'按钮和垫圈原来留在模型中。本步仅核对其套装关系；挂接与涂脂以 PDF 7 原图和实物为准。',['p_810761','p_22356']),
  a04:definition([
   track('p_20684',3,23,[0,0,40],[0,0,0],0),
   track('p_13508',29,30,[0,0,44],[0,0,44]),
   track('p_13067',33,55,[-12,0,61],[0,0,44]),
   track(['p_13067','p_13508'],65,96,[0,0,44])
  ],[
   phase(0,'先放回锁止簧',['p_20684']),
   phase(29,'辨认薄片与密封件；将密封件放入薄片内',['p_13508','p_13067']),
   phase(65,'两件作为配合组件装到支架上',['p_13067','p_13508'])
  ],'这里只示意包合次序，不模拟薄片折弯、密封压缩或替用材料尺寸。'),
  a05:definition([
   track('darkslide',5,27,[-86,0,0],[0,0,0],0),
   track('frontplate',37,64,[0,0,64]),track('p_823015',73,96,[0,0,24])
  ],[
   phase(0,'先用插刀把遮光组件保持在位',['darkslide','p_13067','p_13508']),
   phase(37,'装上前接合外板，保持密封件的位置',['frontplate']),
   phase(73,'再装外板的九枚螺钉；不表达规定扭矩',['p_823015'])
  ]),
  a06:definition([], [phase(0,'检查提示：实体插拔插刀并核验联锁；模型保持静止，未实机检查',['darkslide','p_21535','p_20843'])]),
  a07:definition([], [phase(0,'量规校准提示：按原图测量；屏幕尺寸不能测出 3.55 mm ± 0.05 mm，当前未验证',['frontplate','support'])]),
  a08:definition([track(['p_22277','p_814508'],27,94,[55,0,0])],[
   phase(0,'先对照图 4 的实心圆点涂脂；不把高亮面当作涂脂范围',['support']),
   phase(27,'再放入所选型号的释放臂及随件弹簧',['p_22277','p_814508'])
  ]),
  a09:definition([track(center,23,94,[62,0,0],[6,0,0])],[
   phase(0,'中央机构齿轮与轴少量点油；先读 PDF 8 原文',['p_21548']),
   phase(23,'先套到定位销上；本步停在略抬起位置，下一步才最终落位',['p_21548','p_814852','p_814803'])
  ],'离体点油在此用文字与原图说明，不显示油滴或虚构可见涂油范围。终点约 6 个模型单位的抬起量仅用于表达“尚未最终落位”。'),
  a10:definition([
   track(center,0,1,[6,0,0],[6,0,0],0),
   track('p_22371',8,43,[56,0,0],[0,0,0],0),
   track(center,54,94,[6,0,0])
  ],[
   phase(0,'延续上一步中央机构略抬起的状态，先装间距齿轮',['p_22371','p_21548']),
   phase(54,'间距轮就位后，再把中央机构放入支架轴毂',['p_21548','p_22371'])
  ]),
  a11:definition([track('p_816611',4,35,[48,0,0],[0,0,0],0)],[
   phase(0,'先把回零弹簧装入间距齿轮；只显示装配层次',['p_816611','p_22371']),
   phase(42,'预紧与回零核验：读本步原文和图 4、5；动画不转动齿轮或弹簧',['p_816611','p_22371'])
  ],'约 1½ 圈及观察方向只按原手册执行。动画无弹性求解，不验证预紧或回零。'),
  a12:definition([
   track(['p_22715','p_816502'],4,29,[55,0,0],[0,0,0],0),
   track('p_12819',39,62,[36,0,0]),track('p_814527',70,94,[20,0,0])
  ],[
   phase(0,'先放入摆臂及随件弹簧',['p_22715','p_816502']),
   phase(39,'轴涂脂后穿入；实际轴向配合以原图为准',['p_12819']),
   phase(70,'接回两根拉簧到原图 A 标记销；形变未模拟',['p_814527'])
  ]),
  a13:definition([], [phase(0,'只核对中央机构两根弹簧的挂接；它们已经随机构在位，不再次移入',['p_21548','p_814852','p_21494'])], '原文没有分别列出两根弹簧编号；不另造第二个零件或拉伸轨道。',['p_814852']),
  a14:definition([
   track('p_13806',5,44,[49,0,0],[0,0,0],0),track('p_824202',55,93,[26,0,0])
  ],[
   phase(0,'先放回计数盘，保留后续相位调整条件',['p_13806']),
   phase(55,'装三枚固定螺钉，手册要求此时不要过紧',['p_824202'])
  ],'示意落位不表示已达到最终拧紧力或自动停片相位。'),
  a15:definition([
   track(['p_20717','p_814307'],4,28,[52,0,0],[0,0,0],0),
   track('p_810802',36,60,[36,0,0]),track('p_817132',69,94,[27,0,0])
  ],[
   phase(0,'先装回止件及随件弹簧',['p_20717','p_814307']),
   phase(36,'随后放垫圈，保持正确叠放层次',['p_810802']),
   phase(69,'最后装卡簧；是否入槽锁定须实物确认',['p_817132'])
  ]),
  a16:definition([
   track('p_13030',0,1,[58,0,0],[58,0,0],0),
   track('p_14184',5,29,[79,0,0],[58,0,0]),
   track('p_14185',38,59,[94,0,0],[58,0,0]),
   track(springPack,67,96,[58,0,0])
  ],[
   phase(0,'在机外按图 6 放置弹簧壳与卷簧，卷簧保持示意形状',['p_13030','p_14184']),
   phase(31,'按图 6 涂脂；此处不模拟卷簧放卷或端部扣合',['p_14184']),
   phase(38,'再装轮毂，核对卷簧内端连接',['p_14185','p_14184']),
   phase(67,'把完整弹簧壳组件放回支架',['p_13030','p_14184','p_14185'])
  ],'组件同向归位只展示组装顺序，不能作为弹簧安装工具或预紧动作演示。'),
  a17:definition([
   track(gears,0,1,[64,0,0],[64,0,0],0,true),
   track('p_308426',0,1,[94,0,0],[94,0,0],0,true)
  ],[
   phase(0,'机外润滑观察：图 7 实心点用脂、空心点用油；总成尚未装回',gears),
   phase(48,'继续核对指定齿部内侧；终点仍保持离体，下一步才装齿轮组',['p_308109','p_308426'])
  ],'本步没有 add 动作。机外对象仅为临时观察，始终不计入已安装状态；切换步骤由控制器恢复累计安装状态。'),
  a18:definition([track(gears,56,95,[64,0,0])],[
   phase(0,'预紧提示：按图 8 规定保持回位弹簧壳位置；动画不执行旋转',['p_13030','p_14184']),
   phase(56,'保持位置后装入所选型号完整齿轮组；相位需另据图 8 核对',gears)
  ],'不按模型齿数或视角推算约 1½ 圈与安装相位；轴和上方小齿轮留待下一步。'),
  a19:definition([
   track('p_308426',5,31,[46,0,0],[0,0,0],0),
   track('p_12209',41,65,[44,0,0]),track('p_810926',74,96,[30,0,0])
  ],[
   phase(0,'先装传动轴：长销端朝内进入支架',['p_308426','p_308109']),
   phase(41,'随后装传动小齿轮；不虚构啮合旋转',['p_12209']),
   phase(74,'再把 810926 垫圈放到中央机构上',['p_810926','p_21548'])
  ]),
  a20:definition([
   track(['p_308485','p_816505'],4,31,[58,0,0],[0,0,0],0),
   track('p_823012_plate',41,66,[26,0,0]),track('p_810927',76,96,[33,0,0])
  ],[
   phase(0,'先装机构压板及随件止挡弹簧',['p_308485','p_816505']),
   phase(41,'用两枚机构压板螺钉固定',['p_823012_plate']),
   phase(76,'最后放压板上方的 810927 垫圈',['p_810927'])
  ]),
  a21:definition([
   track('p_816509',4,26,[44,0,0],[0,0,0],0),track('p_13031',65,96,[44,0,0])
  ],[
   phase(0,'先辨认指示件弹簧及原挂点',['p_816509']),
   phase(32,'约 1 圈预紧只用原文说明；原句未给旋转方向，动画不补造',['p_816509']),
   phase(65,'预紧关系核对后装指示件；落位画面不证明预紧合格',['p_13031','p_816509'])
  ]),
  a22:definition([], [phase(0,'自动停片校准：读当前型号本步要求；高亮仅用于认件，未模拟调节或判定相位',['p_12209','p_22277','p_22371','p_308485','p_13806'])], '机外预置、转动、止挡入槽、最终拧紧及胶片检验均须按原厂手册与实物完成。'),
  a23:definition([
   track(['cover','crank'],4,31,[86,0,0],[0,0,0],0),
   track('p_823012_cover',34,35,[0,0,0],[0,0,0]),
   track('p_823012_cover_1',38,49,[27,0,0]),
   track('p_823012_cover_2',55,66,[27,0,0]),
   track('p_823012_cover_3',72,83,[27,0,0]),
   track('p_cover_leather',89,98,[24,0,0])
  ],[
   phase(0,'先装回右侧盖与摇柄总成',['cover','crank']),
   phase(38,'再装三枚侧盖固定螺钉，逐枚显示便于清点',['p_823012_cover_1','p_823012_cover_2','p_823012_cover_3']),
   phase(89,'固定后贴回饰皮；对应收纳架版本另按实物核对',['p_cover_leather'])
  ],'三枚螺钉之间的显示顺序不是原厂规定的拧紧顺序；未模拟胶粘剥离、胶量或固定强度。'),
  a24:definition([track(holder,5,52,[-94,0,0],[0,0,0],0)],[
   phase(0,'将原配机械片芯作为完整总成装回',holder),
   phase(62,'首张停片检查：需要实体过片，当前画面未实机验证',['insert','crank'])
  ],'片芯、压片板、滚轴与卷轴座同时归位，不据此推导片芯内部逐件施工顺序。'),
  a25:definition([], [phase(0,'实体修后检查：机身联动、计数、曝光指示及抽片芯归零；模型静止，未验证',['p_13806','p_13031','insert'])]),
  a26:definition([], [phase(0,'试卷检查：用实体胶片核对每格位置与间距；当前未完成实体试卷验证',['insert','pressure','rollers','spools','p_22371','p_13806'])])
 };
 // The tracks also support older local pages without the imported fastener layer.
 const legacy={
  a01:definition([track('shell',6,88,[0,0,-84],[0,0,0],0)],[phase(0,'装回外壳；固定件与饰皮本版本未独立建模，请对照原图',['shell','support'])]),
  a23:definition([
   track(['cover','crank'],4,47,[86,0,0],[0,0,0],0),track('p_823012_cover',56,94,[27,0,0])
  ],[
   phase(0,'先装回右侧盖与摇柄总成',['cover','crank']),
   phase(56,'再装三枚侧盖螺钉，随后按原图贴回饰皮',['p_823012_cover'])
  ],'此版本未把三枚螺钉与饰皮各自独立建模，不宣称逐颗展示。')
 };
 const copy=value=>JSON.parse(JSON.stringify(value));
 function sourceStep(id){
  const source=window.A12_SEQUENCES?.assembly?.find(step=>step.id===id);
  if(!source)throw new Error('安装动画没有找到步骤：'+id);
  return source;
 }
 function getPlan(id){
  const source=sourceStep(id);
  const plan=id==='a01'&&!source.add.includes('p_shell_leather')?legacy.a01:id==='a23'&&!source.add.includes('p_cover_leather')?legacy.a23:plans[id];
  if(!plan)throw new Error('安装动画没有轨道：'+id);
  const phases=plan.phases.map(item=>({...item,focus:['a06','a07','a13','a22','a25','a26'].includes(id)?source.focus:item.focus}));
  return copy({id,tracks:plan.tracks,phases,retainedIds:plan.retainedIds,boundary:plan.boundary,add:[...source.add],pages:[...source.pages],kind:source.kind});
 }
 function normalizeProgress(value){const n=Number(value);return Number.isFinite(n)?Math.min(100,Math.max(0,n)):0;}
 function ramp(value,start,end){const n=Math.min(1,Math.max(0,(value-start)/(end-start)));return n*n*(3-2*n);}
 function sample(id,progress){
  const plan=getPlan(id),p=normalizeProgress(progress),transforms=new Map(),shown=new Set(),preview=new Set(),add=new Set(plan.add);
  for(const item of plan.tracks)for(const key of item.ids){
   // A subsequent track may hold a component off the back or finish a staged
   // placement. Before its start, preserve the earlier segment's absolute pose.
   if(!transforms.has(key)||p>=item.start){
    const amount=ramp(p,item.start,item.end);
    transforms.set(key,{id:key,offset:item.from.map((n,i)=>n+(item.to[i]-n)*amount)});
   }
   if(p>=item.showAt){if(item.preview)preview.add(key);else if(add.has(key))shown.add(key);}
  }
  let current=plan.phases[0];for(const item of plan.phases)if(p>=item.start)current=item;
  // Keep the precise final phase, particularly off-model lubrication/checks.
  // "Animation complete" must never replace it with a claim of successful repair.
  return {stepId:id,progress:p,transforms:[...transforms.values()],visibleIds:[...shown],previewIds:[...preview],retainedIds:[...plan.retainedIds],phase:current.text+(p>=100?' · 本段展示结束':''),focus:[...current.focus],boundary:plan.boundary};
 }
 function apply(ctx,id,progress){
  const sampled=sample(id,progress),groups=ctx?.groups;
  if(!groups)throw new Error('安装动画需要模型 groups。');
  const positions=new Map(sampled.transforms.map(item=>[item.id,item.offset]));
  for(const item of sampled.transforms){
   const g=groups[item.id];if(!g)continue;
   let parent=g.parent,ancestor=[0,0,0];
   while(parent){const key=parent.userData?.partId;if(positions.has(key)){ancestor=positions.get(key);break;}parent=parent.parent;}
   g.position.set(...item.offset.map((n,i)=>n-ancestor[i]));
  }
  // Reveal only explicitly staged parts and their required ancestors. Never
  // traverse/reveal an entire parent: later screws, washers and covers stay out.
  for(const key of [...sampled.visibleIds,...sampled.previewIds]){
   let g=groups[key];while(g){g.visible=true;g=g.parent;}
  }
  return sampled;
 }
 window.A12_ASSEMBLY={getPlan,sample,apply,boundary,stepIds:Object.keys(plans)};
})();
